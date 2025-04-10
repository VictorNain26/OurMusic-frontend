import { create } from 'zustand';

const savedVolume = parseFloat(localStorage.getItem('ourmusic_volume')) || 1;

const audio = new Audio();
audio.preload = 'auto';
audio.crossOrigin = 'anonymous';
audio.volume = savedVolume;

export const usePlayerStore = create((set) => ({
  isPlaying: false,
  volume: savedVolume,

  setPlaying: (state) => set({ isPlaying: state }),

  setVolume: (value) => {
    audio.volume = value;
    localStorage.setItem('ourmusic_volume', value);
    set({ volume: value });
  },
}));

export const PlayerService = {
  setSource: (url) => {
    if (audio.src !== url) {
      audio.src = url;
    }
  },

  play: async () => {
    try {
      await audio.play();
      usePlayerStore.getState().setPlaying(true);
    } catch (err) {
      console.error('[PlayerService → play]', err);
      usePlayerStore.getState().setPlaying(false);
    }
  },

  stop: () => {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    usePlayerStore.getState().setPlaying(false);
  },

  setVolume: (value) => {
    audio.volume = value;
    localStorage.setItem('ourmusic_volume', value);
    usePlayerStore.getState().setVolume(value);
  },

  getVolume: () => audio.volume,

  isPlaying: () => !audio.paused && !audio.ended && audio.src,

  on: (event, callback) => {
    audio.addEventListener(event, callback);
  },

  off: (event, callback) => {
    audio.removeEventListener(event, callback);
  },
};

audio.addEventListener
