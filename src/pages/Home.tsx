import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import FlintCard from "@/components/FlintCard";
import BottomNav from "@/components/BottomNav";
import { Flame, Loader2 } from "lucide-react";

interface Flint {
  id: string;
  author_id: string;
  content: string;
  category: string;
  agree_count: number;
  disagree_count: number;
  created_at: string;
  expires_at: string | null;
  is_saved: boolean;
  profiles: { labs_id: string } | null;
}

const Home = () => {
  const { user } = useAuth();
  const [flints, setFlints] = useState<Flint[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  const fetchFlints = async () => {
    const { data } = await supabase
      .from("flints")
      .select("*, profiles(labs_id)")
      .or(`expires_at.gt.${new Date().toISOString()},is_saved.eq.true`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setFlints(data as Flint[]);

      // Fetch comment counts
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

    // Fetch user votes
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

  useEffect(() => { fetchFlints(); }, [user]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <Flame className="text-primary" size={22} />
          <h1 className="text-lg font-bold text-foreground">Flintyo</h1>
        </div>
      </header>

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
