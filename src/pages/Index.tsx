import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import FlintCard from "@/components/FlintCard";
import { Flame, Plus, MessageCircle, User, Globe, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import NotificationBell from "@/components/NotificationBell";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullIndicator from "@/components/PullIndicator";

interface Flint {
  id: string;
  author_id: string;
  content: string;
  category: string;
  created_at: string;
  expires_at: string | null;
  is_saved: boolean;
  agree_count: number;
  disagree_count: number;
  author_labs_id?: string;
  _author_country?: string | null;
}

const CATEGORIES = ["All", "Life", "Politics", "Relationship", "Religion", "Other"];

const Index = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [flints, setFlints] = useState<Flint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [feedMode, setFeedMode] = useState<"global" | "country">("global");
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [activeClashes, setActiveClashes] = useState<Record<string, { id: string; viewerCount: number }>>({});

  // Fetch user preferences
  useEffect(() => {
    if (!user) return;
    supabase
      .from("users")
      .select("country, interests")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setUserCountry((data as any).country);
          setUserInterests((data as any).interests || []);
        }
      });
  }, [user]);

  const fetchFlints = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("flints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load flints", variant: "destructive" });
      return;
    }

    const flintsList = data || [];
    const flintIds = flintsList.map((f: Flint) => f.id);
    const authorIds = [...new Set(flintsList.map((f: Flint) => f.author_id))];

    // Batch: authors, user votes, comment counts — all in parallel
    const [authorsRes, votesRes, commentsRes] = await Promise.all([
      authorIds.length > 0
        ? supabase.from("users").select("id, labs_id, country").in("id", authorIds)
        : Promise.resolve({ data: [] }),
      flintIds.length > 0
        ? supabase.from("votes").select("flint_id, vote_type").eq("user_id", user.id).in("flint_id", flintIds)
        : Promise.resolve({ data: [] }),
      flintIds.length > 0
        ? supabase.from("comments").select("flint_id").in("flint_id", flintIds)
        : Promise.resolve({ data: [] }),
    ]);

    const authorsMap: Record<string, { labs_id: string; country: string | null }> = {};
    if (authorsRes.data) {
      for (const a of authorsRes.data as any[]) {
        authorsMap[a.id] = { labs_id: a.labs_id, country: a.country };
      }
    }

    const votesMap: Record<string, string> = {};
    if (votesRes.data) {
      for (const v of votesRes.data as any[]) {
        votesMap[v.flint_id] = v.vote_type;
      }
    }

    const countsMap: Record<string, number> = {};
    if (commentsRes.data) {
      for (const c of commentsRes.data as any[]) {
        countsMap[c.flint_id] = (countsMap[c.flint_id] || 0) + 1;
      }
    }

    const flintsWithAuthors = flintsList.map((f: Flint) => ({
      ...f,
      author_labs_id: authorsMap[f.author_id]?.labs_id || "LabsID_???",
      _author_country: authorsMap[f.author_id]?.country || null,
    }));

    setFlints(flintsWithAuthors);
    setUserVotes(votesMap);
    setCommentCounts(countsMap);
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchFlints();
  }, [fetchFlints]);

  // Smart feed with memoization
  const filteredFlints = useMemo(() => {
    let feed = flints;

    if (feedMode === "country" && userCountry) {
      feed = feed.filter((f: any) => f._author_country === userCountry);
    }

    if (activeCategory !== "All") {
      feed = feed.filter((f) => f.category === activeCategory);
    }

    if (activeCategory === "All" && userInterests.length > 0) {
      const preferred = feed.filter((f) => userInterests.includes(f.category));
      const random = feed.filter((f) => !userInterests.includes(f.category));
      const result: Flint[] = [];
      let pi = 0, ri = 0;
      while (pi < preferred.length || ri < random.length) {
        for (let i = 0; i < 7 && pi < preferred.length; i++) result.push(preferred[pi++]);
        for (let i = 0; i < 3 && ri < random.length; i++) result.push(random[ri++]);
      }
      return result;
    }

    return feed;
  }, [flints, feedMode, userCountry, activeCategory, userInterests]);

  const { containerRef, pullDistance, refreshing, handlers } = usePullToRefresh({
    onRefresh: fetchFlints,
  });

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen flex-col bg-background pb-20 overflow-y-auto"
      {...handlers}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Flintyo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-border bg-card overflow-hidden">
              <button
                onClick={() => setFeedMode("global")}
                className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  feedMode === "global"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe className="h-3 w-3" />
                Global
              </button>
              <button
                onClick={() => setFeedMode("country")}
                className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  feedMode === "country"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MapPin className="h-3 w-3" />
                {userCountry || "Country"}
              </button>
            </div>
            <NotificationBell />
            <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="sticky top-[53px] z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex gap-1 overflow-x-auto px-4 py-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <PullIndicator pullDistance={pullDistance} refreshing={refreshing} />

      {/* Feed */}
      <main className="flex-1 px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredFlints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Flame className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {feedMode === "country" ? `No flints from ${userCountry} yet.` : "No flints yet. Be the first to spark one!"}
            </p>
          </div>
        ) : (
          filteredFlints.map((flint) => (
            <FlintCard
              key={flint.id}
              flint={flint}
              currentUserId={user?.id || ""}
              userVote={userVotes[flint.id] || null}
              commentCount={commentCounts[flint.id] || 0}
              onVote={fetchFlints}
            />
          ))
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-around py-2">
          <Link to="/" className="flex flex-col items-center gap-0.5 text-primary">
            <Flame className="h-5 w-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/create" className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary -mt-5 shadow-lg shadow-primary/30">
              <Plus className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-[10px] font-medium">Flint</span>
          </Link>
          <Link to="/talk" className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground">
            <MessageCircle className="h-5 w-5" />
            <span className="text-[10px] font-medium">Talk</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground">
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Index;
