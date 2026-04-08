import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, Swords, Flag, Clock, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FlintCardProps {
  id: string;
  authorLabsId: string;
  authorId: string;
  content: string;
  category: string;
  agreeCount: number;
  disagreeCount: number;
  createdAt: string;
  expiresAt: string | null;
  isSaved: boolean;
  userVote?: string | null;
  commentCount?: number;
  onVote?: () => void;
  clashWinner?: { labsId: string; totalVotes: number } | null;
}

const getRankColor = (rank?: string) => {
  switch (rank) {
    case "Copper": return "text-rank-copper";
    case "Cobalt": return "text-rank-cobalt";
    case "Amethyst": return "text-rank-amethyst";
    default: return "text-rank-lead";
  }
};

const getTimeRemaining = (expiresAt: string | null) => {
  if (!expiresAt) return "Saved";
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const categoryColors: Record<string, string> = {
  Life: "bg-emerald-500/20 text-emerald-400",
  Politics: "bg-red-500/20 text-red-400",
  Relationship: "bg-pink-500/20 text-pink-400",
  Religion: "bg-amber-500/20 text-amber-400",
  Philosophy: "bg-purple-500/20 text-purple-400",
  Random: "bg-blue-500/20 text-blue-400",
  Other: "bg-zinc-500/20 text-zinc-400",
};

const reportReasons = [
  { value: "harassment", label: "Harassment" },
  { value: "hate_speech", label: "Hate Speech" },
  { value: "threats", label: "Threats" },
  { value: "spam", label: "Spam" },
];

const FlintCard = ({
  id, authorLabsId, authorId, content, category, agreeCount, disagreeCount,
  createdAt, expiresAt, isSaved, userVote, commentCount = 0, onVote, clashWinner,
}: FlintCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [voting, setVoting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [finishedClash, setFinishedClash] = useState<any>(null);

  // Fetch finished clash for this flint (lazy, once)
  const [clashChecked, setClashChecked] = useState(false);
  const checkClash = async () => {
    if (clashChecked) return;
    setClashChecked(true);
    const { data } = await supabase
      .from("debates")
      .select("winner, votes_a, votes_b, votes_draw")
      .eq("flint_id", id)
      .eq("status", "finished")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data && data.winner) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("labs_id")
        .eq("id", data.winner)
        .single();
      setFinishedClash({
        winnerLabsId: profile?.labs_id || "Unknown",
        totalVotes: (data.votes_a || 0) + (data.votes_b || 0) + (data.votes_draw || 0),
      });
    }
  };

  // Check clash on mount
  useState(() => { checkClash(); });

  const handleVote = async (type: "agree" | "disagree") => {
    if (!user || voting || userVote) return;
    setVoting(true);
    const { error } = await supabase.rpc("vote_on_flint", { p_flint_id: id, p_vote_type: type });
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Already voted" : "Vote failed");
    }
    onVote?.();
    setVoting(false);
  };

  const handleReport = async (reason: string) => {
    if (!user) return;
    const { error } = await supabase.from("reports").insert({ flint_id: id, reported_by: user.id, reason });
    if (error) toast.error("Report failed");
    else toast.success("Reported — thank you");
    setReportOpen(false);
  };

  const handleClash = () => {
    if (!user || user.id === authorId) return;
    navigate(`/clash/${id}`);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      {/* Clash ended banner */}
      {finishedClash && (
        <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-1.5 -mt-1">
          <Trophy size={12} className="text-primary" />
          <span className="text-[10px] text-primary font-medium">
            Clash ended — {finishedClash.winnerLabsId} won ({finishedClash.totalVotes} votes)
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-medium ${getRankColor()}`}>{authorLabsId}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColors[category] || categoryColors.Other}`}>
            {category}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {user?.id !== authorId && (
            <button onClick={handleClash} className="text-muted-foreground hover:text-primary transition-colors p-1" title="Clash">
              <Swords size={14} />
            </button>
          )}
          <button onClick={() => setReportOpen(true)} className="text-muted-foreground hover:text-destructive transition-colors p-1" title="Report">
            <Flag size={12} />
          </button>
        </div>
      </div>

      <p className="text-foreground text-sm leading-relaxed">{content}</p>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleVote("agree")}
            disabled={!!userVote || voting}
            className={`flex items-center gap-1 text-xs transition-colors ${
              userVote === "agree" ? "text-emerald-400" : "text-muted-foreground hover:text-emerald-400"
            } disabled:opacity-60`}
          >
            <ThumbsUp size={14} /> {agreeCount}
          </button>
          <button
            onClick={() => handleVote("disagree")}
            disabled={!!userVote || voting}
            className={`flex items-center gap-1 text-xs transition-colors ${
              userVote === "disagree" ? "text-red-400" : "text-muted-foreground hover:text-red-400"
            } disabled:opacity-60`}
          >
            <ThumbsDown size={14} /> {disagreeCount}
          </button>
          <button
            onClick={() => navigate(`/flint/${id}`)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare size={14} /> {commentCount}
          </button>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock size={12} />
          <span className="text-[10px]">{getTimeRemaining(expiresAt)}</span>
        </div>
      </div>

      {/* Report dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Report this Flint</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {reportReasons.map((r) => (
              <Button
                key={r.value}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleReport(r.value)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlintCard;
