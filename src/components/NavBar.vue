<template>
  <v-app-bar :elevation="4" :color="$vuetify.theme.global.name === 'dark' ? '#212631' : 'white'" border>
    <v-app-bar-nav-icon></v-app-bar-nav-icon>

    <!-- Account Menu -->
    <v-menu location="bottom left" offset-y>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon icon="mdi-account-circle"></v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="openChangePasswordDialog">
          <v-list-item-title>
            <div class="menu" style="direction: rtl;">{{ items[0] }}</div>
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="openLogoutDialog">
          <v-list-item-title>
            <div class="menu" style="direction: rtl; color: red;">{{ items[1] }}</div>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Theme Toggle Button -->
    <v-btn icon @click="toggleTheme">
      <v-icon>{{ AppStore.isDarkTheme ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>

    <!-- Notification Menu -->
    <v-menu location="bottom end" offset-y>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon icon="mdi-bell"></v-icon>
        </v-btn>
      </template>
      <v-list class="notification-menu">
        <v-list-item v-for="(notification, index) in notifications" :key="index"
          :class="['notification-item', { 'seen': notification.seen }]" @click="markAsSeen(index)">
          <v-list-item-content>
            <v-list-item-title>
              <div style="display: flex; align-items: center;">
                <v-icon :icon="notification.icon" class="mr-2"></v-icon>
                <div>
                  <div class="notification-date">{{ notification.date }}</div>
                  <div class="notification-content">{{ notification.content }}</div>
                </div>
              </div>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider v-if="index < notifications.length - 1"></v-divider>
      </v-list>
    </v-menu>

    <v-spacer></v-spacer>

    <span class="title">Application</span>

    <!-- Change Password Dialog -->
    <v-dialog v-model="changePasswordDialog" max-width="500px">
      <v-card>
        <v-card-title>Change Password</v-card-title>
        <v-card-text>
          <v-text-field v-model="currentPassword" label="Current Password" type="password" outlined></v-text-field>
          <v-text-field v-model="newPassword" label="New Password" type="password" outlined></v-text-field>
          <v-text-field v-model="repeatNewPassword" label="Repeat New Password" type="password" outlined></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="confirmChangePassword">Confirm</v-btn>
          <v-btn color="error" @click="closeChangePasswordDialog">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Logout Confirmation Dialog -->
    <v-dialog v-model="logoutDialog" max-width="400px">
      <v-card>
        <v-card-title>خروج</v-card-title>
        <v-card-text>آیا مطمئن هستید که می‌خواهید خارج شوید؟</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="confirmLogout">بله</v-btn>
          <v-btn color="error" @click="closeLogoutDialog">خیر</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>
<script>
import { useAuthStore } from '../stores/app'; // Import the auth store
import { useAppStore } from '../stores/app'; // Import any necessary store
import { useRouter } from 'vue-router'; // Import Vue Router

export default {
  setup() {
    const AppStore = useAppStore();
    const authStore = useAuthStore(); // Access the auth store
    const router = useRouter(); // Access the router

    const toggleValue = () => {
      AppStore.toggle(); // Calls the store's toggle action
    };

    return { AppStore, authStore, toggleValue, router };
  },
  data() {
    return {
      items: ['تغییر پسورد', 'خروج'], // Menu items
      changePasswordDialog: false,
      logoutDialog: false,
      currentPassword: '',
      newPassword: '',
      repeatNewPassword: '',
      notifications: [
        { date: '2023-10-01', content: 'You have a new message', icon: 'mdi-email', seen: false },
        { date: '2023-10-02', content: 'System update available', icon: 'mdi-alert', seen: true },
        { date: '2023-10-03', content: 'New friend request', icon: 'mdi-account-plus', seen: false },
      ],
    };
  },
  methods: {
    toggleTheme() {
      this.AppStore.toggle();
      this.$vuetify.theme.global.name = this.AppStore.isDarkTheme ? 'dark' : 'light';
      this.updateThemeStyles();
    },
    openChangePasswordDialog() {
      this.changePasswordDialog = true;
    },
    closeChangePasswordDialog() {
      this.changePasswordDialog = false;
      this.currentPassword = '';
      this.newPassword = '';
      this.repeatNewPassword = '';
    },
    confirmChangePassword() {
      if (this.newPassword === this.repeatNewPassword) {
        alert("Password changed successfully!"); // Replace with your actual logic
        this.closeChangePasswordDialog();
      } else {
        alert("New passwords do not match!");
      }
    },
    openLogoutDialog() {
      this.logoutDialog = true;
    },
    closeLogoutDialog() {
      this.logoutDialog = false;
    },
    confirmLogout() {
      // Clear authentication state and redirect to login
      this.authStore.logout(); // Call the logout action in the auth store
      this.router.push('/'); // Redirect to the login page
      this.closeLogoutDialog(); // Close the logout dialog
    },
    markAsSeen(index) {
      this.notifications[index].seen = true;
    },
    updateThemeStyles() {
      if (this.AppStore.isDarkTheme) {
        document.documentElement.style.setProperty('--notification-seen-bg', '#0a0a0a');
        document.documentElement.style.setProperty('--notification-hover-bg', '#1f1f1f');
      } else {
        document.documentElement.style.setProperty('--notification-seen-bg', '#f5f5f5');
        document.documentElement.style.setProperty('--notification-hover-bg', '#e0e0e0');
      }
    },
  },
  mounted() {
    this.updateThemeStyles(); // Set initial theme styles
  },
  watch: {
    'AppStore.isDarkTheme': 'updateThemeStyles', // Watch for theme changes
  },
};
</script>

<style scoped>
.title {
  font-size: 1.25rem;
}

.menu {
  font-family: 'B Traffic';
}

.notification-menu {
  width: 350px;
  /* Wider menu */
}

.notification-item {
  padding: 8px 16px;
  transition: background-color 0.3s ease;
}

.notification-item.seen {
  background-color: var(--notification-seen-bg);
}

.notification-item:hover {
  background-color: var(--notification-hover-bg);
}

.notification-icon {
  margin-right: 12px;
}

.notification-date {
  font-size: 0.75rem;
  color: grey;
}

.notification-content {
  font-size: 0.875rem;
}
</style>