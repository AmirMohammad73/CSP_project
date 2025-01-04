<template>
  <div>
    <!-- Add a key to force re-render when the theme changes -->
    <apexchart :key="chartKey" type="pie" :options="chartOptions" :series="series"></apexchart>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import ApexCharts from 'vue3-apexcharts';
import { useAppStore } from '../stores/app'; // Import the AppStore

export default defineComponent({
  components: {
    apexchart: ApexCharts,
  },
  setup() {
    const AppStore = useAppStore();
    return { AppStore };
  },
  data() {
    return {
      series: [44, 55, 41, 17, 15], // Example data for the pie chart
      chartOptions: {
        chart: {
          type: 'pie',
        },
        colors: this.AppStore.isDarkTheme
          ? ["#00E396", "#008FFB", "#FEB019", "#FF4560", "#775DD0"] // Dark mode colors
          : ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0"], // Light mode colors
        labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'],
        dataLabels: {
          enabled: true,
        },
        stroke: {
          show: false,
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + ' %';
            },
          },
        },
        fill: {
          opacity: 1,
        },
        theme: {
          mode: this.AppStore.isDarkTheme ? 'dark' : 'light', // Set initial theme
        },
      },
      chartKey: 0, // Key to force re-render
    };
  },
  watch: {
    // Watch for changes in the theme and update the chart options
    'AppStore.isDarkTheme': {
      handler(newVal) {
        this.chartOptions.theme.mode = newVal ? 'dark' : 'light';
        this.chartOptions.colors = newVal
          ? ["#00E396", "#008FFB", "#FEB019", "#FF4560", "#775DD0"] // Dark mode colors
          : ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0"]; // Light mode colors
        this.chartKey++; // Increment key to force re-render
      },
      immediate: true,
    },
  },
});
</script>

<style scoped>
/* You can add any custom styles here */
</style>