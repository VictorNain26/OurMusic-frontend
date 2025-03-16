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
    ...(options.headers || {}),
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
  let responseText = await response.text();

  // 🔁 Tentative de refresh si token expiré
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
      responseText = await response.text();
    } catch (err) {
      console.error('🚫 Refresh token échoué:', err);
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  // ✅ Réponse vide ou sans contenu → retour vide
  if (!responseText || responseText.trim() === '') {
    if (response.ok) return {}; // Réponse vide mais OK (ex: 204)
    throw new Error('Réponse vide du serveur.');
  }

  // ✅ Parsing intelligent
  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch (err) {
    console.error('❌ Réponse non parsable:', responseText);
    if (!response.ok) throw new Error(responseText);
    // Si status 200 mais non JSON (rare) → retourner le texte brut
    return responseText;
  }

  // ✅ Gestion des erreurs explicites
  if (!response.ok) {
    const errorMessage = parsed?.error || 'Erreur inconnue';
    console.error('[API ERROR]', errorMessage);
    throw new Error(errorMessage);
  }

  // ✅ Debug utile (optionnel)
  console.log('[apiFetch]', url, '→', parsed);

  return parsed;
}

export function logoutFetch() {
  return fetch('https://ourmusic-api.ovh/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
}

export { getAccessToken, setAccessToken };
