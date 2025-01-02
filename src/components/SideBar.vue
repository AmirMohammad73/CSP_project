<template v-slot:prepend>
  <v-navigation-drawer app location="right" permanent @update:expanded="false">
    <v-list-item lines="two" prepend-avatar="https://randomuser.me/api/portraits/women/81.jpg" subtitle="Logged in" title="Jane Smith"></v-list-item>
    <v-divider></v-divider>
    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-home-city" title="داشبورد" value="home" class="white--text"
        @click="$emit('change-component', 'Dashboard')"></v-list-item>
      <v-list-item prepend-icon="mdi-account" title="ورود اطلاعات" value="account" class="white--text"
        @click="$emit('change-component', 'InfoEntry')"></v-list-item>
      <v-list-item prepend-icon="mdi-account-group-outline" title="Users" value="users" class="white--text"
        @click="$emit('change-component', 'Users')"></v-list-item>
      <v-list-item prepend-icon="mdi-account-group-outline" title="آمارها" value="stats" class="white--text"
        @click="$emit('change-component', 'StatsCharts')"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  emits: ['change-component'],
};
</script>

<style scoped>
.v-navigation-drawer {
  background-color: #212631;
}
/* Add any custom styles here */
</style>
