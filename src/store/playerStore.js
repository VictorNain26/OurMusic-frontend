import { create } from 'zustand';

export const usePlayerStore = create((set) => ({
  isPlaying: false,
  volume: 1,
  setPlaying: (state) => set({ isPlaying: state }),
  setVolume: (value) => set({ volume: value }),
}));
