<template>
    <v-container>
        <v-card>
            <v-card-title class="text-center mb-6">گزارش هفتگی/ماهانه/سه‌ماهه</v-card-title>
            <v-card-text>
                <div class="controls-container mb-8">
                    <div class="time-buttons">
                        <v-btn-toggle v-model="timeframe" mandatory>
                            <v-btn value="daily">هفتگی</v-btn>
                            <v-btn value="weekly">ماهانه</v-btn>
                            <v-btn value="quarterly">سه‌ماهه</v-btn>
                        </v-btn-toggle>
                    </div>
                    <v-select
                        v-model="selectedOstan"
                        :items="ostansList"
                        item-title="ostantitle"
                        item-value="ostantitle"
                        label="انتخاب استان"
                        class="ostan-select"
                        hide-details
                        density="compact"
                        variant="outlined"
                    ></v-select>
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
        const selectedOstan = ref(null);
        const ostansList = ref([]);

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
                y: {
                    formatter: function(value, { series, seriesIndex, dataPointIndex, w }) {
                        const data = w.config.series[seriesIndex].data;
                        const sumOfRec = w.globals.initialSeries[seriesIndex].sum_of_rec[dataPointIndex];
                        const operationName = w.globals.initialSeries[seriesIndex].name;
                        const recordLabel = operationName === "ژئوکد" ? "تعداد مکان" : "تعداد رکورد";
                        return `تعداد روستا: ${value}\n${recordLabel}: ${sumOfRec}`;
                    }
                }
            },
            theme: {
                mode: AppStore.isDarkTheme ? "dark" : "light",
            },
            colors: AppStore.isDarkTheme
                ? ["#FF6B6B", "#4ECDC4", "#556EE6"]
                : ["#FF6B6B", "#4ECDC4", "#556EE6"],
        });

        // Add function to fetch ostans
        const fetchOstans = async () => {
            try {
                const response = await fetch('http://172.16.8.33:3001/ostans', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();

                // First get the user role from /api/locations
                const roleResponse = await fetch('http://172.16.8.33:3001/api/locations', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const roleData = await roleResponse.json();
                
                // Add جمع کشوری for all roles except 'ostan' and 'setad'
                if (roleData[0] !== 'ostan' && roleData[0] !== 'setad') {
                    ostansList.value = [{ ostantitle: 'جمع کشوری' }, ...data];
                    // Set default selection to جمع کشوری
                    selectedOstan.value = 'جمع کشوری';
                } else {
                    ostansList.value = data;
                    // Set default selection to first ostan if available
                    if (data.length > 0) {
                        selectedOstan.value = data[0].ostantitle;
                    }
                }
            } catch (error) {
                console.error('Error fetching ostans:', error);
            }
        };

        // Modify existing fetch functions to include ostan parameter
        const fetchWeeklyData = async () => {
            try {
                const url = selectedOstan.value && selectedOstan.value !== 'جمع کشوری'
                    ? `http://172.16.8.33:3001/api/weeklydata?ostan=${encodeURIComponent(selectedOstan.value)}`
                    : 'http://172.16.8.33:3001/api/weeklydata';
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                dailySeries.value = formatData(data);
                chartKey.value++; // Force chart re-render
            } catch (error) {
                console.error('Error fetching daily data:', error);
            }
        };

        const fetchMonthlyData = async () => {
            try {
                const url = selectedOstan.value && selectedOstan.value !== 'جمع کشوری'
                    ? `http://172.16.8.33:3001/api/monthlydata?ostan=${encodeURIComponent(selectedOstan.value)}`
                    : 'http://172.16.8.33:3001/api/monthlydata';
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                weeklySeries.value = formatData(data);
                chartKey.value++; // Force chart re-render
            } catch (error) {
                console.error('Error fetching weekly data:', error);
            }
        };

        const fetchQuarterlyData = async () => {
            try {
                const url = selectedOstan.value && selectedOstan.value !== 'جمع کشوری'
                    ? `http://172.16.8.33:3001/api/quarterlydata?ostan=${encodeURIComponent(selectedOstan.value)}`
                    : 'http://172.16.8.33:3001/api/quarterlydata';
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                quarterlySeries.value = formatData(data);
                chartKey.value++; // Force chart re-render
            } catch (error) {
                console.error('Error fetching quarterly data:', error);
            }
        };

        const formatData = (data) => {
            const seriesMap = {
                amaliate_meydani: { name: "عملیات میدانی", data: [], sum_of_rec: [] },
                dadeh_amaei: { name: "داده آمائی", data: [], sum_of_rec: [] },
                daryafte_naghsheh: { name: "ژئوکد", data: [], sum_of_rec: [] },
            };

            const categories = [];

            data.forEach(item => {
                if (seriesMap[item.operation]) {
                    seriesMap[item.operation].data.push(Number(item.record_count));
                    seriesMap[item.operation].sum_of_rec.push(Number(item.sum_of_rec));
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
                    fetchMonthlyData();
                }
            }
        };

        // Add watcher for selectedOstan
        watch(selectedOstan, () => {
            switch (timeframe.value) {
                case "daily":
                    fetchWeeklyData();
                    break;
                case "weekly":
                    fetchMonthlyData();
                    break;
                case "quarterly":
                    fetchQuarterlyData();
                    break;
            }
        });

        // Add watcher for timeframe
        watch(timeframe, (newVal) => {
            switch (newVal) {
                case "daily":
                    fetchWeeklyData();
                    break;
                case "weekly":
                    fetchMonthlyData();
                    break;
                case "quarterly":
                    fetchQuarterlyData();
                    break;
            }
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
            fetchOstans();
            fetchWeeklyData();
        });

        return {
            currentSeries,
            chartOptions,
            chartKey,
            timeframe,
            handleZoom,
            selectedOstan,
            ostansList,
        };
    },
};
</script>

<style scoped>
.controls-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    min-height: 40px;
}

.time-buttons {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}

.ostan-select {
    position: absolute;
    right: 0;
    width: 200px;
}

.mb-6 {
    margin-bottom: 24px;
}

.mb-8 {
    margin-bottom: 32px;
}
</style>