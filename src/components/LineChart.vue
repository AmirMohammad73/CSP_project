<template>
    <v-container>
        <v-card>
            <v-card-title>Line Chart with Three Lines</v-card-title>
            <v-card-text>
                <apexchart :key="chartKey" type="line" height="350" :options="chartOptions" :series="series">
                </apexchart>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { useAppStore } from "../stores/app"; // Assuming you have a store for theme management

export default {
    components: {
        apexchart: VueApexCharts,
    },
    setup() {
        const AppStore = useAppStore();
        const chartKey = ref(0);

        // Series data
        const series = ref([
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

        // Chart options
        const chartOptions = ref({
            chart: {
                height: 350,
                type: "line",
                zoom: {
                    enabled: false,
                },
            },
            stroke: {
                curve: "straight",
                width: 2, // Slightly thicker lines for better visibility
            },
            xaxis: {
                categories: [
                    "2023-01-01",
                    "2023-01-02",
                    "2023-01-03",
                    "2023-01-04",
                    "2023-01-05",
                    "2023-01-06",
                    "2023-01-07",
                    "2023-01-08",
                    "2023-01-09",
                ],
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
                ? ["#FF6B6B", "#4ECDC4", "#556EE6"] // Dark theme colors
                : ["#FF6B6B", "#4ECDC4", "#556EE6"], // Light theme colors (same for consistency)
        });

        // Watch for theme changes
        watch(
            () => AppStore.isDarkTheme,
            (newVal) => {
                chartOptions.value.theme.mode = newVal ? "dark" : "light";
                chartOptions.value.colors = newVal
                    ? ["#FF6B6B", "#4ECDC4", "#556EE6"] // Dark theme colors
                    : ["#FF6B6B", "#4ECDC4", "#556EE6"]; // Light theme colors
                chartKey.value++; // Force re-render
            },
            { immediate: true }
        );

        return {
            series,
            chartOptions,
            chartKey,
        };
    },
};
</script>

<style scoped>
/* Add any custom styles here */
</style>