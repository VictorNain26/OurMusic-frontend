// src/utils/api.js
import { API_BASE_URL } from './config';

export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const fetchOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include', // ⚠️ Important pour que le cookie HttpOnly soit envoyé
    mode: 'cors', // Assure le CORS pour frontend-backend séparés
  };

  if (import.meta.env.DEV) {
    console.info('[apiFetch] Request:', url, fetchOptions);
  }

  let response;
  let responseBody;

  try {
    response = await fetch(url, fetchOptions);

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    responseBody = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage = responseBody?.error || responseBody?.message || response.statusText;
      throw new Error(errorMessage);
    }

    return responseBody;
  } catch (error) {
    console.error('[apiFetch Error]', error);

    if (!response) {
      throw new Error('Impossible de contacter le serveur.');
    }

    throw new Error(
      responseBody?.error ||
        responseBody?.message ||
        response.statusText ||
        'Erreur réseau inconnue.'
    );
  }
}
