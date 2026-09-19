import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type TourAnchor = {
  id: string;
  selector: string;
};

type TourAnchorContextValue = {
  anchors: TourAnchor[];
  setAnchors: (anchors: TourAnchor[]) => void;
};

const TourAnchorContext = createContext<TourAnchorContextValue | null>(null);

export function TourAnchorProvider({ children }: { children: ReactNode }) {
  const [anchors, setAnchors] = useState<TourAnchor[]>([]);
  const value = useMemo(() => ({ anchors, setAnchors }), [anchors]);
  return <TourAnchorContext.Provider value={value}>{children}</TourAnchorContext.Provider>;
}

export function useTourAnchor(): TourAnchorContextValue {
  const ctx = useContext(TourAnchorContext);
  if (!ctx) {
    throw new Error('useTourAnchor must be used within TourAnchorProvider');
  }
  return ctx;
}
