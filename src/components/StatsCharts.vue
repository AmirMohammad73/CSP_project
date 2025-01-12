<!-- statscharts.vue -->
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
import { ref, watch } from "vue";
import VueApexCharts from "vue3-apexcharts";
import * as XLSX from "xlsx";
import { useAppStore } from "../stores/app";
import { useDataFetching } from "./useDataFetching";

export default {
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    const AppStore = useAppStore();
    const selectedOption = ref("Rural Operations Monitoring");
    const options = ref(["Rural Operations Monitoring", "Option 2", "Option 3"]);
    const tabs = ref([
      "Map Status",
      "Update Status",
      "Geocode Status", // Add Geocode Status tab
      "License Plate Status",
      "National ID",
    ]);
    const activeTab = ref(0);
    const headers = ref([
      [
        { text: "Ostantitle", value: "ostantitle" },
        { text: "Bonyad Maskan", value: "bonyad_maskan" },
        { text: "Sayer Manabe", value: "sayer_manabe" },
        { text: "Tarsim", value: "tarsim" },
      ],
      [
        { text: "Ostantitle", value: "ostantitle" },
        { text: "Amaliate Meydani", value: "amaliate_meydani" },
        { text: "Dadeh Amaei", value: "dadeh_amaei" },
        { text: "Eslah Naghsheh", value: "eslah_naghsheh" },
        { text: "Total", value: "total" },
      ],
      // Add headers for Geocode Status
      [
        { text: "Ostantitle", value: "ostantitle" },
        { text: "Eslah Naghsheh", value: "eslah_naghsheh" },
        { text: "Tayid va Bargozari", value: "tayid_va_bargozari" },
        { text: "Daryafte Naghsheh", value: "daryafte_naghsheh" },
        { text: "Total", value: "total" },
      ],
    ]);

    // Define API endpoints for each tab
    const tabEndpoints = {
      0: "http://172.16.8.33:3001/api/data", // Map Status
      1: "http://172.16.8.33:3001/api/update", // Update Status
      2: "http://172.16.8.33:3001/api/geocode", // Geocode Status
    };

    // Use the composable function
    const { tableData, chartOptions, chartKey, fetchData, updateChart } = useDataFetching(
      activeTab,
      headers,
      tabs,
      tabEndpoints
    );

    // Watch for changes in the theme and update the chart options
    watch(
      () => AppStore.isDarkTheme,
      (newVal) => {
        chartOptions.value.theme.mode = newVal ? "dark" : "light";
        chartOptions.value.colors = newVal ? ["#00E396"] : ["#008FFB"];
        chartKey.value++; // Increment key to force re-render
        updateChart();
      },
      { immediate: true }
    );

    // Export to Excel
    const exportToExcel = () => {
      const currentHeaders = headers.value[activeTab.value];
      const currentData = tableData.value[activeTab.value];

      const worksheetData = [currentHeaders.map((header) => header.text)];
      currentData.forEach((row) => {
        const rowData = currentHeaders.map((header) => row[header.value]);
        worksheetData.push(rowData);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, tabs.value[activeTab.value]);

      const excelFileName = `${tabs.value[activeTab.value]}-Table.xlsx`;
      XLSX.writeFile(workbook, excelFileName);
    };

    return {
      selectedOption,
      options,
      tabs,
      activeTab,
      headers,
      tableData,
      chartOptions,
      chartKey,
      exportToExcel,
    };
  }
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