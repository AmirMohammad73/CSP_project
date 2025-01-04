// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    isDarkTheme: false,
    //
  }),
  actions: {
    toggle() {
      this.isDarkTheme = !this.isDarkTheme;
    },
  },
})
