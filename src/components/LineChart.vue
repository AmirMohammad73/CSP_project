<template>
    <v-container>
        <v-card>
            <v-card-title class="text-center">گزارش هفتگی/ماهانه</v-card-title>
            <v-card-text>
                <div class="text-center mb-4">
                    <v-btn-toggle v-model="timeframe" mandatory>
                        <v-btn value="daily">روزانه</v-btn>
                        <v-btn value="weekly">هفتگی</v-btn>
                    </v-btn-toggle>
                </div>
                <apexchart
                    :key="chartKey"
                    type="line"
                    height="350"
                    :options="chartOptions"
                    :series="currentSeries"
                    @zoom="handleZoom"
                ></apexchart>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
import { ref, onMounted, watch, computed } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { useAppStore } from "../stores/app";

export default {
    components: {
        apexchart: VueApexCharts,
    },
    setup() {
        const AppStore = useAppStore();
        const chartKey = ref(0);
        const timeframe = ref("daily");

        // Daily series data
        const dailySeries = ref([
            {
                name: "عملیات میدانی",
                data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
            },
            {
                name: "داده آمائی",
                data: [20, 30, 25, 40, 39, 50, 60, 81, 105],
            },
            {
                name: "ژئوکد",
                data: [10, 20, 15, 30, 29, 40, 50, 71, 95],
            },
        ]);

        // Weekly series data
        const weeklySeries = ref([
            {
                name: "عملیات میدانی",
                data: [180, 220, 250, 300],
            },
            {
                name: "داده آمائی",
                data: [150, 180, 200, 240],
            },
            {
                name: "ژئوکد",
                data: [100, 130, 160, 190],
            },
        ]);

        const currentSeries = computed(() => {
            return timeframe.value === "daily" ? dailySeries.value : weeklySeries.value;
        });

        // Chart options
        const chartOptions = ref({
            chart: {
                height: 350,
                type: "line",
                zoom: {
                    enabled: true,
                    type: 'x',
                    autoScaleYaxis: true,
                },
            },
            stroke: {
                curve: "straight",
                width: 2,
            },
            xaxis: {
                categories: [],
                type: "datetime",
            },
            yaxis: {
                title: {
                    text: "Value",
                },
            },
            tooltip: {
                x: {
                    format: "dd MMM yyyy",
                },
            },
            theme: {
                mode: AppStore.isDarkTheme ? "dark" : "light",
            },
            colors: AppStore.isDarkTheme
                ? ["#FF6B6B", "#4ECDC4", "#556EE6"]
                : ["#FF6B6B", "#4ECDC4", "#556EE6"],
        });

        // Update x-axis categories based on timeframe
        const updateCategories = () => {
            if (timeframe.value === "daily") {
                chartOptions.value.xaxis.categories = [
                    "2023-01-01", "2023-01-02", "2023-01-03", "2023-01-04", "2023-01-05",
                    "2023-01-06", "2023-01-07", "2023-01-08", "2023-01-09"
                ];
            } else {
                chartOptions.value.xaxis.categories = [
                    "2023-01-01", "2023-01-08", "2023-01-15", "2023-01-22"
                ];
            }
            chartKey.value++; // Force re-render
        };

        // Handle zoom event
        const handleZoom = (chartContext, { xaxis, yaxis }) => {
            if (timeframe.value === "daily") {
                const zoomRange = xaxis.max - xaxis.min;
                // If zoomed out to show more than 7 days, switch to weekly view
                if (zoomRange > 7 * 24 * 60 * 60 * 1000) { // 7 days in milliseconds
                    timeframe.value = "weekly";
                    aggregateDailyToWeekly();
                }
            }
        };

        // Aggregate daily data to weekly data
        const aggregateDailyToWeekly = () => {
            const dailyData = dailySeries.value;
            const weeklyData = dailyData.map(series => {
                const weeklyValues = [];
                for (let i = 0; i < series.data.length; i += 7) {
                    const weekData = series.data.slice(i, i + 7);
                    const sum = weekData.reduce((acc, val) => acc + val, 0);
                    weeklyValues.push(sum);
                }
                return {
                    name: series.name,
                    data: weeklyValues,
                };
            });
            weeklySeries.value = weeklyData;
            updateCategories();
        };

        // Watch for timeframe changes
        watch(timeframe, updateCategories);

        // Watch for theme changes
        watch(
            () => AppStore.isDarkTheme,
            (newVal) => {
                chartOptions.value.theme.mode = newVal ? "dark" : "light";
                chartOptions.value.colors = newVal
                    ? ["#FF6B6B", "#4ECDC4", "#556EE6"]
                    : ["#FF6B6B", "#4ECDC4", "#556EE6"];
                chartKey.value++; // Force re-render
            },
            { immediate: true }
        );

        // Initialize categories
        updateCategories();

        return {
            currentSeries,
            chartOptions,
            chartKey,
            timeframe,
            handleZoom,
        };
    },
};
</script>

<style scoped>
.v-btn-toggle {
    margin-bottom: 20px;
}
</style>