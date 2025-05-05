<template>
  <v-container>
    <v-card>
      <v-card-title style="direction: rtl; text-align: center;">میزان پیشرفت کلی پروژه</v-card-title>
      <v-card-text>
        <div v-if="loading">در حال بارگذاری...</div>
        <div v-else-if="error">خطا در دریافت داده‌ها: {{ error }}</div>
        <div v-else>
          <!-- Top Middle Chart -->
          <v-row justify="center" class="mb-4">
            <v-col cols="12" md="6">
              <apexchart :key="chartKey" type="radialBar" height="250" :options="topMiddleOptions"
                :series="topMiddleSeries"></apexchart>
              <p class="text-center mt-2">پیشرفت کلی</p>
            </v-col>
          </v-row>
          <!-- Bottom Charts -->
          <v-row>
            <!-- Bottom Left Chart -->
            <v-col cols="12" md="6">
              <apexchart :key="chartKey" type="radialBar" height="150" :options="bottomLeftOptions"
                :series="bottomLeftSeries"></apexchart>
              <p class="text-center mt-2">پیشرفت روستایی</p>
            </v-col>
            <!-- Bottom Right Chart -->
            <v-col cols="12" md="6">
              <apexchart :key="chartKey" type="radialBar" height="150" :options="bottomRightOptions"
                :series="bottomRightSeries"></apexchart>
              <p class="text-center mt-2">پیشرفت شهری</p>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { useAppStore } from "../stores/app";
import { useIPStore } from "../stores/app";
import { useAuthStore } from "../stores/app";
import { useRouter } from "vue-router";

export default {
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    const AppStore = useAppStore();
    const IPStore = useIPStore();
    const authStore = useAuthStore();
    const router = useRouter();
    const SERVER_HOST = IPStore.SERVER_HOST;
    const chartKey = ref(0);
    const loading = ref(false);
    const error = ref(null);
    const topMiddleSeries = ref([90]);
    const bottomLeftSeries = ref([75]);
    const bottomRightSeries = ref([95]);

    const createChartOptions = (label) => ({
      chart: {
        type: 'radialBar',
        offsetY: -20,
        sparkline: {
          enabled: true
        }
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            background: AppStore.isDarkTheme ? "#4B4B4B" : "#e7e7e7",
            strokeWidth: '97%',
            margin: 5,
            dropShadow: {
              enabled: true,
              top: 2,
              left: 0,
              color: AppStore.isDarkTheme ? '#000' : '#444',
              opacity: 1,
              blur: 2
            }
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              offsetY: -2,
              fontSize: '18px',
              color: AppStore.isDarkTheme ? '#fff' : '#000'
            }
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          shadeIntensity: 0.4,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 53, 91]
        },
      },
      labels: [label],
      theme: {
        mode: AppStore.isDarkTheme ? 'dark' : 'light'
      }
    });

    const topMiddleOptions = ref(createChartOptions('Total Progress'));
    const bottomLeftOptions = ref(createChartOptions('Rural Progress'));
    const bottomRightOptions = ref(createChartOptions('Urban Progress'));

    const fetchData = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await fetch(`${SERVER_HOST}/api/progressdata`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        if (!response.ok) {
          authStore.logout();
          router.push("/");
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        if (data.length > 0) {
          const serverData = data[0];
          topMiddleSeries.value = [serverData.total_progress || 90];
          bottomLeftSeries.value = [serverData.rural_progress || 75];
          bottomRightSeries.value = [serverData.urban_progress || 95];
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
        const updateOptions = (options) => {
          options.value.theme.mode = newVal ? 'dark' : 'light';
          options.value.plotOptions.radialBar.track.background = newVal ? "#4B4B4B" : "#e7e7e7";
          options.value.plotOptions.radialBar.track.dropShadow.color = newVal ? '#000' : '#444';
          options.value.plotOptions.radialBar.dataLabels.value.color = newVal ? '#fff' : '#000';
        };
        updateOptions(topMiddleOptions);
        updateOptions(bottomLeftOptions);
        updateOptions(bottomRightOptions);
        chartKey.value++; // Force re-render
      },
      { immediate: true }
    );

    return {
      topMiddleSeries,
      bottomLeftSeries,
      bottomRightSeries,
      topMiddleOptions,
      bottomLeftOptions,
      bottomRightOptions,
      chartKey,
      loading,
      error,
    };
  },
};
</script>

<style scoped>
.v-card {
  width: auto;
}

.v-card-text {
  padding: 1rem;
  height: 49vh !important;
}

.v-row {
  margin-bottom: 1rem;
}
</style>