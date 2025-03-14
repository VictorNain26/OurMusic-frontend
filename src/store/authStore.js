import { create } from 'zustand';
import { apiFetch, getAccessToken, setAccessToken, logoutFetch } from '../utils/api';
import { toast } from 'react-hot-toast';

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,
  authReady: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch('https://ourmusic-api.ovh/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.accessToken) setAccessToken(data.accessToken);
      set({ user: data.user, loading: false });
      toast.success('Connexion réussie');
      return true;
    } catch (err) {
      console.error('[Login Error]', err);
      set({ error: err.message, loading: false });
      toast.error('Échec de la connexion');
      return false;
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch('https://ourmusic-api.ovh/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });

      toast.success('Inscription réussie');
      return data.user;
    } catch (err) {
      console.error('[Register Error]', err);
      set({ error: err.message, loading: false });
      toast.error('Échec de l’inscription');
      return null;
    }
  },

  fetchUser: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ authReady: true });
      return;
    }

    set({ loading: true });
    try {
      const data = await apiFetch('https://ourmusic-api.ovh/api/auth/me');
      set({ user: data, loading: false, authReady: true });
    } catch (err) {
      console.warn('fetchUser failed, trying refresh...', err.message);
      await useAuthStore.getState().refreshToken();
    }
  },

  refreshToken: async () => {
    try {
      const res = await fetch('https://ourmusic-api.ovh/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Refresh échoué');
      }

      const data = await res.json();
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        await useAuthStore.getState().fetchUser(); // relance le fetch user
      }
    } catch (err) {
      console.warn('[RefreshToken Error]', err);
      setAccessToken(null);
      set({ user: null, authReady: true });
    }
  },

  logout: async () => {
    try {
      await logoutFetch();
    } catch (e) {
      console.warn('logoutFetch error:', e);
    } finally {
      setAccessToken(null);
      set({ user: null });
      toast.success('Déconnexion réussie');
    }
  },
}));
