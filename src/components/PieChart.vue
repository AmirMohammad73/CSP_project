<template>
  <div>
    <div v-if="loading">Loading chart data...</div>
    <div v-else>
      <!-- Add a key to force re-render when the theme changes -->
      <apexchart :key="chartKey" type="donut" :options="chartOptions" :series="series"></apexchart>
    </div>
    <div v-if="error">Error loading chart data: {{ error }}</div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue';
import ApexCharts from 'vue3-apexcharts';
import { useAppStore } from '../stores/app';
import { useIPStore } from '../stores/app';
import { useAuthStore } from '../stores/app';
export default defineComponent({
  components: {
    apexchart: ApexCharts,
  },
  setup() {
    const AppStore = useAppStore();
    const IPStore = useIPStore();
    const authStore = useAuthStore();
    const SERVER_HOST = IPStore.SERVER_HOST;
    const series = ref([]);
    const chartOptions = ref({
      chart: {
        type: 'donut', // Changed chart type to donut
        height: 100, // Set the height of the chart
      },
      colors: AppStore.isDarkTheme
        ? ["#00E396", "#008FFB", "#FEB019", "#FF4560"] // Dark mode colors (adjust based on data)
        : ["#008FFB", "#00E396", "#FEB019", "#FF4560"], // Light mode colors (adjust based on data)
      labels: [], // Will be populated with data from the server
      dataLabels: {
        enabled: true,
      },
      stroke: {
        show: false,
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + ''; // Removed percentage as it's a count
          },
        },
      },
      fill: {
        opacity: 1,
      },
      theme: {
        mode: AppStore.isDarkTheme ? 'dark' : 'light', // Set initial theme
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                show: true,
                showAlways: true,
                label: 'تعداد روستاها',
                formatter: (w) => {
                  return w.globals.seriesTotals.reduce((a, b) => {
                    return a + b
                  }, 0)
                }
              }
            },
          },
        }
      }
    });
    const chartKey = ref(0);
    const loading = ref(false);
    const error = ref(null);

    const fetchData = async () => {

      loading.value = true;
      error.value = null;
      try {
        const response = await fetch(`http://${SERVER_HOST}:3001/dashboard/piemap`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.length > 0) {
          const serverData = data[0];
          series.value = [
            parseInt(serverData.bonyad_maskan),
            parseInt(serverData.tarsim),
            parseInt(serverData.sayer_manabe),
            parseInt(serverData.remaining_count),
          ];
          chartOptions.value.labels = [
            'بنیاد مسکن',
            'ترسیم',
            'سایر منابع',
            'بدون نقشه',
          ];
        }
      } catch (e) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchData();
    });

    watch(
      () => AppStore.isDarkTheme,
      (newVal) => {
        chartOptions.value.theme.mode = newVal ? 'dark' : 'light';
        chartOptions.value.colors = newVal
          ? ["#00E396", "#008FFB", "#FEB019", "#FF4560"] // Dark mode colors
          : ["#008FFB", "#00E396", "#FEB019", "#FF4560"]; // Light mode colors
        chartKey.value++; // Increment key to force re-render
      },
      { immediate: true }
    );

    return {
      series,
      chartOptions,
      chartKey,
      AppStore,
      loading,
      error,
    };
  },
});
</script>
