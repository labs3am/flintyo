import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, MessageSquare, Swords, Flag, Clock } from "lucide-react";

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
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!flint.expires_at || flint.is_saved) {
      setTimeLeft("");
      return;
    }

    const update = () => {
      const diff = new Date(flint.expires_at!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [flint.expires_at, flint.is_saved]);

  const handleVote = async (type: "agree" | "disagree") => {
    const field = type === "agree" ? "agree_count" : "disagree_count";
    const { error } = await supabase
      .from("flints")
      .update({ [field]: flint[field] + 1 })
      .eq("id", flint.id);

    if (error) {
      toast({ title: "Vote failed", variant: "destructive" });
      return;
    }

    // Award +1 point to author for agree
    if (type === "agree") {
      await supabase.rpc("increment_points" as never, { user_id_input: flint.author_id, amount: 1 } as never);
    }

    onVote();
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
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-success transition-colors"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{flint.agree_count}</span>
        </button>
        <button
          onClick={() => handleVote("disagree")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          <span>{flint.disagree_count}</span>
        </button>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Discuss</span>
        </button>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          <Swords className="h-3.5 w-3.5" />
          <span>Clash</span>
        </button>
        <button className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors">
          <Flag className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default FlintCard;
