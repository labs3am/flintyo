import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Send, Swords } from "lucide-react";
import { completeDailyTask } from "@/lib/dailyTasks";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_labs_id?: string;
}

interface CommentsPanelProps {
  flintId: string;
  currentUserId: string;
  onCountChange: (count: number) => void;
}

const CommentsPanel = ({ flintId, currentUserId, onCountChange }: CommentsPanelProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [clashing, setClashing] = useState(false);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("flint_id", flintId)
      .order("created_at", { ascending: true });

    if (error) return;

    const userIds = [...new Set((data || []).map((c: Comment) => c.user_id))];
    let authorsMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: authors } = await (supabase
        .from("user_profiles" as any)
        .select("id, labs_id")
        .in("id", userIds) as any);

      if (authors) {
        authorsMap = Object.fromEntries(authors.map((a: { id: string; labs_id: string }) => [a.id, a.labs_id]));
      }
    }

    const withAuthors = (data || []).map((c: Comment) => ({
      ...c,
      author_labs_id: authorsMap[c.user_id] || "LabsID_???",
    }));

    setComments(withAuthors);
    onCountChange(withAuthors.length);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [flintId]);

  const handlePost = async () => {
    const trimmed = newComment.trim();
    if (!trimmed || posting) return;

    if (trimmed.length > 500) {
      toast({ title: "Comment too long (max 500 chars)", variant: "destructive" });
      return;
    }

    setPosting(true);
    const { error } = await supabase.from("comments").insert({
      flint_id: flintId,
      user_id: currentUserId,
      content: trimmed,
    });

    if (error) {
      toast({ title: "Failed to post comment", variant: "destructive" });
    } else {
      completeDailyTask("comment_flint");
      setNewComment("");
      fetchComments();
    }
    setPosting(false);
  };

  const handleClashComment = async (targetUserId: string) => {
    if (!currentUserId || clashing || targetUserId === currentUserId) return;
    setClashing(true);

    // Check for existing active/pending clash on this flint
    const { data: existing } = await supabase
      .from("debates")
      .select("id")
      .eq("flint_id", flintId)
      .in("status", ["pending", "active"])
      .limit(1);

    if (existing && existing.length > 0) {
      toast({ title: "A clash is already in progress for this flint", variant: "destructive" });
      setClashing(false);
      return;
    }

    const { data, error } = await supabase
      .from("debates")
      .insert({
        flint_id: flintId,
        user_a: currentUserId,
        user_b: targetUserId,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      toast({ title: "Failed to send clash challenge", variant: "destructive" });
    } else if (data) {
      completeDailyTask("clash_debate");
      toast({ title: "Clash challenge sent! ⚔️" });
      navigate(`/debate/${data.id}`);
    }
    setClashing(false);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <div className="border-t border-border pt-3 space-y-3">
      {/* Comments list */}
      <div className="max-h-48 overflow-y-auto space-y-2.5">
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-muted-foreground">No comments yet. Start the discussion!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="space-y-0.5 group">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-medium text-primary">{c.author_labs_id}</span>
                <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                {c.user_id !== currentUserId && (
                  <button
                    onClick={() => handleClashComment(c.user_id)}
                    disabled={clashing}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-primary transition-all disabled:opacity-30"
                    title={`Clash with ${c.author_labs_id}`}
                  >
                    <Swords className="h-3 w-3" />
                    <span>Clash</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-foreground/90">{c.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePost()}
          className="h-8 text-xs bg-secondary border-border"
          maxLength={500}
        />
        <button
          onClick={handlePost}
          disabled={posting || !newComment.trim()}
          className="text-primary hover:text-primary/80 disabled:text-muted-foreground transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CommentsPanel;
