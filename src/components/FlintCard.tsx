import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, MessageSquare, Swords, Flag, Clock } from "lucide-react";
import CommentsPanel from "@/components/CommentsPanel";

interface FlintProps {
  flint: {
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
  };
  currentUserId: string;
  onVote: () => void;
}

const FlintCard = ({ flint, currentUserId, onVote }: FlintProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");
  const [userVote, setUserVote] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [clashing, setClashing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // Fetch user's existing vote & comment count
  useEffect(() => {
    if (!currentUserId) return;

    supabase
      .from("votes")
      .select("vote_type")
      .eq("flint_id", flint.id)
      .eq("user_id", currentUserId)
      .maybeSingle()
      .then(({ data }) => {
        setUserVote(data?.vote_type || null);
      });

    supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("flint_id", flint.id)
      .then(({ count }) => {
        setCommentCount(count || 0);
      });
  }, [flint.id, currentUserId]);

  useEffect(() => {
    if (!flint.expires_at || flint.is_saved) {
      setTimeLeft("");
      return;
    }
    const update = () => {
      const diff = new Date(flint.expires_at!).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [flint.expires_at, flint.is_saved]);

  const handleVote = async (type: "agree" | "disagree") => {
    if (voting) return;
    setVoting(true);

    const { error } = await supabase.rpc("cast_vote" as never, {
      p_flint_id: flint.id,
      p_user_id: currentUserId,
      p_vote_type: type,
    } as never);

    if (error) {
      toast({ title: "Vote failed", variant: "destructive" });
    } else {
      // Toggle or switch vote locally
      setUserVote((prev) => (prev === type ? null : type));
      onVote();
    }
    setVoting(false);
  };

  const categoryColors: Record<string, string> = {
    Life: "bg-success/20 text-success",
    Philosophy: "bg-rank-amethyst/20 text-rank-amethyst",
    Politics: "bg-destructive/20 text-destructive",
    Relationships: "bg-primary/20 text-primary",
    Random: "bg-rank-cobalt/20 text-rank-cobalt",
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-primary">
            {flint.author_labs_id}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryColors[flint.category] || "bg-secondary text-secondary-foreground"}`}>
            {flint.category}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {timeLeft && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {timeLeft}
            </span>
          )}
          {flint.is_saved && (
            <span className="text-[10px] text-muted-foreground">Saved</span>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-foreground leading-relaxed">{flint.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => handleVote("agree")}
          disabled={voting}
          className={`flex items-center gap-1 text-xs transition-colors ${
            userVote === "agree" ? "text-success" : "text-muted-foreground hover:text-success"
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{flint.agree_count}</span>
        </button>
        <button
          onClick={() => handleVote("disagree")}
          disabled={voting}
          className={`flex items-center gap-1 text-xs transition-colors ${
            userVote === "disagree" ? "text-destructive" : "text-muted-foreground hover:text-destructive"
          }`}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          <span>{flint.disagree_count}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1 text-xs transition-colors ${
            showComments ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{commentCount > 0 ? commentCount : "Discuss"}</span>
        </button>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          <Swords className="h-3.5 w-3.5" />
          <span>Clash</span>
        </button>
        <button className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors">
          <Flag className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Comments Panel */}
      {showComments && (
        <CommentsPanel
          flintId={flint.id}
          currentUserId={currentUserId}
          onCountChange={setCommentCount}
        />
      )}
    </div>
  );
};

export default FlintCard;
