import { createAuthClient } from 'better-auth/react';
import { API_BASE_URL } from '../utils/config';

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  onError: (err) => {
    if (import.meta.env.DEV) {
      console.warn('[authClient Error]', err);
    }
  }
});
