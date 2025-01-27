//usedatafetching.js
import { ref, watch } from "vue";
import { useAuthStore } from '../stores/app';
export function useDataFetching(activeTab, headers, tabs, tabEndpoints, selectedOption) {
    const tableData = ref([]); // Initialize as an empty array

    const chartOptions = ref({
        chart: {
            type: "bar",
            stacked: false,
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
            const endpoint = tabEndpoints[activeTab.value];
            const authStore = useAuthStore();
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authStore.token}`,
                },
            });
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

        console.log("Current Headers:", currentHeaders);
        console.log("Current Data:", currentData);
        if (currentData && currentData.length > 0) {
            const categories = currentData.map((row) => row[currentHeaders[0].value]);
            console.log("Categories:", categories);
            let series = [];

            // Handle data for پایش عملیات روستایی
            if (selectedOption.value === "پایش عملیات روستایی") {
                if (activeTab.value === 0) {
                    // Map Status tab
                    series = [
                        {
                            name: "Bonyad Maskan",
                            data: currentData.map((row) => Number(row["bonyad_maskan"])),
                            color: "#FF4560", // Red
                        },
                        {
                            name: "Sayer Manabe",
                            data: currentData.map((row) => Number(row["sayer_manabe"])),
                            color: "#FEB019", // Yellow
                        },
                        {
                            name: "Tarsim",
                            data: currentData.map((row) => Number(row["tarsim"])),
                            color: "#FF6699", // Pink
                        },
                    ];
                } else if (activeTab.value === 1) {
                    // Update Status tab
                    series = [
                        {
                            name: "Total",
                            data: currentData.map((row) => Number(row["total"])),
                            color: "#D3D3D3", // Light gray for background
                            columnWidth: "90%", // Make the "Total" column thicker
                            zIndex: -1, // Ensure it's behind the other columns
                        },
                        {
                            name: "Amaliate Meydani",
                            data: currentData.map((row) => Number(row["amaliate_meydani"])),
                            color: "#00E396", // Green
                            columnWidth: "30%", // Make the grouped columns thinner
                        },
                        {
                            name: "Dadeh Amaei",
                            data: currentData.map((row) => Number(row["dadeh_amaei"])),
                            color: "#008FFB", // Blue
                            columnWidth: "30%", // Make the grouped columns thinner
                        },
                        {
                            name: "Eslah Naghsheh",
                            data: currentData.map((row) => Number(row["eslah_naghsheh"])),
                            color: "#775DD0", // Purple
                            columnWidth: "30%", // Make the grouped columns thinner
                        },
                    ];
                } else if (activeTab.value === 2) {
                    // Geocode Status tab
                    series = [
                        {
                            name: "Eslah Naghsheh",
                            data: currentData.map((row) => Number(row["eslah_naghsheh"])),
                            color: "#FF4560", // Red
                        },
                        {
                            name: "Tayid va Bargozari",
                            data: currentData.map((row) => Number(row["tayid_va_bargozari"])),
                            color: "#FEB019", // Yellow
                        },
                        {
                            name: "Daryafte Naghsheh",
                            data: currentData.map((row) => Number(row["daryafte_naghsheh"])),
                            color: "#FF6699", // Pink
                        },
                    ];
                } else if (activeTab.value === 3) {
                    // License Plate Status tab
                    series = [
                        {
                            name: "Tolid QR",
                            data: currentData.map((row) => Number(row["tolid_qr"])),
                            color: "#FF4560", // Red
                        },
                        {
                            name: "Pelak Talfighi",
                            data: currentData.map((row) => Number(row["pelak_talfighi"])),
                            color: "#FEB019", // Yellow
                        },
                    ];
                } else if (activeTab.value === 4) {
                    // National ID tab
                    series = [
                        {
                            name: "Shenaseh Melli",
                            data: currentData.map((row) => Number(row["shenaseh_melli"])),
                            color: "#00E396", // Green
                        },
                    ];
                }
            }

            // Handle data for Option 2
            else if (selectedOption.value === "BSC") {
                series = [
                    {
                        name: "Amalkard",
                        data: currentData.map((row) => Number(row["amalkard"])),
                        color: "#FF4560", // Red
                    },
                    {
                        name: "Dirkard",
                        data: currentData.map((row) => Number(row["dirkard"])),
                        color: "#FEB019", // Yellow
                    },
                    {
                        name: "Barnameh Diff",
                        data: currentData.map((row) => Number(row["barnameh_diff"])),
                        color: "#00E396", // Green
                    },
                ];
            }
            console.log("Series:", series);
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