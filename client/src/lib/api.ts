const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://temu-referidos-api.onrender.com';

const endpoint = '/api/queue'; // siempre con slash inicial para concatenar bien

const url = new URL(endpoint, API_BASE_URL).toString();

// Ejemplo simple para probar la conexión con GET
fetch(url, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // si el backend usa cookies, incluir credenciales
})
  .then(res => {
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  })
  .then(data => console.log(data))
  .catch(console.error);


// Función genérica para peticiones API
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: any
): Promise<Response> {
  // Asegúrate que endpoint empieza con "/"
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // importante para cookies/sesiones si usas
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = response.statusText;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch {
      // Ignorar error JSON
    }
    throw new Error(errorMessage);
  }

  return response;
}
