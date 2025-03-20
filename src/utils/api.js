let isRefreshing = false;
let refreshPromise = null;

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
    refreshPromise = fetch('https://ourmusic-api.ovh/api/auth/refresh', {
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
      .finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiFetch(url, options = {}) {
  let accessToken = getAccessToken();

  const mergedHeaders = {
    ...(options.headers || {}),
    Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    'Content-Type': 'application/json',
  };

  if (options.method === 'DELETE' && !options.body) {
    delete mergedHeaders['Content-Type'];
  }

  const fetchOptions = {
    ...options,
    headers: mergedHeaders,
    credentials: 'include',
    mode: 'cors',
  };

  if (import.meta.env.DEV) {
    console.info('🔍 apiFetch:', url, fetchOptions);
  }

  let response = await fetch(url, fetchOptions);
  let responseText = await response.text();

  if (response.status === 401 && accessToken) {
    if (import.meta.env.DEV) console.warn('⚠️ Access token expiré. Tentative de refresh...');
    try {
      await tryRefreshToken();
      accessToken = getAccessToken();

      const retryHeaders = {
        ...mergedHeaders,
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      };

      response = await fetch(url, { ...fetchOptions, headers: retryHeaders });
      responseText = await response.text();
    } catch (err) {
      console.error('🚫 Refresh échoué :', err);
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (!responseText || responseText.trim() === '') {
    if (response.ok) return {};
    throw new Error('Réponse vide du serveur.');
  }

  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('🛈 Réponse non parsable JSON, texte brut :', responseText);
    }
    if (!response.ok) throw new Error(responseText || response.statusText || 'Erreur serveur');
    return responseText;
  }

  if (!response.ok) {
    const errorMessage = parsed?.error || parsed?.message || response.statusText || 'Erreur inconnue';
    throw new Error(errorMessage);
  }

  return parsed;
}

export function logoutFetch() {
  return fetch('https://ourmusic-api.ovh/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
}
