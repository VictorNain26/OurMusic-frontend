let isRefreshing = false;
let refreshPromise = null;

function getAccessToken() {
  return localStorage.getItem('accessToken') || null;
}

function setAccessToken(token) {
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
        if (!res.ok) throw new Error('Échec refresh token');
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
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (accessToken) {
    mergedHeaders['Authorization'] = 'Bearer ' + accessToken;
  }

  const fetchOptions = {
    credentials: 'include',
    mode: 'cors',
    ...options,
    headers: mergedHeaders,
  };

  let response = await fetch(url, fetchOptions);

  if (response.status === 401 && accessToken) {
    console.log('⚠️ Access token expiré, tentative de refresh...');
    try {
      await tryRefreshToken();
      accessToken = getAccessToken();
      const secondHeaders = {
        ...mergedHeaders,
        Authorization: 'Bearer ' + accessToken,
      };
      response = await fetch(url, { ...fetchOptions, headers: secondHeaders });
    } catch (err) {
      console.log('🚫 Refresh token échoué:', err);
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  const responseText = await response.text();

  if (!response.ok) {
    console.error('[API ERROR]', responseText);
    try {
      const errorJson = JSON.parse(responseText);
      throw new Error(errorJson?.error || 'Erreur serveur');
    } catch {
      throw new Error('Erreur API non parsable');
    }
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return {};
  }
}

export function logoutFetch() {
  return fetch('https://ourmusic-api.ovh/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
}

export { getAccessToken, setAccessToken };
