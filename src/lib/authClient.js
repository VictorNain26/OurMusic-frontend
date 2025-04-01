import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  onError: (err) => {
    if (import.meta.env.DEV) {
      console.warn('[authClient Error]', err);
    }
  }
});
