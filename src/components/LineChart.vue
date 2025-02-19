<template>
    <v-container>
        <v-card>
            <v-card-title class="text-center">گزارش هفتگی/ماهانه/سه‌ماهه</v-card-title>
            <v-card-text>
                <div class="text-center mb-4">
                    <v-btn-toggle v-model="timeframe" mandatory>
                        <v-btn value="daily">هفتگی</v-btn>
                        <v-btn value="weekly">ماهانه</v-btn>
                        <v-btn value="quarterly">سه‌ماهه</v-btn>
                    </v-btn-toggle>
                </div>
                <apexchart :key="chartKey" type="line" height="350" :options="chartOptions" :series="currentSeries"
                    @zoom="handleZoom"></apexchart>
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

        const dailySeries = ref([]);
        const weeklySeries = ref([]);
        const quarterlySeries = ref([]);

        const currentSeries = computed(() => {
            switch (timeframe.value) {
                case "daily":
                    return dailySeries.value;
                case "weekly":
                    return weeklySeries.value;
                case "quarterly":
                    return quarterlySeries.value;
                default:
                    return dailySeries.value;
            }
        });

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
                type: "category", // نوع category به جای datetime
                labels: {
                    rotate: -45,
                    style: {
                        fontSize: '12px',
                    },
                },
            },
            yaxis: {
                title: {
                    text: "تعداد",
                },
            },
            tooltip: {
                x: {
                    formatter: (val) => val, // نمایش دقیق همان مقدار week_num
                },
            },
            theme: {
                mode: AppStore.isDarkTheme ? "dark" : "light",
            },
            colors: AppStore.isDarkTheme
                ? ["#FF6B6B", "#4ECDC4", "#556EE6"]
                : ["#FF6B6B", "#4ECDC4", "#556EE6"],
        });


        const fetchDailyData = async () => {
            try {
                const response = await fetch('http://192.168.47.1:3001/api/weeklydata', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                console.log(data);
                dailySeries.value = formatData(data);
                chartKey.value++;
            } catch (error) {
                console.error('Error fetching daily data:', error);
            }
        };

        const fetchWeeklyData = async () => {
            try {
                const response = await fetch('http://192.168.47.1:3001/api/monthlydata', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                console.log(data);
                weeklySeries.value = formatData(data);
                chartKey.value++;
            } catch (error) {
                console.error('Error fetching weekly data:', error);
            }
        };

        const fetchQuarterlyData = async () => {
            try {
                const response = await fetch('http://192.168.47.1:3001/api/quarterlydata', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                console.log(data);
                quarterlySeries.value = formatData(data);
                chartKey.value++;
            } catch (error) {
                console.error('Error fetching quarterly data:', error);
            }
        };
        const formatData = (data) => {
            const seriesMap = {
                amaliate_meydani: { name: "عملیات میدانی", data: [] },
                dadeh_amaei: { name: "داده آمائی", data: [] },
                daryafte_naghsheh: { name: "ژئوکد", data: [] },
            };

            const categories = [];

            data.forEach(item => {
                if (seriesMap[item.operation]) {
                    seriesMap[item.operation].data.push(Number(item.record_count));
                }
                if (!categories.includes(item.week_num)) {
                    categories.push(item.week_num);
                }
            });

            // مستقیماً مقادیر محور X را از week_num دریافت کن
            chartOptions.value.xaxis.categories = categories;

            return Object.values(seriesMap);
        };

        // const updateCategories = () => {
        //     if (timeframe.value === "daily") {
        //         chartOptions.value.xaxis.categories = dailySeries.value[0]?.data.map((_, index) => `2023-01-${index + 1}`) || [];
        //     } else {
        //         chartOptions.value.xaxis.categories = weeklySeries.value[0]?.data.map((_, index) => `2023-01-${(index + 1) * 7}`) || [];
        //     }
        //     chartKey.value++; // Force re-render
        // };

        const handleZoom = (chartContext, { xaxis, yaxis }) => {
            if (timeframe.value === "daily") {
                const zoomRange = xaxis.max - xaxis.min;
                if (zoomRange > 7 * 24 * 60 * 60 * 1000) {
                    timeframe.value = "weekly";
                    fetchWeeklyData();
                }
            }
        };

        watch(timeframe, (newVal) => {
            switch (newVal) {
                case "daily":
                    fetchDailyData();
                    break;
                case "weekly":
                    fetchWeeklyData();
                    break;
                case "quarterly":
                    fetchQuarterlyData();
                    break;
            }
            chartKey.value++;
        });

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

        onMounted(() => {
            fetchDailyData();
        });

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