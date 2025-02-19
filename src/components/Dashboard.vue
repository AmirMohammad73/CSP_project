<template>
  <v-container>
    <v-row>
      <v-col>
        <Card url="updatecount" title="آمار عملیات میدانی" emoji="🛠️"
          cardColor="linear-gradient(135deg, #81d4fa, #64b5f6)" />
      </v-col>
      <v-col>
        <Card url="dadehcount" title="آمار داده آمائی" emoji="📊"
          cardColor="linear-gradient(135deg, #64b5f6, #2196f3)" />
      </v-col>
      <v-col>
        <Card url="mapcount" title="آمار نقشه" emoji="🗺️" cardColor="linear-gradient(135deg, #2196f3, #1565c0)" />
      </v-col>
      <v-col>
        <Card url="geocount" title="آمار ژئوکد" emoji="📍" cardColor="linear-gradient(135deg, #1565c0, #607d8b)" />
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
    <v-row>
      <v-col>
        <Medals title="برترین استانها در عملیات میدانی هفته گذشته" />
      </v-col>
      <v-col>
        <Medals title="برترین استانها در داده آمائی هفته گذشته" />
      </v-col>
      <v-col>
        <Medals title="برترین استانها در ژئوکد هفته گذشته" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import ColumnChart from './ColumnChart.vue'; // Import the ColumnChart component
import PieChart from './PieChart.vue'; // Import the ColumnChart component
import Card from './Card.vue';
import LineChart from './LineChart.vue';
import Medals from './Medals.vue';
// Define the component
defineComponent({
  name: 'DashboardPage',
  components: { ColumnChart, PieChart, Card, LineChart, Medals }
});
</script>