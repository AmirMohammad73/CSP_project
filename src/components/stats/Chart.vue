<template>
    <div class="chart-container">
      <h4 class="text-h6 text-right mb-2">{{ title }} Chart</h4>
      <apexchart :key="chartKey" width="100%" height="600" type="bar" :options="chartOptions" :series="chartOptions.series"></apexchart>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      chartOptions: {
        type: Object,
        required: true,
      },
      chartKey: {
        type: Number,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
    },
  };
  </script>