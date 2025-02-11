<template>
  <v-container>
    <v-row>
      <v-col>
        <Card url="updatecount" title="آمار عملیات میدانی" emoji="🛠️"
          cardColor="linear-gradient(135deg, #ff9800, #ff5722)" />
      </v-col>
      <v-col>
        <Card url="dadehcount" title="آمار داده آمائی" emoji="📊"
          cardColor="linear-gradient(135deg, #4caf50, #388e3c)" />
      </v-col>
      <v-col>
        <Card url="mapcount" title="آمار نقشه" emoji="🗺️" cardColor="linear-gradient(135deg, #2196f3, #1565c0)" />
      </v-col>
      <v-col>
        <Card url="geocount" title="آمار ژئوکد" emoji="📍"
          cardColor="linear-gradient(135deg, #e91e63, #d81b60)" />
      </v-col>

    </v-row>
    <v-row>
      <v-col>
        <ColumnChart />
      </v-col>
      <v-col>
        <PieChart />
      </v-col>
    </v-row>
    <v-row>
      <LineChart />
    </v-row>
  </v-container>
</template>

<script setup>
import ColumnChart from './ColumnChart.vue'; // Import the ColumnChart component
import PieChart from './PieChart.vue'; // Import the ColumnChart component
import Card from './Card.vue';
import LineChart from './LineChart.vue';
// Define the component
defineComponent({
  name: 'DashboardPage',
  components: { ColumnChart, PieChart, Card, LineChart } // Add ColumnChart to the components object
});
</script>