// src/utils/api.js
export async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include', // inclure les cookies
    mode: 'cors',           // requête CORS
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Erreur API');
  }
  
  return response.json();
}
