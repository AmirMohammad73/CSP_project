<template>
  <v-container>
    <v-card>
      <v-card-title style="direction: rtl;">میزان پیشرفت فعالیتها</v-card-title>
      <v-card-text>
        <apexchart :key="chartKey" type="radar" height="350" :options="chartOptions" :series="series"></apexchart>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import VueApexCharts from "vue3-apexcharts";
import { useAppStore } from "../stores/app"; // Adjust the path as needed

export default {
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    const AppStore = useAppStore();
    const chartKey = ref(0);

    const chartOptions = ref({
      chart: {
        type: "radar",
      },
      xaxis: {
        categories: ["پیشرفت نقشه", "پیشرفت ژئوکد", "پیشرفت عملیات میدانی", "پیشرفت داده آمائی", "پیشرفت شناسه ملی"],
      },
      theme: {
        mode: AppStore.isDarkTheme ? "dark" : "light",
      },
      colors: AppStore.isDarkTheme ? ["#00E396"] : ["#008FFB"],
    });

    const series = ref([
      {
        name: "Attributes",
        data: [80, 90, 70, 85, 75],
      },
    ]);

    watch(
      () => AppStore.isDarkTheme,
      (newVal) => {
        chartOptions.value.theme.mode = newVal ? "dark" : "light";
        chartOptions.value.colors = newVal ? ["#00E396"] : ["#008FFB"];
        chartKey.value++; // Force re-render
      }
    );

    onMounted(() => {
      // Ensure chart theme is set correctly during initial load
      chartOptions.value.theme.mode = AppStore.isDarkTheme ? "dark" : "light";
      chartOptions.value.colors = AppStore.isDarkTheme ? ["#00E396"] : ["#008FFB"];
      chartKey.value++; // Force re-render to apply theme
    });

    return {
      chartOptions,
      series,
      chartKey,
    };
  },
};
</script>

<style>
.v-card {
  width: auto;
}
</style>
