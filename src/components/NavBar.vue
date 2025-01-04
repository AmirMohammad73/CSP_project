<template>
  <v-app-bar :elevation="4" :color="$vuetify.theme.global.name === 'dark' ? '#212631' : 'white'" border>
    <v-app-bar-nav-icon></v-app-bar-nav-icon>

    <v-menu location="bottom left" offset-y>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon icon="mdi-account-circle"></v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="changePassword">
          <v-list-item-title>
            <div class="menu" style="direction: rtl;">{{ items[0] }}</div>
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="exitApplication">
          <v-list-item-title>
            <div class="menu" style="direction: rtl;">{{ items[1] }}</div>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-btn icon @click="toggleTheme">
      <v-icon>{{ AppStore.isDarkTheme ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>

    <v-btn icon>
      <v-icon icon="mdi-bell"></v-icon>
    </v-btn>

    <v-spacer></v-spacer>

    <span class="title">Application</span>
  </v-app-bar>
</template>

<script>
import { useAppStore } from '../stores/app';
export default {
  setup() {
    const AppStore = useAppStore();

    const toggleValue = () => {
      AppStore.toggle(); // Calls the store's toggle action
    };

    return { AppStore, toggleValue };
  },
  data() {
    return {
      items: ['تغییر پسورد', 'خروج'],
    };
  },
  methods: {
    toggleTheme() {
      this.AppStore.toggle();
      this.$vuetify.theme.global.name = this.AppStore.isDarkTheme ? 'dark' : 'light';
    },
    changePassword() {
      // Add your logic to handle password change here
      alert("Change Password clicked!"); // Replace with your actual logic
    },
    exitApplication() {
      // Add your logic to handle application exit here
      alert("Exit clicked!"); // Replace with your actual logic
    },
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
</style>