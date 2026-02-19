const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const checkTokens = async () => {
  const response = await fetch(`${API_BASE_URL}/api/check-tokens`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`Erreur HTTP : ${response.status}`);
  }
  return response.json();
};

export const getToken = async (code) => {
  const response = await fetch(`${API_BASE_URL}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Erreur HTTP : ${response.status}`);
  }
  return response.json();
};

export const refreshToken = async () => {
  const response = await fetch(`${API_BASE_URL}/api/refresh-token`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`Erreur HTTP : ${response.status}`);
  }
  return response.json();
};

export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/api/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`Erreur HTTP : ${response.status}`);
  }
  return response.json();
};

export const fetchSpotifyData = async (path, options = {}) => {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const response = await fetch(`${API_BASE_URL}/api/spotify/${cleanPath}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Erreur HTTP : ${response.status} - ${errorData.error || 'Erreur inconnue'}${errorData.details ? ` (${errorData.details.error.message})` : ''}`);
  }
  return response.json();
};

export const getMissedReleases = async () => {
  const response = await fetch(`${API_BASE_URL}/api/missed-releases`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Erreur HTTP : ${response.status}`);
  }
  return response.json();
};

export const getEmailPreferences = async () => {
  const response = await fetch(`${API_BASE_URL}/api/email-preferences`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Erreur HTTP : ${response.status}`);
  }
  return response.json();
};

export const setEmailPreferences = async (enabled) => {
  const response = await fetch(`${API_BASE_URL}/api/email-preferences`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Erreur HTTP : ${response.status}`);
  }
  return response.json();
};