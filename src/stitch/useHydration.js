import { useState } from 'react';

export default function useHydration(date) {
  const [recorded, setRecorded] = useState({});
  const key = `shapeup_water_${localStorage.getItem('shapeup_user_id') || 'current'}_${date}`;
  const water = recorded[key] ?? (Number(localStorage.getItem(key)) || 0);
  const addWater = () => { const next = water + 250; localStorage.setItem(key, String(next)); setRecorded(previous => ({ ...previous, [key]: next })); };
  return { water, addWater };
}
