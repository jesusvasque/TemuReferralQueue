const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://temu-referidos-api.onrender.com';
const endpoint = 'api/queue';

const url = new URL(endpoint, API_BASE_URL).toString();

fetch(url, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
});
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: any
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(data && { 'Content-Type': 'application/json' }),
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = response.statusText;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch {
      // Use response.statusText if JSON parsing fails
    }
    
    throw new Error(errorMessage);
  }

  return response;
}
