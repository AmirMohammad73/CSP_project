<template>
  <v-app dir="rtl">
    <v-container fluid>
      <!-- Dropdown -->
      <v-row>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select v-model="selectedOption" :items="options" label="Select an option" outlined dense></v-select>
        </v-col>
      </v-row>

      <!-- Tabs and content -->
      <v-row v-if="selectedOption">
        <v-col cols="12">
          <v-tabs v-model="activeTab" dir="rtl" dark centered>
            <v-tab v-for="(tab, index) in tabs" :key="index" :value="index">
              {{ tab }}
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="activeTab">
            <v-tab-item>
              <v-card class="mt-4">
                <v-card-text>
                  <!-- Chart -->
                  <div class="chart-container">
                    <h4 class="text-h6 text-right mb-2">
                      {{ tabs[activeTab] }} Chart
                    </h4>
                    <v-row>
                      <v-col cols="12">
                        <!-- Add a key to force re-render -->
                        <apexchart :key="chartKey" width="100%" height="600" type="bar" :options="chartOptions"
                          :series="chartOptions.series"></apexchart>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Table -->
                  <div class="table-container mt-8">
                    <h4 class="text-h6 text-right mb-2">
                      {{ tabs[activeTab] }} Table
                    </h4>
                    <v-data-table :headers="headers[activeTab]" :items="tableData[activeTab]"
                      class="elevation-1"></v-data-table>
                  </div>
                </v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-col>
      </v-row>

      <!-- Export to Excel Button -->
      <v-row v-if="selectedOption" class="mt-4">
        <v-col cols="12" class="text-right">
          <v-btn color="primary" @click="exportToExcel">
            Export to Excel
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";
import * as XLSX from "xlsx";
import { useAppStore } from "../stores/app";

export default {
  setup() {
    const AppStore = useAppStore();
    return { AppStore };
  },
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      selectedOption: "Rural Operations Monitoring", // Updated default option
      options: ["Rural Operations Monitoring", "Option 2", "Option 3"], // Updated options
      tabs: [
        "Map Status",
        "Update Status",
        "Geocode Status",
        "License Plate Status",
        "National ID",
      ], // Updated tabs
      activeTab: 0,
      headers: [
        [
          { text: "Ostantitle", value: "ostantitle" },
          { text: "Bonyad Maskan", value: "bonyad_maskan" },
          { text: "Sayer Manabe", value: "sayer_manabe" },
          { text: "Tarsim", value: "tarsim" },
        ],
        // Add headers for other tabs if needed
      ],
      tableData: [[]], // Will be populated from the server
      chartOptions: {
        chart: {
          type: "bar",
          stacked: false, // Disable stacking for grouped bars
          toolbar: {
            show: false,
          },
        },
        theme: {
          mode: this.AppStore.isDarkTheme ? "dark" : "light",
        },
        colors: ["#FF4560", "#FEB019", "#FF6699"], // Red, Yellow, Pink
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "50%", // Adjust column width
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
      },
      chartKey: 0,
    };
  },
  watch: {
    // Fetch data when the active tab changes
    activeTab: "fetchData",
    // Watch for changes in the theme and update the chart options
    "AppStore.isDarkTheme": {
      handler(newVal) {
        this.chartOptions.theme.mode = newVal ? "dark" : "light";
        this.chartOptions.colors = newVal ? ["#00E396"] : ["#008FFB"];
        this.chartKey++; // Increment key to force re-render
        this.updateChart();
      },
      immediate: true,
    },
  },
  methods: {
    // Fetch data from the server
    async fetchData() {
      try {
        console.log("1");
        const response = await fetch("http://172.16.8.33:3001/api/data");
        console.log("2");
        const data = await response.json();
        console.log("3");
        this.tableData = [data]; // Update tableData with fetched data
        console.log("4");
        this.updateChart();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    // Update the chart based on the current tab's data
    updateChart() {
      const currentHeaders = this.headers[this.activeTab];
      const currentData = this.tableData[this.activeTab];

      if (currentData && currentData.length > 0) {
        // Use the first column (ostantitle) as x-axis categories
        const categories = currentData.map((row) => row[currentHeaders[0].value]);

        // Prepare series data for each group
        const series = [
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

        // Update the chart's options
        this.chartOptions.xaxis.categories = categories;
        this.chartOptions.series = series;
      }
    },
    // Export the current tab's data to Excel
    exportToExcel() {
      const currentHeaders = this.headers[this.activeTab];
      const currentData = this.tableData[this.activeTab];

      const worksheetData = [currentHeaders.map((header) => header.text)];
      currentData.forEach((row) => {
        const rowData = currentHeaders.map((header) => row[header.value]);
        worksheetData.push(rowData);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, this.tabs[this.activeTab]);

      const excelFileName = `${this.tabs[this.activeTab]}-Table.xlsx`;
      XLSX.writeFile(workbook, excelFileName);
    },
  },
  mounted() {
    // Fetch data when the component is mounted
    this.fetchData();
  },
};
</script>

<style>
.chart-container {
  margin-bottom: 20px;
  text-align: right;
}

.table-container {
  margin-top: 20px;
  text-align: right;
}

.v-tabs {
  direction: rtl;
}

.v-tab {
  text-align: right;
}

.v-data-table {
  direction: rtl;
}

.v-data-table th {
  text-align: right;
}

.v-data-table td {
  text-align: right;
}
</style>