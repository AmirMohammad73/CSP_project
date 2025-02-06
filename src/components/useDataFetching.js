import { ref, watch } from "vue";
import { useAuthStore } from '../stores/app';
import { useRouter } from "vue-router";
export function useDataFetching(activeTab, headers, tabs, tabEndpoints, selectedOption) {
    const tableData = ref([]); // Initialize as an empty array

    const chartOptions = ref({
        chart: {
            type: "bar",
            stacked: selectedOption.value === "BSC", // Enable stacking
            toolbar: {
                show: false,
            },
        },
        theme: {
            mode: "light", // Default theme
        },
        colors: ["#FF4560", "#FEB019", "#FF6699"], // Red, Yellow, Pink
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "50%", // Default column width
                endingShape: "rounded",
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: [], // Will be populated dynamically
            labels: {
                style: {
                    fontFamily: "B Traffic",
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    fontFamily: "B Traffic",
                },
                formatter: (value) => value.toFixed(0),
            },
        },
        series: [], // Will be populated dynamically
    });

    const chartKey = ref(0);

    // Fetch data from the server based on the active tab
    const fetchData = async () => {
        try {
            const authStore = useAuthStore();
            const router = useRouter();
            const endpoint = tabEndpoints[activeTab.value];
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authStore.token}`,
                },
            });
            if (!response.ok) {
                authStore.logout();
                router.push('/');
            }
            const data = await response.json();

            // Update tableData for the current tab
            tableData.value[activeTab.value] = data;
            // Update the chart with the new data
            updateChart();
        } catch (error) {
            console.error("Error fetching data:", error);

        }
    };

    // Update the chart based on the current tab's data
    const updateChart = () => {
        const currentHeaders = headers.value[activeTab.value];
        const currentData = tableData.value[activeTab.value];

        if (currentData && currentData.length > 0) {
            // Filter out rows where ostantitle is "Country Total" for the chart
            const filteredData = currentData.filter((row) => row["ostantitle"] !== "جمع کشوری");

            // Use filteredData for the chart and currentData for the table
            const categories = filteredData.map((row) => row[currentHeaders[0].value]);
            let series = [];

            // Dynamically set stacking based on selectedOption
            chartOptions.value.chart.stacked = selectedOption.value === "BSC";

            // Handle data for پایش عملیات روستایی
            if (selectedOption.value === "پایش عملیات روستایی") {
                if (activeTab.value === 0) {
                    // Map Status tab
                    series = [
                        {
                            name: "بنیاد مسکن",
                            data: filteredData.map((row) => Number(row["bonyad_maskan"])),
                            color: "#FF4560", // Red
                        },
                        {
                            name: "سایر منابع",
                            data: filteredData.map((row) => Number(row["sayer_manabe"])),
                            color: "#FEB019", // Yellow
                        },
                        {
                            name: "ترسیم",
                            data: filteredData.map((row) => Number(row["tarsim"])),
                            color: "#FF6699", // Pink
                        },
                    ];
                } else if (activeTab.value === 1) {
                    // Update Status tab
                    series = [
                        {
                            name: "مجموع",
                            data: filteredData.map((row) => Number(row["total"])),
                            color: "#D3D3D3", // Light gray for background
                            columnWidth: "90%", // Make the "Total" column thicker
                            zIndex: -1, // Ensure it's behind the other columns
                        },
                        {
                            name: "عملیات میدانی",
                            data: filteredData.map((row) => Number(row["amaliate_meydani"])),
                            color: "#00E396", // Green
                            columnWidth: "30%", // Make the grouped columns thinner
                        },
                        {
                            name: "داده آمائی",
                            data: filteredData.map((row) => Number(row["dadeh_amaei"])),
                            color: "#008FFB", // Blue
                            columnWidth: "30%", // Make the grouped columns thinner
                        },
                        {
                            name: "اصلاح و ارسال",
                            data: filteredData.map((row) => Number(row["eslah_naghsheh"])),
                            color: "#775DD0", // Purple
                            columnWidth: "30%", // Make the grouped columns thinner
                        },
                    ];
                } else if (activeTab.value === 2) {
                    // Geocode Status tab
                    series = [
                        {
                            name: "اصلاح و ارسال",
                            data: filteredData.map((row) => Number(row["eslah_naghsheh"])),
                            color: "#FF4560", // Red
                        },
                        {
                            name: "تایید و بارگذاری",
                            data: filteredData.map((row) => Number(row["tayid_va_bargozari"])),
                            color: "#FEB019", // Yellow
                        },
                        {
                            name: "ژئوکد",
                            data: filteredData.map((row) => Number(row["daryafte_naghsheh"])),
                            color: "#FF6699", // Pink
                        },
                    ];
                } else if (activeTab.value === 3) {
                    // License Plate Status tab
                    series = [
                        {
                            name: "QR تولید",
                            data: filteredData.map((row) => Number(row["tolid_qr"])),
                            color: "#FF4560", // Red
                        },
                        {
                            name: "نصب پلاک",
                            data: filteredData.map((row) => Number(row["pelak_talfighi"])),
                            color: "#FEB019", // Yellow
                        },
                    ];
                } else if (activeTab.value === 4) {
                    // National ID tab
                    series = [
                        {
                            name: "شناسه ملی",
                            data: filteredData.map((row) => Number(row["shenaseh_melli"])),
                            color: "#00E396", // Green
                        },
                    ];
                }
            }

            // Handle data for Option 2 (BSC)
            else if (selectedOption.value === "BSC") {
                series = [
                    {
                        name: "عملکرد",
                        data: filteredData.map((row) => Number(row["amalkard"])),
                        color: "#00E396", // Green
                    },
                    {
                        name: "دیرکرد",
                        data: filteredData.map((row) => Number(row["dirkard"])),
                        color: "#FF4560", // Red
                    },
                    {
                        name: "برنامه",
                        data: filteredData.map((row) => Number(row["barnameh_diff"])),
                        color: "#FEB019", // Yellow
                    },
                ];
            }
            // Handle data for شاخص اختصاصی GNAF
            else if (selectedOption.value === "شاخص اختصاصی GNAF") {
                chartOptions.value.chart.type = "bar";
                chartOptions.value.chart.stacked = true; // Ensure stacking is enabled

                series = [
                    {
                        name: "تحقق روستا",
                        group: 'roosta', // Group for Roosta
                        data: filteredData.map((row) => Number(row["t_roosta"])),
                        color: "#FF4560", // Red
                    },
                    {
                        name: "پیشبینی روستایی",
                        group: 'roosta', // Group for Roosta
                        data: filteredData.map((row) => Number(row["p_roosta_diff"])),
                        color: "#00E396", // Green
                    },
                    {
                        name: "تحقق شهر",
                        group: 'shahr', // Group for Shahr
                        data: filteredData.map((row) => Number(row["t_shahr"])),
                        color: "#008FFB", // Blue
                    },
                    {
                        name: "پیشبینی شهری",
                        group: 'shahr', // Group for Shahr
                        data: filteredData.map((row) => Number(row["p_shahr_diff"])),
                        color: "#80c7fd", // Light Blue
                    },
                ];

                // Add or update the yaxis configuration
                chartOptions.value.yaxis = {
                    labels: {
                        formatter: function (val) {
                            return val.toFixed(2); // Display 2 decimal places
                        }
                    }
                };

                // Update tooltip to show decimal places
                chartOptions.value.tooltip = {
                    y: {
                        formatter: function (val) {
                            return val.toFixed(2); // Display 2 decimal places in tooltip
                        }
                    }
                };
            }
            else if (selectedOption.value === "برنامه کارگروه تعامل پذیری") {
                console.log(filteredData);
                const years = [...new Set(filteredData.map(item => item.year))];
                const amaliatCategories = [...new Set(filteredData.map(item => item.amaliat))];

                chartOptions.value.chart.type = "bar";
                chartOptions.value.chart.stacked = true;

                // Calculate percentages for each category
                const calculatePercentages = (year, amaliat) => {
                    const item = filteredData.find(d => d.year === year && d.amaliat === amaliat);
                    if (!item) return { amalkard: 0, dirkard: 0, barnameh_diff: 0 };

                    const total = Number(item.amalkard) + Number(item.dirkard) + Number(item.barnameh_diff);
                    return {
                        amalkard: total === 0 ? 0 : (Number(item.amalkard) / total) * 100,
                        dirkard: total === 0 ? 0 : (Number(item.dirkard) / total) * 100,
                        barnameh_diff: total === 0 ? 0 : (Number(item.barnameh_diff) / total) * 100
                    };
                };

                series = years.map(year => [
                    {
                        name: `${year} - عملکرد`,
                        data: amaliatCategories.map(amaliat => calculatePercentages(year, amaliat).amalkard),
                        stack: year,
                        color: "#00E396", // Green
                    },
                    {
                        name: `${year} - دیرکرد`,
                        data: amaliatCategories.map(amaliat => calculatePercentages(year, amaliat).dirkard),
                        stack: year,
                        color: "#FF4560", // Red
                    },
                    {
                        name: `${year} - برنامه`,
                        data: amaliatCategories.map(amaliat => calculatePercentages(year, amaliat).barnameh_diff),
                        stack: year,
                        color: "#4682B4", // Steel Blue
                    }
                ]).flat();

                chartOptions.value.xaxis.categories = amaliatCategories;
                chartOptions.value.plotOptions.bar.columnWidth = "80%";

                // Remove data labels
                chartOptions.value.dataLabels = {
                    enabled: false
                };

                // Update y-axis to show percentages
                chartOptions.value.yaxis = {
                    max: 100,
                    labels: {
                        formatter: function (val) {
                            return val.toFixed(0) + '%';
                        }
                    }
                };

                // Update tooltip to show original values
                chartOptions.value.tooltip = {
                    y: {
                        formatter: function (val, { seriesIndex, dataPointIndex, w }) {
                            const year = w.globals.seriesNames[seriesIndex].split(' - ')[0];
                            const amaliat = w.globals.categoryLabels[dataPointIndex];
                            const item = filteredData.find(d => d.year === year && d.amaliat === amaliat);
                            if (item) {
                                const type = w.globals.seriesNames[seriesIndex].split(' - ')[1].toLowerCase();
                                return `${item[type]} (${val.toFixed(2)}%)`;
                            }
                            return val.toFixed(2) + '%';
                        }
                    }
                };
            }
            // Update the chart's options
            chartOptions.value.xaxis.categories = categories;
            chartOptions.value.series = series;

            // Force re-render of the chart
            chartKey.value++;
        }
    };

    // Watch for changes in the active tab and fetch data
    watch(activeTab, fetchData, { immediate: true });

    return {
        tableData,
        chartOptions,
        chartKey,
        fetchData,
        updateChart,
    };
}