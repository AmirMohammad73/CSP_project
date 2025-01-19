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
                  <transition name="fade">
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
                  </transition>
                  <!-- Table -->
                  <div class="table-container mt-8">
                    <h4 class="text-h6 text-right mb-2">
                      {{ tabs[activeTab] }} Table
                    </h4>
                    <v-data-table :items="tableData[activeTab]" class="elevation-1"></v-data-table>
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
import { ref, watch, onMounted } from "vue";
import VueApexCharts from "vue3-apexcharts";
import * as XLSX from "xlsx";
import { useAppStore } from "../stores/app";
import { useDataFetching } from "./useDataFetching";
import { useRuralOperationsMonitoring } from "./ruralOperationsMonitoring"; // Import the specific module
import { useBSCIndices } from "./BSCIndices";

export default {
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    const AppStore = useAppStore();
    const selectedOption = ref("Rural Operations Monitoring");
    const options = ref(["Rural Operations Monitoring", "BSC", "Option 3"]);

    // Load the appropriate module based on the selected option
    const loadModule = () => {
      switch (selectedOption.value) {
        case "Rural Operations Monitoring":
          return useRuralOperationsMonitoring();
        case "BSC":
          return useBSCIndices();
        // Add cases for other options here
        default:
          return null;
      }
    };

    const { tabs, headers, tabEndpoints } = loadModule() || { tabs: [], headers: [], tabEndpoints: {} };

    const activeTab = ref(0);
    const { tableData, chartOptions, chartKey, fetchData, updateChart } = useDataFetching(
      activeTab,
      headers,
      tabs,
      tabEndpoints,
      selectedOption // Pass the selected option
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

    // Fetch data on initial load
    onMounted(() => {
      fetchData();
    });

    // Watch for changes in activeTab and fetch data
    watch(activeTab, () => {
      fetchData();
    });

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
<style scoped>
.elevation-1{
  direction: rtl;
}
</style>