<template>
  <v-container>
    <v-card>
      <v-card-title>Radar Chart</v-card-title>
      <v-card-text>
        <apexchart type="radar" height="350" :options="chartOptions" :series="series"></apexchart>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";

export default {
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      chartOptions: {
        chart: {
          type: "radar",
        },
        xaxis: {
          categories: ["Speed", "Strength", "Agility", "Endurance", "Flexibility"],
        },
      },
      series: [
        {
          name: "Attributes",
          data: [80, 90, 70, 85, 75],
        },
      ],
    };
  },
};
</script>

<style>
</style>
