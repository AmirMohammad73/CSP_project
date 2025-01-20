<template v-slot:prepend>
  <v-navigation-drawer app location="right" permanent @update:expanded="false">
    <!-- User Info -->
    <v-list-item lines="two" prepend-avatar="https://randomuser.me/api/portraits/women/81.jpg" subtitle="Logged in"
      :title="username"></v-list-item>
    <v-divider></v-divider>

    <!-- Navigation Items -->
    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-view-dashboard" title="داشبورد" value="home" class="white--text"
        @click="$emit('change-component', 'Dashboard')"></v-list-item>
      <v-list-item prepend-icon="mdi-pencil" title="ورود اطلاعات" value="account" class="white--text"
        @click="$emit('change-component', 'InfoEntry')"></v-list-item>
      <v-list-item prepend-icon="mdi-account-group" title="Users" value="users" class="white--text"
        @click="$emit('change-component', 'Users')"></v-list-item>
      <v-list-item prepend-icon="mdi-chart-bar" title="آمارها" value="stats" class="white--text"
        @click="$emit('change-component', 'StatsCharts')"></v-list-item>
      <v-list-item prepend-icon="mdi-file-document" title="گزارشگیری" value="reports" class="white--text"
        @click="$emit('change-component', 'Reports')"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { useAuthStore } from '../stores/app'; // Import the Pinia auth store

export default {
  emits: ['change-component'],
  setup() {
    const authStore = useAuthStore(); // Access the auth store
    const username = authStore.username; // Retrieve the logged-in username

    return {
      username, // Pass the username to the template
    };
  },
};
</script>

<style scoped>
.v-navigation-drawer .v-list-item {
  color: white !important;
  /* Force the text color to always be white */
}

.v-navigation-drawer {
  height: 100vh !important; /* Forces the drawer to take the entire screen height */
  overflow-y: auto; /* Enables scrolling if content exceeds the viewport height */
  background-color: #212631;
}

/* Add any custom styles here */
</style>