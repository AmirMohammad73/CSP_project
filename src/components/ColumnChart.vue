<template>
  <div>
    <!-- Add a key to force re-render when the theme changes -->
    <apexchart :key="chartKey" type="bar" :options="chartOptions" :series="series"></apexchart>
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
      series: [
        {
          name: 'Sales',
          data: [30, 40, 45, 50, 49, 60, 70, 91],
        },
      ],
      chartOptions: {
        chart: {
          height: 350,
          type: 'bar',
        },
        colors: this.AppStore.isDarkTheme ? ["#00E396"] : ["#008FFB"], // Set initial colors based on theme
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded',
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent'],
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        },
        fill: {
          opacity: 1,
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return '$ ' + val + ' thousands';
            },
          },
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
        this.chartOptions.colors = newVal ? ["#00E396"] : ["#008FFB"]; // Update colors based on theme
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