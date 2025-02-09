<template>
  <v-container>
    <v-row>
      <v-col>
        <Card :number="4721" title="آمار عملیات میدانی" emoji="🛠️"
          cardColor="linear-gradient(135deg, #ff9800, #f44336)" />
      </v-col>
      <v-col>
        <Card :number="5678" title="آمایش داده ها" emoji="📊" cardColor="linear-gradient(135deg, #4caf50, #388e3c)" />
      </v-col>
      <v-col>
        <Card :number="9234" title="وضعیت نقشه" emoji="🗺️" cardColor="linear-gradient(135deg, #2196f3, #1565c0)" />
      </v-col>
      <v-col>
        <Card :number="3142" title="ژئوکد" emoji="📍" cardColor="linear-gradient(135deg, #ff5722, #e64a19)" />
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
      <!-- Additional content here -->
    </v-row>
  </v-container>
</template>

<script setup>
import ColumnChart from './ColumnChart.vue'; // Import the ColumnChart component
import PieChart from './PieChart.vue'; // Import the ColumnChart component
import Card from './Card.vue';

// Define the component
defineComponent({
  name: 'DashboardPage',
  components: { ColumnChart, PieChart, Card } // Add ColumnChart to the components object
});
</script>