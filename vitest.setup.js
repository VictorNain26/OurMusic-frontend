import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { authClient } from './src/lib/authClient.jsx';

// Mock global de Better Auth pour tous les tests
beforeEach(() => {
  vi.spyOn(authClient.signUp, 'email').mockResolvedValue({
    data: { user: { email: 'testuser@example.com' } },
    error: null,
  });

  vi.spyOn(authClient.signIn, 'email').mockResolvedValue({
    data: { user: { email: 'testuser@example.com' } },
    error: null,
  });

  vi.spyOn(authClient, 'sendVerificationEmail').mockResolvedValue({
    error: null,
  });

  vi.spyOn(authClient, 'useSession').mockReturnValue({
    data: { user: { email: 'testuser@example.com', role: 'user', emailVerified: true }, expires: new Date(Date.now() + 3600 * 1000).toISOString() },
    isPending: false,
    error: null,
    refetch: vi.fn(),
  });

  vi.spyOn(authClient, 'signOut').mockResolvedValue({ error: null });
});

afterEach(() => {
  vi.restoreAllMocks();
});
