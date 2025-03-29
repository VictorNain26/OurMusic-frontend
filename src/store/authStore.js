import { create } from 'zustand';
import { apiFetch, getAccessToken, setAccessToken } from '../utils/api';
import { toast } from 'react-hot-toast';
import { queryClient } from '../utils/queryClient';
import { parseAuthError } from '../utils/errorMessages';
import { API_BASE_URL } from '../utils/config';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,
  authReady: false,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/email/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const text = await res.text();
      if (!res.ok) throw new Error(parseAuthError(text));

      const data = JSON.parse(text);

      if (!data.user?.emailVerified && data.user?.role !== 'admin') {
        throw new Error("Veuillez vérifier votre email avant de vous connecter.");
      }

      if (data?.accessToken) setAccessToken(data.accessToken);
      set({ user: data.user, loading: false, authReady: true });
      toast.success('Connexion réussie');
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      toast.error(err.message || 'Erreur lors de la connexion');
      return false;
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/email/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });

      const text = await res.text();
      if (!res.ok) throw new Error(parseAuthError(text));

      const data = JSON.parse(text);
      toast.success('Inscription réussie. Vérifiez votre email.');
      return data.user;
    } catch (err) {
      set({ error: err.message, loading: false });
      toast.error(err.message || 'Erreur lors de l’inscription');
      return null;
    }
  },

  fetchUser: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ user: null, authReady: true });
      return;
    }

    set({ authReady: false });
    try {
      const data = await apiFetch('/api/auth/me');
      set({ user: data.user, authReady: true });
    } catch (err) {
      await get().refreshToken();
    }
  },

  refreshToken: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Session expirée');

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
      await fetch(`${API_BASE_URL}/api/auth/email/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.warn('[Logout error]', err);
    } finally {
      setAccessToken(null);
      queryClient.removeQueries(['likedTracks']);
      set({ user: null });
      toast.success('Déconnexion réussie');
    }
  },

  clearError: () => set({ error: null }),
}));
