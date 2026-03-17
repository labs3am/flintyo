import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, MessageSquare, Swords, Flag, Clock } from "lucide-react";
import CommentsPanel from "@/components/CommentsPanel";
import ReportDialog from "@/components/ReportDialog";
import { completeDailyTask } from "@/lib/dailyTasks";

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
  userVote?: string | null;
  commentCount?: number;
  activeClash?: { id: string; viewerCount: number } | null;
  onVote: () => void;
}

const categoryColors: Record<string, string> = {
  Life: "bg-success/20 text-success",
  Politics: "bg-destructive/20 text-destructive",
  Relationship: "bg-primary/20 text-primary",
  Religion: "bg-rank-gold/20 text-rank-gold",
  Other: "bg-muted text-muted-foreground",
};

const FlintCard = memo(({ flint, currentUserId, userVote: initialVote, commentCount: initialCommentCount, activeClash, onVote }: FlintProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");
  const [userVote, setUserVote] = useState<string | null>(initialVote ?? null);
  const [voting, setVoting] = useState(false);
  const [clashing, setClashing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(initialCommentCount ?? 0);
  const [showReport, setShowReport] = useState(false);

  // Sync props
  useEffect(() => { setUserVote(initialVote ?? null); }, [initialVote]);
  useEffect(() => { setCommentCount(initialCommentCount ?? 0); }, [initialCommentCount]);

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

  const handleVote = useCallback(async (type: "agree" | "disagree") => {
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
      setUserVote((prev) => (prev === type ? null : type));
      completeDailyTask(currentUserId, "vote_flint", 2);
      onVote();
    }
    setVoting(false);
  }, [voting, flint.id, currentUserId, onVote, toast]);

  const handleClash = useCallback(async () => {
    if (!currentUserId || clashing || flint.author_id === currentUserId) return;
    setClashing(true);

    const { data: existing } = await supabase
      .from("debates")
      .select("id")
      .eq("flint_id", flint.id)
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
        flint_id: flint.id,
        user_a: currentUserId,
        user_b: flint.author_id,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      toast({ title: "Failed to send clash challenge", variant: "destructive" });
    } else if (data) {
      completeDailyTask(currentUserId, "clash_debate", 5);
      toast({ title: "Clash challenge sent! ⚔️" });
      navigate(`/debate/${data.id}`);
    }
    setClashing(false);
  }, [currentUserId, clashing, flint.id, flint.author_id, navigate, toast]);

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
          {activeClash && (
            <button
              onClick={() => navigate(`/debate/${activeClash.id}`)}
              className="flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-medium text-destructive animate-pulse"
            >
              <Swords className="h-3 w-3" />
              <span>LIVE</span>
              <span className="text-destructive/70">· {activeClash.viewerCount} watching</span>
            </button>
          )}
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
        <button
          onClick={handleClash}
          disabled={clashing || flint.author_id === currentUserId}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-30"
        >
          <Swords className="h-3.5 w-3.5" />
          <span>Clash</span>
        </button>
        <button
          onClick={() => setShowReport(true)}
          className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
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

      {/* Report Dialog */}
      {showReport && (
        <ReportDialog
          flintId={flint.id}
          userId={currentUserId}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
});

FlintCard.displayName = "FlintCard";

export default FlintCard;
