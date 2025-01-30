<template>
  <v-app-bar :elevation="4" :color="$vuetify.theme.global.name === 'dark' ? '#212631' : 'white'" class="app-bar">
    <!-- Account Menu -->
    <v-menu location="bottom left" offset-y transition="slide-y-transition">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" class="account-btn">
          <v-icon icon="mdi-account-circle" size="28"></v-icon>
        </v-btn>
      </template>
      <v-list class="menu-list">
        <v-list-item @click="openChangePasswordDialog">
          <v-list-item-title>
            <div class="menu-item">
              <v-icon icon="mdi-lock" class="mr-2"></v-icon>
              {{ items[0] }}
            </div>
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="openLogoutDialog">
          <v-list-item-title>
            <div class="menu-item logout-text">
              <v-icon icon="mdi-logout" class="mr-2"></v-icon>
              {{ items[1] }}
            </div>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Theme Toggle Button -->
    <v-btn icon @click="toggleTheme" class="theme-btn">
      <v-icon :class="{ 'spin-icon': isThemeToggling }">
        {{ AppStore.isDarkTheme ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
      </v-icon>
    </v-btn>

    <!-- Notification Menu -->
    <v-menu location="bottom end" offset-y transition="slide-y-transition">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" class="notification-btn">
          <v-badge v-if="unseenNotificationsCount" color="error" :content="unseenNotificationsCount">
            <v-icon icon="mdi-bell" size="28"></v-icon>
          </v-badge>
          <v-icon v-else icon="mdi-bell" size="28"></v-icon>
        </v-btn>
      </template>
      <v-list class="notification-menu">
        <v-list-item v-for="(notification, index) in notifications" :key="index"
          :class="['notification-item', { 'seen': notification.seen }]" @click="markAsSeen(index)">
          <v-list-item-content>
            <div class="notification-content-wrapper">
              <v-avatar size="40" class="notification-avatar">
                <v-icon :icon="notification.icon" size="24"></v-icon>
              </v-avatar>
              <div class="notification-details">
                <div class="notification-date">{{ notification.date }}</div>
                <div class="notification-content">{{ notification.content }}</div>
              </div>
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-spacer></v-spacer>

    <span class="title"> GNAF سامانه جامع پایش عملکرد پروژه </span>

    <!-- Change Password Dialog -->
    <v-dialog v-model="changePasswordDialog" max-width="500px" transition="dialog-bottom-transition">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">Change Password</v-card-title>
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
    <v-dialog v-model="logoutDialog" max-width="400px" transition="dialog-bottom-transition">
      <v-card class="dialog-card">
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
import { useAuthStore } from '../stores/app';
import { useAppStore } from '../stores/app';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const AppStore = useAppStore();
    const authStore = useAuthStore();
    const router = useRouter();

    return { AppStore, authStore, router };
  },
  data() {
    return {
      items: ['تغییر پسورد', 'خروج'],
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
      isThemeToggling: false,
    };
  },
  computed: {
    unseenNotificationsCount() {
      return this.notifications.filter((n) => !n.seen).length;
    },
  },
  methods: {
    toggleTheme() {
      this.isThemeToggling = true;
      setTimeout(() => {
        this.isThemeToggling = false;
      }, 300);
      this.AppStore.toggle();
      this.$vuetify.theme.global.name = this.AppStore.isDarkTheme ? 'dark' : 'light';
    },
    openChangePasswordDialog() {
      this.changePasswordDialog = true;
    },
    closeChangePasswordDialog() {
      this.changePasswordDialog = false;
    },
    async confirmChangePassword() {
      if (this.newPassword !== this.repeatNewPassword) {
        alert('New passwords do not match!');
        return;
      }

      try {
        console.log(localStorage.getItem('token'))
        const response = await fetch('http://192.168.47.1:3001/api/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming you store the JWT token in localStorage
          },
          body: JSON.stringify({
            currentPassword: this.currentPassword,
            newPassword: this.newPassword,
            repeatNewPassword: this.repeatNewPassword
          })
        });

        const result = await response.json();

        if (response.ok) {
          alert('Password changed successfully!');
          this.closeChangePasswordDialog();
        } else {
          alert(result.error || 'Failed to change password');
        }
      } catch (error) {
        console.error('Error changing password:', error);
        alert('An error occurred while changing the password');
      }
    },
    openLogoutDialog() {
      this.logoutDialog = true;
    },
    closeLogoutDialog() {
      this.logoutDialog = false;
    },
    confirmLogout() {
      this.authStore.logout();
      this.router.push('/');
      this.closeLogoutDialog();
    },
    markAsSeen(index) {
      this.notifications[index].seen = true;
    },
  },
};
</script>

<style scoped>
.app-bar {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.menu-list {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 14px;
}

.logout-text {
  color: #ff4444;
}

.notification-menu {
  width: 350px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.notification-item {
  padding: 12px;
  transition: background-color 0.3s ease;
}

.notification-item.seen {
  background-color: var(--notification-seen-bg);
}

.notification-item:hover {
  background-color: var(--notification-hover-bg);
}

.notification-content-wrapper {
  display: flex;
  align-items: center;
}

.notification-avatar {
  background-color: transparent;
}

.notification-details {
  margin-left: 12px;
}

.notification-date {
  font-size: 12px;
  color: #666;
}

.notification-content {
  font-size: 14px;
  color: #333;
}

.dialog-card {
  border-radius: 12px;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
}

.theme-btn .spin-icon {
  animation: spin 0.3s ease-in-out;
}

/* Dark Mode Styles */
.v-theme--dark .notification-menu {
  background: rgba(33, 38, 49, 0.9);
  /* Dark background for notifications */
}

.v-theme--dark .notification-item.seen {
  background-color: #000;
  /* Completely black for seen notifications */
}

.v-theme--dark .notification-item:not(.seen) {
  background-color: #1a1a1a;
  /* Slightly lighter black for unseen notifications */
}

.v-theme--dark .notification-date,
.v-theme--dark .notification-content {
  color: #fff;
  /* White text for dark mode */
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>