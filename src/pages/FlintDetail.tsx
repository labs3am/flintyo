import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import FlintCard from "@/components/FlintCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { labs_id: string } | null;
}

const FlintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flint, setFlint] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    const { data: f } = await supabase.from("flints").select("*, profiles(labs_id)").eq("id", id).single();
    if (f) setFlint(f);

    const { data: c } = await supabase
      .from("comments")
      .select("*, profiles(labs_id)")
      .eq("flint_id", id)
      .order("created_at", { ascending: true });
    if (c) setComments(c as Comment[]);

    if (user) {
      const { data: v } = await supabase.from("user_votes").select("vote_type").eq("flint_id", id).eq("user_id", user.id).maybeSingle();
      if (v) setUserVote(v.vote_type);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id, user]);

  const sendComment = async () => {
    if (!user || !newComment.trim() || !id) return;
    setSending(true);
    const { error } = await supabase.from("comments").insert({
      flint_id: id,
      user_id: user.id,
      content: newComment.trim().slice(0, 500),
    });
    if (error) toast.error("Failed to comment");
    else { setNewComment(""); fetchData(); }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!flint) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Flint not found or expired</p>
        <Button variant="ghost" onClick={() => navigate("/")}>Go home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-foreground">Discussion</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <FlintCard
          id={flint.id}
          authorLabsId={flint.profiles?.labs_id || "Unknown"}
          authorId={flint.author_id}
          content={flint.content}
          category={flint.category}
          agreeCount={flint.agree_count}
          disagreeCount={flint.disagree_count}
          createdAt={flint.created_at}
          expiresAt={flint.expires_at}
          isSaved={flint.is_saved}
          userVote={userVote}
          commentCount={comments.length}
          onVote={fetchData}
        />

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Comments ({comments.length})</h2>
          {comments.map((c) => (
            <div key={c.id} className="bg-secondary rounded-lg px-3 py-2.5 space-y-1">
              <span className="text-xs font-mono text-muted-foreground">{c.profiles?.labs_id || "Unknown"}</span>
              <p className="text-sm text-foreground">{c.content}</p>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-14 left-0 right-0 bg-background border-t border-border px-4 py-2">
        <div className="max-w-lg mx-auto flex gap-2">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value.slice(0, 500))}
            onKeyDown={(e) => e.key === "Enter" && sendComment()}
            className="bg-secondary border-border"
          />
          <Button size="icon" onClick={sendComment} disabled={sending || !newComment.trim()}>
            <Send size={16} />
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default FlintDetail;
