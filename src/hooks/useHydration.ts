import { useState } from 'react';

export type HydrationState = {
  water: number;
  addWater: () => void;
};

export default function useHydration(date: string): HydrationState {
  const [recorded, setRecorded] = useState<Record<string, number>>({});
  const key = `shapeup_water_${localStorage.getItem('shapeup_user_id') || 'current'}_${date}`;
  const water = recorded[key] ?? (Number(localStorage.getItem(key)) || 0);

  const addWater = () => {
    const next = water + 250;
    localStorage.setItem(key, String(next));
    setRecorded((previous) => ({ ...previous, [key]: next }));
  };

  return { water, addWater };
}
