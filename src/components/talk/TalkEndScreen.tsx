import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, Flag, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface TalkEndScreenProps {
  chatId: string;
  onNewChat: () => void;
}

const TalkEndScreen = ({ chatId, onNewChat }: TalkEndScreenProps) => {
  const { toast } = useToast();
  const [rated, setRated] = useState(false);

  const handleRate = (type: string) => {
    setRated(true);
    if (type === "report") {
      toast({ title: "Report submitted. Thank you." });
    } else {
      toast({ title: type === "helpful" ? "Glad it helped! 💛" : "Thanks for the feedback" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <p className="text-2xl">💬</p>
          <h2 className="text-lg font-bold text-foreground">Chat Ended</h2>
          <p className="text-sm text-muted-foreground">How was your conversation?</p>
        </div>

        {!rated ? (
          <div className="flex justify-center gap-3">
            <button
              onClick={() => handleRate("helpful")}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-card border border-border px-6 py-4 hover:border-green-500/40 transition-colors"
            >
              <ThumbsUp className="h-6 w-6 text-green-400" />
              <span className="text-xs text-muted-foreground">Helpful</span>
            </button>
            <button
              onClick={() => handleRate("not_helpful")}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-card border border-border px-6 py-4 hover:border-muted-foreground/40 transition-colors"
            >
              <ThumbsDown className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Not Helpful</span>
            </button>
            <button
              onClick={() => handleRate("report")}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-card border border-border px-6 py-4 hover:border-destructive/40 transition-colors"
            >
              <Flag className="h-6 w-6 text-destructive" />
              <span className="text-xs text-muted-foreground">Report</span>
            </button>
          </div>
        ) : (
          <p className="text-sm text-primary font-medium">Thanks for your feedback! ✨</p>
        )}

        <div className="space-y-2 pt-2">
          <Button onClick={onNewChat} className="w-full font-semibold gap-2">
            <MessageCircle className="h-4 w-4" />
            Talk to someone new
          </Button>
          <Button variant="secondary" asChild className="w-full">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TalkEndScreen;
