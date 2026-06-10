const BASE_URL = import.meta.env.VITE_API_URL;

export const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('cinnapom_token');

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const contentType = response.headers.get('Content-Type');
  // O backend pode retornar 204 No Content, ou algo sem JSON
  if (response.status === 204 || !contentType?.includes('application/json')) {
    return null;
  }

  return response.json();
};
