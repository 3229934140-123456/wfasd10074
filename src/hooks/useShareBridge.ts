import { useCallback, useEffect } from 'react';

export function useShareBridge() {
  const getConfirmation = useCallback((vendorId: string, timelineItemId: string) => {
    try {
      const key = `share-confirm-${vendorId}-${timelineItemId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const setConfirmation = useCallback(
    (vendorId: string, timelineItemId: string, data: Record<string, unknown>) => {
      try {
        const key = `share-confirm-${vendorId}-${timelineItemId}`;
        localStorage.setItem(key, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('share-confirm-update', { detail: { vendorId, timelineItemId, data } }));
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const subscribe = useCallback(
    (
      callback: (e: CustomEvent<{ vendorId: string; timelineItemId: string; data: Record<string, unknown> }>) => void,
    ) => {
      const handler = (e: Event) => callback(e as CustomEvent<{ vendorId: string; timelineItemId: string; data: Record<string, unknown> }>);
      window.addEventListener('share-confirm-update', handler);
      window.addEventListener('storage', handler);
      return () => {
        window.removeEventListener('share-confirm-update', handler);
        window.removeEventListener('storage', handler);
      };
    },
    [],
  );

  useEffect(() => {
    const originalSetItem = localStorage.setItem;
    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, []);

  return { getConfirmation, setConfirmation, subscribe };
}
