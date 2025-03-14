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

// Tentative de refresh si l'access token est expiré
async function tryRefreshToken() {
  // Pour éviter d’appeler /refresh plusieurs fois en parallèle
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = fetch('https://ourmusic-api.ovh/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error("Echec refresh token");
      }
      const data = await res.json();
      // data.accessToken => le nouveau token
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

// src/utils/api.js
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
    console.log('Access token expiré, tentative de refresh...');
    try {
      await tryRefreshToken();
      accessToken = getAccessToken();
      const secondHeaders = {
        ...mergedHeaders,
        Authorization: 'Bearer ' + accessToken,
      };

      response = await fetch(url, { ...fetchOptions, headers: secondHeaders });
    } catch (err) {
      console.log('Échec du refresh token :', err);
      throw new Error('Token expiré');
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[API ERROR]', errorText);
    throw new Error('Une erreur est survenue. Veuillez réessayer plus tard.');
  }

  return response.json();
}


export function logoutFetch() {
  // Appel pour effacer le cookie refresh
  return fetch('https://ourmusic-api.ovh/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
}

export { getAccessToken, setAccessToken };
