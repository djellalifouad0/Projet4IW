
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  // Endpoints qui ne nécessitent pas d'authentification
  const publicEndpoints = [
    '/auth/login',
    '/auth/register', 
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/validate'
  ];
  
  // Vérifier si l'URL correspond à un endpoint public
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    config.url && config.url.includes(endpoint)
  );
  
  // Ajouter le token seulement si ce n'est pas un endpoint public
  if (!isPublicEndpoint) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

export default api

