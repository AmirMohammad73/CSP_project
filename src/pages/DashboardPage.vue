<!-- dashboardpage.vue -->
<template>
  <v-layout class="rounded rounded-md">
    <SideBar @change-component="changeComponent" />
    <!-- <v-app-bar title="Application bar"></v-app-bar> -->
    <NavBar />
    <v-main class="maincontent">
      <component :is="currentComponent" />
    </v-main>
  </v-layout>
</template>

<script setup>
import SideBar from '../components/SideBar.vue';
import NavBar from '../components/NavBar.vue';
import DashboardContent from '../components/Dashboard.vue';
import InfoEntry from '../components/InfoEntry.vue';
import Users from '../components/Users.vue';
import StatsCharts from '../components/StatsCharts.vue';
import Reports from '@/components/Reports.vue';

let currentComponent = ref(DashboardContent);

function changeComponent(componentName) {
  switch (componentName) {
    case 'Dashboard':
      currentComponent.value = DashboardContent;
      break;
    case 'InfoEntry':
      currentComponent.value = InfoEntry;
      break;
    case 'Users':
      currentComponent.value = Users;
      break;
    case 'StatsCharts':
      currentComponent.value = StatsCharts;
      break;
    case 'Reports':
      currentComponent.value = Reports;
      break;
    default:
      currentComponent.value = DashboardContent; // Default to Dashboard if no match
  }
}

defineComponent({
  name: 'DashboardPage',
  components: { SideBar, NavBar, DashboardContent, InfoEntry, Users, StatsCharts, Reports }
});
</script>
<style scoped>
.maincontent{
  height: 49vw;
  overflow-y: scroll;
}
.rounded{
  position: static !important;
}
</style>
