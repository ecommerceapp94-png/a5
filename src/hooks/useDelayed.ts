import { useEffect, useRef, useState } from 'react';

export function useDelayedReady(delay: number = 850): boolean {
  const [ready, setReady] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const t = setTimeout(() => {
      if (mounted.current) setReady(true);
    }, delay);
    return () => {
      mounted.current = false;
      clearTimeout(t);
    };
  }, [delay]);

  return ready;
}

export function useSimulatedRefresh(initialDelay: number = 850): {
  refreshing: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [refreshing, setRefreshing] = useState(false);
  const ready = useDelayedReady(initialDelay);

  const refresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setRefreshing(false);
  };

  return { refreshing, loading: !ready, refresh };
}
