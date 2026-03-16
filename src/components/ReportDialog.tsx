import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Flag, X } from "lucide-react";

const REASONS = ["Harassment", "Hate speech", "Threats", "Spam"];

interface ReportDialogProps {
  flintId: string;
  userId: string;
  onClose: () => void;
}

const ReportDialog = ({ flintId, userId, onClose }: ReportDialogProps) => {
  const { toast } = useToast();
  const [selected, setSelected] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);

    const { error } = await supabase.from("reports").insert({
      flint_id: flintId,
      reported_by: userId,
      reason: selected,
    });

    if (error) {
      toast({ title: "Report failed", variant: "destructive" });
    } else {
      toast({ title: "Report submitted. Thank you." });
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-xl sm:rounded-xl border border-border bg-card p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-semibold text-foreground">Report this Flint</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => setSelected(reason)}
              className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                selected === reason
                  ? "border-destructive bg-destructive/10 text-foreground"
                  : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {reason}
            </button>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selected || submitting}
          variant="destructive"
          className="w-full font-semibold"
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </Button>
      </div>
    </div>
  );
};

export default ReportDialog;
