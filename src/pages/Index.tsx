import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import FlintCard from "@/components/FlintCard";
import { Flame, Plus, MessageCircle, User } from "lucide-react";
import { Link } from "react-router-dom";
import NotificationBell from "@/components/NotificationBell";

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
}

const CATEGORIES = ["All", "Life", "Philosophy", "Politics", "Relationships", "Random"];

const Index = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [flints, setFlints] = useState<Flint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchFlints = async () => {
    const { data, error } = await supabase
      .from("flints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load flints", variant: "destructive" });
      return;
    }

    // Fetch author labs_ids
    const authorIds = [...new Set((data || []).map((f: Flint) => f.author_id))];
    let authorsMap: Record<string, string> = {};

    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from("users")
        .select("id, labs_id")
        .in("id", authorIds);

      if (authors) {
        authorsMap = Object.fromEntries(authors.map((a: { id: string; labs_id: string }) => [a.id, a.labs_id]));
      }
    }

    const flintsWithAuthors = (data || []).map((f: Flint) => ({
      ...f,
      author_labs_id: authorsMap[f.author_id] || "LabsID_???",
    }));

    setFlints(flintsWithAuthors);
    setLoading(false);
  };

  useEffect(() => {
    fetchFlints();
  }, []);

  const filteredFlints = activeCategory === "All"
    ? flints
    : flints.filter((f) => f.category === activeCategory);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Flintyo</span>
          </div>
          <div className="flex items-center gap-2">
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

      {/* Feed */}
      <main className="flex-1 px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredFlints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Flame className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No flints yet. Be the first to spark one!</p>
          </div>
        ) : (
          filteredFlints.map((flint) => (
            <FlintCard
              key={flint.id}
              flint={flint}
              currentUserId={user?.id || ""}
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
