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

        const currentSeries = computed(() => {
            return timeframe.value === "daily" ? dailySeries.value : weeklySeries.value;
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
                    text: "Value",
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
                dailySeries.value = formatData(data); // فقط formatData را صدا بزنید
                chartKey.value++; // بازسازی نمودار
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
                weeklySeries.value = formatData(data); // فقط formatData را صدا بزنید
                chartKey.value++; // بازسازی نمودار
            } catch (error) {
                console.error('Error fetching weekly data:', error);
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
                if (seriesMap[item.type_count]) {
                    seriesMap[item.type_count].data.push(Number(item.record_count));
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
            if (newVal === "daily") {
                fetchDailyData();
            } else {
                fetchWeeklyData();
            }
            chartKey.value++; // اجباری برای بازسازی نمودار
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