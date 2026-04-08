import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import FlintCard from "@/components/FlintCard";
import BottomNav from "@/components/BottomNav";
import { Flame, Loader2, Search, Globe } from "lucide-react";
import { countries } from "@/lib/countries";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Flint {
  id: string;
  author_id: string;
  content: string;
  category: string;
  audience: string;
  audience_country: string | null;
  agree_count: number;
  disagree_count: number;
  created_at: string;
  expires_at: string | null;
  is_saved: boolean;
  profiles: { labs_id: string } | null;
}

const categories = ["All", "Life", "Politics", "Relationship", "Religion", "Philosophy", "Random", "Other"];

const Home = () => {
  const { user, profile } = useAuth();
  const [flints, setFlints] = useState<Flint[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState("All");
  const [countryFilter, setCountryFilter] = useState(profile?.country || "Global");
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);

  const fetchFlints = async () => {
    let query = supabase
      .from("flints")
      .select("*, profiles(labs_id)")
      .or(`expires_at.gt.${new Date().toISOString()},is_saved.eq.true`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (activeCategory !== "All") {
      query = query.eq("category", activeCategory);
    }

    if (countryFilter !== "Global") {
      query = query.or(`audience.eq.Global,audience.eq.${countryFilter},audience_country.eq.${countryFilter}`);
    }

    const { data } = await query;

    if (data) {
      setFlints(data as Flint[]);
      const ids = data.map((f: any) => f.id);
      if (ids.length > 0) {
        const { data: comments } = await supabase
          .from("comments")
          .select("flint_id")
          .in("flint_id", ids);
        const counts: Record<string, number> = {};
        comments?.forEach((c: any) => {
          counts[c.flint_id] = (counts[c.flint_id] || 0) + 1;
        });
        setCommentCounts(counts);
      }
    }

    if (user) {
      const { data: userVotes } = await supabase
        .from("user_votes")
        .select("flint_id, vote_type")
        .eq("user_id", user.id);
      const voteMap: Record<string, string> = {};
      userVotes?.forEach((v: any) => { voteMap[v.flint_id] = v.vote_type; });
      setVotes(voteMap);
    }
    setLoading(false);
  };

  useEffect(() => { fetchFlints(); }, [user, activeCategory, countryFilter]);

  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <Flame className="text-primary" size={22} />
            <h1 className="text-lg font-bold text-foreground">Flintyo</h1>
          </div>
          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors bg-secondary px-2.5 py-1.5 rounded-lg">
                <Globe size={12} />
                <span className="max-w-[80px] truncate">{countryFilter}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              <div className="p-2 border-b border-border">
                <Input
                  placeholder="Search..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="bg-secondary border-border h-8 text-sm"
                />
              </div>
              <ScrollArea className="h-48">
                <div className="p-1">
                  <button
                    onClick={() => { setCountryFilter("Global"); setCountryOpen(false); setCountrySearch(""); }}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded hover:bg-accent transition-colors ${
                      countryFilter === "Global" ? "text-primary font-medium" : "text-foreground"
                    }`}
                  >
                    🌍 Global
                  </button>
                  {profile?.country && (
                    <button
                      onClick={() => { setCountryFilter(profile.country!); setCountryOpen(false); setCountrySearch(""); }}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded hover:bg-accent transition-colors ${
                        countryFilter === profile.country ? "text-primary font-medium" : "text-foreground"
                      }`}
                    >
                      🏠 {profile.country}
                    </button>
                  )}
                  {filteredCountries.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCountryFilter(c); setCountryOpen(false); setCountrySearch(""); }}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded hover:bg-accent transition-colors ${
                        countryFilter === c ? "text-primary font-medium" : "text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Category tabs */}
      <div className="sticky top-[53px] z-30 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={24} />
          </div>
        ) : flints.length === 0 ? (
          <div className="text-center py-20 space-y-2">
            <p className="text-muted-foreground text-sm">No flints yet</p>
            <p className="text-muted-foreground text-xs">Be the first to spark a conversation</p>
          </div>
        ) : (
          flints.map((f) => (
            <FlintCard
              key={f.id}
              id={f.id}
              authorLabsId={f.profiles?.labs_id || "Unknown"}
              authorId={f.author_id}
              content={f.content}
              category={f.category}
              agreeCount={f.agree_count}
              disagreeCount={f.disagree_count}
              createdAt={f.created_at}
              expiresAt={f.expires_at}
              isSaved={f.is_saved}
              userVote={votes[f.id]}
              commentCount={commentCounts[f.id] || 0}
              onVote={fetchFlints}
            />
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
