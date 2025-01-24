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
// In statscharts.vue (setup)
import { ref, watch, onMounted } from "vue";
import VueApexCharts from "vue3-apexcharts";
import * as XLSX from "xlsx";
import { useAppStore } from "../stores/app";
import { useDataFetching } from "./useDataFetching";
import { useRuralOperationsMonitoring } from "./ruralOperationsMonitoring";
import { useBSCIndices } from "./BSCIndices";

export default {
  components: {
    apexchart: VueApexCharts,
  },
  setup() {
    const AppStore = useAppStore();

    // Reactive references
    const selectedOption = ref("پایش عملیات روستایی");
    const options = ref(["پایش عملیات روستایی", "BSC", "Option 3"]);
    const activeTab = ref(0);
    const tableData = ref([]);
    const chartOptions = ref({
      theme: {
        mode: AppStore.isDarkTheme ? "dark" : "light", // Initialize the theme based on current page theme
      },
      colors: AppStore.isDarkTheme ? ["#00E396"] : ["#008FFB"], // Set initial colors
    });
    const chartKey = ref(0);

    // Load the appropriate module based on dropdown selection
    const loadModule = () => {
      switch (selectedOption.value) {
        case "پایش عملیات روستایی":
          return useRuralOperationsMonitoring();
        case "BSC":
          return useBSCIndices();
        default:
          return null;
      }
    };

    // Watch for theme changes
    watch(
      () => AppStore.isDarkTheme,
      (newVal) => {
        if (chartOptions.value.theme) {
          chartOptions.value.theme.mode = newVal ? "dark" : "light";
        } else {
          chartOptions.value.theme = { mode: newVal ? "dark" : "light" };
        }
        chartOptions.value.colors = newVal ? ["#00E396"] : ["#008FFB"];
        chartKey.value++; // Force re-render
      },
      { immediate: true } // Ensure this runs during the initial setup
    );

    // Handle selectedOption changes
    watch(selectedOption, (newValue) => {
      activeTab.value = 0;
      const { tabs: modTabs, headers, tabEndpoints } = loadModule() || {
        tabs: [],
        headers: [],
        tabEndpoints: {},
      };
      tabs.value = modTabs.value;

      const {
        tableData: newTableData,
        chartOptions: newChartOptions,
        chartKey: newChartKey,
        fetchData,
      } = useDataFetching(activeTab, headers, modTabs, tabEndpoints, selectedOption);

      // Update local refs
      tableData.value = newTableData.value;
      chartOptions.value = newChartOptions.value;

      // Adapt chart theme to current theme
      chartOptions.value.theme = {
        mode: AppStore.isDarkTheme ? "dark" : "light",
      };
      chartOptions.value.colors = AppStore.isDarkTheme ? ["#00E396"] : ["#008FFB"];

      // Force re-render
      chartKey.value = newChartKey.value + 1;

      // Fetch the new data so that the chart/table refresh
      fetchData().then(() => {
        chartKey.value++; // Force re-render after data is fetched
      });
    });

    // Initialize with the default module
    const { tabs, headers, tabEndpoints } = loadModule() || {
      tabs: [],
      headers: [],
      tabEndpoints: {},
    };
    const {
      tableData: initialTableData,
      chartOptions: initialChartOptions,
      chartKey: initialChartKey,
      fetchData: initialFetchData,
    } = useDataFetching(activeTab, headers, tabs, tabEndpoints, selectedOption);

    tableData.value = initialTableData.value;
    chartOptions.value = initialChartOptions.value;
    chartKey.value = initialChartKey.value;

    // Fetch data on mount
    onMounted(() => {
      initialFetchData().then(() => {
        // Ensure chart theme is set correctly during initial load
        chartOptions.value.theme.mode = AppStore.isDarkTheme ? "dark" : "light";
        chartOptions.value.colors = AppStore.isDarkTheme ? ["#00E396"] : ["#008FFB"];
        chartKey.value++; // Force re-render to apply theme
      });
    });

    // Whenever the tab changes, fetch new data
    watch(activeTab, () => {
      initialFetchData().then(() => {
        chartKey.value++; // Force re-render after data is fetched
      });
    });

    // Export to Excel handler
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
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        tabs.value[activeTab.value]
      );

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
  },
};
</script>
<style scoped>
.elevation-1 {
  direction: rtl;
}
</style>