<template>
    <div>
      <apexchart type="bar" :options="chartOptions" :series="series"></apexchart>
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
        },
      };
    },
  });
  </script>
  
  <style scoped>
  /* You can add any custom styles here */
  </style>