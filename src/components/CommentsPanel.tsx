import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("flint_id", flintId)
      .order("created_at", { ascending: true });

    if (error) return;

    // Fetch author labs_ids
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
            <div key={c.id} className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-medium text-primary">{c.author_labs_id}</span>
                <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
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
