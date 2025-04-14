import { describe, it, expect } from 'vitest';
import { authClient } from './authClient.jsx';

describe('Better Auth Client', () => {
  const testEmail = 'testuser@example.com';
  const testPassword = 'testpassword';

  it('should sign up a new user', async () => {
    const res = await authClient.signUp.email({
      email: testEmail,
      password: testPassword,
      name: 'Test User',
    });

    expect(res.error).toBeFalsy();
    expect(res.data?.user?.email).toBe(testEmail);
  });

  it('should sign in the user', async () => {
    const res = await authClient.signIn.email({
      email: testEmail,
      password: testPassword,
    });

    expect(res.error).toBeFalsy();
    expect(res.data?.user?.email).toBe(testEmail);
  });

  it('should send a verification email', async () => {
    const res = await authClient.sendVerificationEmail({
      email: testEmail,
    });

    expect(res.error).toBeFalsy();
  });

  it('should send a reset password email', async () => {
    const res = await authClient.sendResetPassword({
      email: testEmail,
    });

    expect(res.error).toBeFalsy();
  });
});
