import { Loader2 } from "lucide-react";

interface PullIndicatorProps {
  pullDistance: number;
  refreshing: boolean;
  threshold?: number;
}

const PullIndicator = ({ pullDistance, refreshing, threshold = 60 }: PullIndicatorProps) => {
  if (pullDistance <= 0 && !refreshing) return null;

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-all"
      style={{ height: refreshing ? 40 : pullDistance }}
    >
      {refreshing ? (
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
      ) : (
        <div
          className="text-xs text-muted-foreground transition-opacity"
          style={{ opacity: pullDistance / threshold }}
        >
          {pullDistance >= threshold ? "Release to refresh" : "Pull to refresh"}
        </div>
      )}
    </div>
  );
};

export default PullIndicator;
