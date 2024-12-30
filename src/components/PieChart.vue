<template>
  <div>
    <apexchart type="pie" :options="chartOptions" :series="series"></apexchart>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import ApexCharts from 'vue3-apexcharts';

export default defineComponent({
  components: {
    apexchart: ApexCharts,
  },
  data() {
    return {
      series: [44, 55, 41, 17, 15],
      chartOptions: {
        chart: {
          type: 'pie',
        },
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
      },
    };
  },
});
</script>

<style scoped>
/* You can add any custom styles here */
</style>