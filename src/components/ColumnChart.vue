<template>
  <v-container>
    <v-card>
      <v-card-title style="direction: rtl;">میزان پیشرفت فعالیت‌ها</v-card-title>
      <v-card-text>
        <div v-if="loading">در حال بارگذاری...</div>
        <div v-else-if="error">خطا در دریافت داده‌ها: {{ error }}</div>
        <div v-else>
          <apexchart :key="chartKey" type="radar" height="329" :options="chartOptions" :series="series"></apexchart>
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

    const series = ref([]);
    const chartKey = ref(0);
    const loading = ref(false);
    const error = ref(null);

    const chartOptions = ref({
      chart: {
        type: "radar",
      },
      xaxis: {
        categories: ["پیشرفت نقشه", "پیشرفت ژئوکد", "پیشرفت عملیات میدانی", "پیشرفت داده‌آمایی"],
      },
      yaxis: {
        min: 0,
        max: 100,
        tickAmount: 5,
      },
      theme: {
        mode: AppStore.isDarkTheme ? "dark" : "light",
      },
      colors: AppStore.isDarkTheme ? ["#00E396"] : ["#008FFB"],
      tooltip: {
        y: {
          formatter: function (value) {
            return value.toFixed(2) + "%";
          }
        }
      }
    });


    const fetchData = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await fetch(`http://${SERVER_HOST}:3001/api/radardata`, {
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
        if (data.length > 0) {
          const serverData = data[0];

          // Calculate ratios
          const totalCount = serverData.total_count || 1; // Avoid division by zero
          const naghshehRatio = (serverData.total_naghsheh_count || 0) / totalCount * 100;
          const geoCodeRatio = (serverData.geocode_count || 0) / totalCount * 100;
          const amaliateMeydaniRatio = (serverData.amaliate_meydani_count || 0) / totalCount * 100;
          const dadehAmaeiRatio = (serverData.dadeh_amaei_count || 0) / totalCount * 100;
          series.value = [
            {
              name: "درصد پیشرفت",
              data: [naghshehRatio, geoCodeRatio, amaliateMeydaniRatio, dadehAmaeiRatio],
            },
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
        chartOptions.value.theme.mode = newVal ? "dark" : "light";
        chartOptions.value.colors = newVal ? ["#00E396"] : ["#008FFB"];
        chartKey.value++; // Force re-render
      },
      { immediate: true }
    );

    return {
      series,
      chartOptions,
      chartKey,
      loading,
      error,
    };
  },
};
</script>

<style>
.v-card {
  width: auto;
}
</style>
