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
})
export const useAuthStore = defineStore('auth', {
  state: () => ({
    username: localStorage.getItem('username') || '', // Load from localStorage
    isLoggedIn: localStorage.getItem('isAuthenticated') === 'true' || false, // Load from localStorage
  }),
  actions: {
    login(username, password) {
      if (username === 'admin' && password === '123456') {
        this.username = username;
        this.isLoggedIn = true;

        localStorage.setItem('username', username);
        localStorage.setItem('isAuthenticated', true);

        return true; // Login success
      }
      return false; // Login failed
    },
    logout() {
      this.username = null;
      this.isLoggedIn = false;
      // Clear localStorage
      localStorage.removeItem('username');
      localStorage.removeItem('isLoggedIn');
    },
    initialize() {
      // Listen for storage events to sync state across tabs
      window.addEventListener('storage', (event) => {
        if (event.key === 'isLoggedIn') {
          this.isLoggedIn = event.newValue === 'true';
          this.username = localStorage.getItem('username') || '';
        }
      });
    },
  },
});
