"use client";

import { useCallback, useEffect, useState } from "react";

interface AsyncState<T> {
  data: T | undefined;
  error: unknown;
  loading: boolean;
  retry: () => void;
}

/**
 * Load data for a cache key. `key === null` means "don't load yet".
 * The key must encode every input the loader depends on.
 */
export function useAsyncData<T>(
  key: string | null,
  loader: () => Promise<T>,
  options: { keepPrevious?: boolean } = {},
): AsyncState<T> {
  const [attempt, setAttempt] = useState(0);
  const requestKey = key === null ? null : `${key}#${attempt}`;
  const [result, setResult] = useState<{ key: string | null; data?: T; error?: unknown }>({ key: null });

  useEffect(() => {
    if (requestKey === null) return;
    let active = true;
    loader().then(
      (data) => active && setResult({ key: requestKey, data }),
      (error: unknown) =>
        active && setResult((prev) => ({ key: requestKey, data: prev.data, error: error ?? new Error("Unknown error") })),
    );
    return () => {
      active = false;
    };
    // `requestKey` encodes the loader's inputs by contract.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const settled = requestKey !== null && result.key === requestKey;

  return {
    // With keepPrevious, the last loaded data stays visible while a new key loads.
    data: settled || options.keepPrevious ? result.data : undefined,
    error: settled ? result.error : undefined,
    loading: requestKey !== null && !settled,
    retry,
  };
}
