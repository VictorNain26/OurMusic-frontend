import { create } from 'zustand';

export const usePlayerStore = create((set) => ({
  isPlaying: false,
  volume: 1,
  audioRef: null,

  setPlaying: (state) => set({ isPlaying: state }),
  setVolume: (value) => set({ volume: value }),
  setAudioRef: (ref) => set({ audioRef: ref }),
}));
