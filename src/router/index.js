import { createRouter, createWebHistory } from 'vue-router/auto';
import { setupLayouts } from 'virtual:generated-layouts';
import LoginPage from '../pages/LoginPage.vue';
import DashboardPage from '../pages/DashboardPage.vue';
import { useAuthStore } from '../stores/app';
import NotFoundPage from '@/pages/NotFoundPage.vue';

// Routes definition
const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/dashboard', // Use a dynamic path with regex matching
    name: 'Dynamic',
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/:dynamicPath(.*)', // Use a dynamic path with regex matching
    name: 'NotFound',
    component: NotFoundPage,
  },  
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
});

// Navigation guard to protect routes and handle redirects
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const username = localStorage.getItem('username');

  // Redirect to /dashboard if trying to access login page while logged in
  if (to.path === '/' && username) {
    next({ path: '/dashboard' }); // Redirect to dashboard
  } 
  // Redirect to login page if trying to access protected routes without being logged in
  else if (to.meta.requiresAuth && !username) {
    next({ path: '/' }); // Redirect to login
  } else {
    next(); // Allow navigation
  }
});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error');
      localStorage.setItem('vuetify:dynamic-reload', 'true');
      location.assign(to.fullPath);
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload');
});

export default router;