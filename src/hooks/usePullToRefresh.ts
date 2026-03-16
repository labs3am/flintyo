import { useState, useRef, useCallback, TouchEvent } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export const usePullToRefresh = ({ onRefresh, threshold = 60 }: UsePullToRefreshOptions) => {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!pulling || refreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.4, threshold * 1.5));
    }
  }, [pulling, refreshing, threshold]);

  const onTouchEnd = useCallback(async () => {
    if (!pulling) return;
    setPulling(false);

    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pulling, pullDistance, threshold, refreshing, onRefresh]);

  return {
    containerRef,
    pullDistance,
    refreshing,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
};
