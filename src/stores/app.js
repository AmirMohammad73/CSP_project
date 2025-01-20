// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    isDarkTheme: false
    //
  }),
  actions: {
    toggle () {
      this.isDarkTheme = !this.isDarkTheme
    }
  }
})
export const useAuthStore = defineStore('auth', {
  state: () => ({
    username: '', // To store the username of the logged-in user
    isLoggedIn: false, // To track login status
  }),
  actions: {
    login(username, password) {
      if (username === 'admin' && password === '123456') {
        this.username = username;
        this.isLoggedIn = true;
        return true; // Login success
      }
      return false; // Login failed
    },
    logout() {
      this.username = '';
      this.isLoggedIn = false;
    },
  },
});
