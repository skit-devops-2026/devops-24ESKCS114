const api = {
  getToken() {
    return localStorage.getItem('mfy_token');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('mfy_user'));
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('mfy_token', token);
    localStorage.setItem('mfy_user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('mfy_token');
    localStorage.removeItem('mfy_user');
  },

  async request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
      body: options.body && typeof options.body !== 'string'
        ? JSON.stringify(options.body)
        : options.body,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API request failed');
    return data;
  },

  get(endpoint, params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null),
    ).toString();
    return this.request(query ? `${endpoint}?${query}` : endpoint);
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

export default api;