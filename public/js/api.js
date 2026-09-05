/**
 * MovForYou - Centralized API Client
 */

// Automatically connects to Express backend on port 3000 even if opened on port 8080/5500
const API_BASE = (window.location.port && window.location.port !== '3000')
  ? 'http://localhost:3000/api'
  : '/api';

const api = {
  getToken() {
    return localStorage.getItem('mfy_token');
  },

  setToken(token) {
    localStorage.setItem('mfy_token', token);
  },

  removeToken() {
    localStorage.removeItem('mfy_token');
    localStorage.removeItem('mfy_user');
  },

  getUser() {
    try {
      const user = localStorage.getItem('mfy_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem('mfy_user', JSON.stringify(user));
  },

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
      },
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  },

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'GET' });
  },

  post(endpoint, body = {}) {
    return this.request(endpoint, { method: 'POST', body });
  },

  put(endpoint, body = {}) {
    return this.request(endpoint, { method: 'PUT', body });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};