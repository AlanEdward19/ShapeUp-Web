import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type TourAnchorContextValue = {
  targetSelector: string | null;
  setAnchorTarget: (selector: string | null) => void;
};

const TourAnchorContext = createContext<TourAnchorContextValue | null>(null);

export function TourAnchorProvider({ children }: { children: ReactNode }) {
  const [targetSelector, setAnchorTarget] = useState<string | null>(null);
  const value = useMemo(() => ({ targetSelector, setAnchorTarget }), [targetSelector]);
  return <TourAnchorContext.Provider value={value}>{children}</TourAnchorContext.Provider>;
}

export function useTourAnchor(): TourAnchorContextValue {
  const ctx = useContext(TourAnchorContext);
  if (!ctx) {
    throw new Error('useTourAnchor must be used within TourAnchorProvider');
  }
  return ctx;
}
