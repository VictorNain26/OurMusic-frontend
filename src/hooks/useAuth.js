import { useEffect, useState } from 'react';
import { apiFetch, getAccessToken, setAccessToken, logoutFetch } from '../utils/api';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const [userInfo, setUserInfo] = useState(null);

  const fetchUser = async () => {
    try {
      const data = await apiFetch('https://ourmusic-api.ovh/api/auth/me');
      setUserInfo(data);
    } catch {
      setUserInfo(null);
      setAccessToken(null);
    }
  };

  const logout = async () => {
    try {
      await logoutFetch();
      setAccessToken(null);
      setUserInfo(null);
      toast.success('Déconnecté avec succès');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (getAccessToken()) fetchUser();
  }, []);

  return { userInfo, setUserInfo, logout };
};