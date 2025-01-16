<template>
  <v-container>
    <v-row>
      <v-col>
        <ColumnChart />
      </v-col>
      <v-col>
        <PieChart />
      </v-col>
    </v-row>
    <v-row>
      <!-- Additional content here -->
    </v-row>
  </v-container>
</template>

<script setup>
import ColumnChart from './ColumnChart.vue'; // Import the ColumnChart component
import PieChart from './PieChart.vue'; // Import the ColumnChart component

// Define the component
defineComponent({
  name: 'DashboardPage',
  components: { ColumnChart, PieChart } // Add ColumnChart to the components object
});
</script>