// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    isDarkTheme: false
    //
  }),
  actions: {
    toggle() {
      this.isDarkTheme = !this.isDarkTheme
    }
  }
});
export const useIPStore = defineStore('address', {
  state: () => ({
    SERVER_HOST: '172.16.8.33'
    //
  }),
});
export const useAuthStore = defineStore('auth', {
  state: () => ({
    username: localStorage.getItem('username') || '',
    isLoggedIn: localStorage.getItem('isAuthenticated') === 'true' || false,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    async login(username, password) {
      console.log(password);
      try {
        const response = await fetch(`http://172.16.8.33:3001/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          throw new Error('Login failed');
        }

        const { token } = await response.json();

        // Store token and user info
        this.token = token;
        this.username = username;
        this.isLoggedIn = true;

        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('isAuthenticated', true);

        return true; // Login success
      } catch (error) {
        console.error('Login error:', error);
        return false; // Login failed
      }
    },
    logout() {
      // Optionally, call the logout API to blacklist the token
      fetch(`http://172.16.8.33:3001/api/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` },
      });
      // Clear state and localStorage
      this.token = null;
      this.username = '';
      this.isLoggedIn = false;
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('isAuthenticated');

    },
    initialize() {
      // Sync state across tabs
      window.addEventListener('storage', (event) => {
        if (event.key === 'isAuthenticated') {
          this.isLoggedIn = event.newValue === 'true';
          this.username = localStorage.getItem('username') || '';
        }
      });
    },
  },
});