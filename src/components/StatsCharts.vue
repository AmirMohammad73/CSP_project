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
                        <apexchart :key="chartKey" width="100%" height="300" type="bar" :options="chartOptions"
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
import { useAppStore } from '../stores/app';
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
      selectedOption: "Option 1", // Set "Option 1" as the default selected option
      options: ["Option 1", "Option 2", "Option 3"],
      tabs: ["Tab 1", "Tab 2", "Tab 3"],
      activeTab: 0,
      headers: [
        [
          { text: "Column 1", value: "col1" },
          { text: "Column 2", value: "col2" },
        ],
        [
          { text: "Column A", value: "colA" },
          { text: "Column B", value: "colB" },
        ],
        [
          { text: "Column X", value: "colX" },
          { text: "Column Y", value: "colY" },
        ],
      ],
      tableData: [
        [
          { col1: "10", col2: "20" },
          { col1: "30", col2: "40" },
        ],
        [
          { colA: "15", colB: "25" },
          { colA: "35", colB: "45" },
        ],
        [
          { colX: "5", colY: "10" },
          { colX: "20", colY: "30" },
        ],
      ],
      chartOptions: {
        chart: {
          type: "bar",
          toolbar: {
            show: false,
          },
        },
        theme: {
          mode: this.AppStore.isDarkTheme ? "dark" : "light",
        },
        colors: this.AppStore.isDarkTheme ? ["#00E396"] : ["#008FFB"], // Set initial colors based on theme
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "50%", // Adjust the width of the bars
          },
        },
        dataLabels: {
          enabled: false, // Disable data labels for cleaner visuals
        },
        xaxis: {
          categories: [], // Dynamically updated
        },
        yaxis: {
          labels: {
            formatter: (value) => value.toFixed(0), // Format y-axis labels
          },
        },
        series: [
          {
            name: "Value",
            data: [], // Dynamically updated
          },
        ],
      },
      chartKey: 0, // Key to force re-render
    };
  },
  watch: {
    // Update chart data whenever the activeTab or tableData changes
    activeTab: "updateChart",
    tableData: {
      handler: "updateChart",
      deep: true,
    },
    // Watch for changes in the theme and update the chart options
    'AppStore.isDarkTheme': {
      handler(newVal) {
        this.chartOptions.theme.mode = newVal ? "dark" : "light";
        this.chartOptions.colors = newVal ? ["#00E396"] : ["#008FFB"]; // Update colors based on theme
        this.chartKey++; // Increment key to force re-render
        this.updateChart();
      },
      immediate: true,
    },
  },
  methods: {
    updateChart() {
      const currentHeaders = this.headers[this.activeTab];
      const currentData = this.tableData[this.activeTab];

      // Use the first column as categories (x-axis labels) and second column as data
      const categories = currentData.map((row) => row[currentHeaders[0].value]);
      const data = currentData.map((row) => Number(row[currentHeaders[1].value]));

      // Update the chart's options
      this.chartOptions.xaxis.categories = categories;
      this.chartOptions.series = [{ name: currentHeaders[1].text, data }];
    },
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
    // Initialize the chart with the data for the first tab
    this.updateChart();
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