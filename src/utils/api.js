import { API_BASE_URL } from './config';

export async function apiFetch(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const headers = {
    ...(options.headers || {}),
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
