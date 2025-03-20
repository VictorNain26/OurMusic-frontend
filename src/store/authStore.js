import { create } from 'zustand';
import { apiFetch, getAccessToken, setAccessToken, logoutFetch } from '../utils/api';
import { toast } from 'react-hot-toast';
import { queryClient } from '../utils/queryClient';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,
  authReady: false,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch('https://ourmusic-api.ovh/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (data?.accessToken) setAccessToken(data.accessToken);
      set({ user: data.user, loading: false, authReady: true });
      toast.success('Connexion réussie');
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      toast.error(err.message || 'Échec de la connexion');
      return false;
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch('https://ourmusic-api.ovh/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
        credentials: 'include',
      });

      toast.success('Inscription réussie');
      return data.user;
    } catch (err) {
      set({ error: err.message, loading: false });
      toast.error(err.message || "Erreur lors de l'inscription");
      return null;
    }
  },

  fetchUser: async () => {
    set({ authReady: false });
    try {
      const data = await apiFetch('https://ourmusic-api.ovh/api/auth/me');
      set({ user: data.user, authReady: true });
    } catch (err) {
      await get().refreshToken(); // fallback automatique
    }
  },

  refreshToken: async () => {
    try {
      const res = await fetch('https://ourmusic-api.ovh/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Refresh échoué');

      const data = await res.json();
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        await get().fetchUser();
      } else {
        setAccessToken(null);
        set({ user: null, authReady: true });
      }
    } catch (err) {
      setAccessToken(null);
      set({ user: null, authReady: true });
    }
  },

  logout: async () => {
    try {
      await logoutFetch();
    } catch (err) {
      console.warn('[Logout error]', err);
    } finally {
      setAccessToken(null);
      queryClient.removeQueries(['likedTracks']);
      set({ user: null });
      toast.success('Déconnexion réussie');
    }
  },
}));
