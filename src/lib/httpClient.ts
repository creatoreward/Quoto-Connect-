export const getApiUrl = (path: string) => {
  // In development, the base URL is usually the window origin for web.
  // For Capacitor/Mobile, it MUST be the hosted backend URL.
  const baseUrl = import.meta.env.VITE_API_URL || '';
  
  // If path starts with http, return it as is
  if (path.startsWith('http')) return path;
  
  // Clean up slashes
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBase}${cleanPath}`;
};
