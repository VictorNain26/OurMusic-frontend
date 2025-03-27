let isRefreshing = false;
let refreshPromise = null;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function getAccessToken() {
  return localStorage.getItem('accessToken') || null;
}

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
}

async function tryRefreshToken() {
  if (!isRefreshing) {
    isRefreshing = true;

    refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Échec du refresh token');
        const data = await res.json();
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  let token = getAccessToken();

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.method !== 'DELETE' || options.body ? { 'Content-Type': 'application/json' } : {}),
  };

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include',
    mode: 'cors',
  };

  if (import.meta.env.DEV) {
    console.info('[apiFetch]', fullUrl, fetchOptions);
  }

  let res = await fetch(fullUrl, fetchOptions);
  let text = await res.text();

  if (res.status === 401 && token) {
    try {
      await tryRefreshToken();
      token = getAccessToken();

      if (!token) throw new Error('Session expirée');

      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${token}`,
      };

      res = await fetch(fullUrl, { ...fetchOptions, headers: retryHeaders });
      text = await res.text();
    } catch (err) {
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (!text || text.trim() === '') {
    if (res.ok) return {};
    throw new Error('Réponse vide du serveur.');
  }

  try {
    const json = JSON.parse(text);
    if (!res.ok) {
      throw new Error(json?.error || json?.message || 'Erreur inconnue');
    }
    return json;
  } catch (err) {
    if (!res.ok) throw new Error(text || res.statusText || 'Erreur serveur');
    if (import.meta.env.DEV) console.warn('[apiFetch] Réponse non JSON :', text);
    return text;
  }
}

export function logoutFetch() {
  return fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
}
