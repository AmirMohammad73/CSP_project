/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import { useAuthStore } from './stores/app'
// Components
import App from './App.vue'
import router from './router'
// Composables
import { createApp } from 'vue'
import { createPinia } from 'pinia';
const app = createApp(App)
const pinia = createPinia();
registerPlugins(app);
app.use(pinia);
app.use(router);
// Initialize the auth store
const authStore = useAuthStore();
authStore.initialize();

app.mount('#app')
