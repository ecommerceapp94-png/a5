import { useCallback, useEffect, useRef, useState } from 'react';
import { loadJSON, saveJSON } from '@/utils/storage';

export function useAsyncStorage<T>(key: string, initial: T): {
  value: T;
  setValue: (next: T | ((prev: T) => T)) => void;
  loading: boolean;
  reload: () => Promise<void>;
} {
  const [value, setValueState] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const initialRef = useRef(initial);

  const reload = useCallback(async () => {
    setLoading(true);
    const stored = await loadJSON<T>(key, initialRef.current);
    setValueState(stored);
    setLoading(false);
  }, [key]);

  useEffect(() => {
    reload();
  }, [reload]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        saveJSON(key, resolved).catch(() => undefined);
        return resolved;
      });
    },
    [key],
  );

  return { value, setValue, loading, reload };
}
