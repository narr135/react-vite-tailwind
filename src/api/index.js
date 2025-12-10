import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const instance = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  // timeout: 5000,
});

// attach token automatically if present
instance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    // ignore
  }
  return config;
}, (error) => Promise.reject(error));

// API functions
export const api = {
  // Auth
  register: async ({ name, email, password }) => {
    const res = await instance.post('/auth/register', { name, email, password });
    return res.data;
  },
  login: async ({ email, password }) => {
    const res = await instance.post('/auth/login', { email, password });
    return res.data;
  },

  // Items
  getItems: async ({ page = 1, limit = 100, q = '' } = {}) => {
    const res = await instance.get('/items', { params: { page, limit, q }});
    return res.data;
  },
  getItemById: async (id) => {
    const res = await instance.get(`/items/${id}`);
    return res.data;
  },
  createItem: async (payload) => {
    // payload: { title, description, price, imageUrl, tags }
    const res = await instance.post('/items', payload);
    return res.data;
  }
};

export default instance;