<template>
  <v-card flat elevation="2" dir="rtl" class="pa-6 rounded">
    <!-- Tabs -->
    <v-tabs v-model="tab" background-color="primary" dark grow>
      <v-tab value="locations">روستایی</v-tab>
      <v-tab value="other">شهری</v-tab>
    </v-tabs>

    <!-- Tab Content -->
    <v-window v-model="tab">
      <!-- First Tab: Locations Management -->
      <v-window-item value="locations">
        <LocationsManagement />
      </v-window-item>

      <!-- Second Tab: NO DATA -->
      <v-window-item value="other">
        <NoDataTab />
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script>
import LocationsManagement from './LocationsManagement.vue';
import NoDataTab from './NoDataTab.vue';

export default {
  components: {
    LocationsManagement,
    NoDataTab,
  },
  data() {
    return {
      tab: 'locations', // To manage the current active tab with default value
    };
  },
};
</script>
