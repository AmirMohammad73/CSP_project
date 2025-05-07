<!-- statscharts.vue -->
<template>
  <v-app dir="rtl">
    <v-container fluid>
      <!-- Dropdown -->
      <v-row>
        <v-col cols="12" sm="6" md="4" lg="3">
          <v-select v-model="selectedOption" :items="options" label="Select an option" outlined dense
            class="custom-select"></v-select>
        </v-col>
      </v-row>

      <!-- Tabs and content -->
      <v-row v-if="selectedOption">
        <v-col cols="12">
          <v-card>
            <div class="tabs-wrap" dir="rtl">
              <v-btn v-for="(tab, index) in tabs" :key="index" :value="index" class="mx-2 my-1" color="primary"
                variant="tonal" :class="{ 'active-tab': activeTab === index }" @click="activeTab = index">
                {{ tab }}
              </v-btn>
            </div>
          </v-card>
          <v-tabs-items v-model="activeTab">
            <v-tab-item>
              <v-card class="mt-4">
                <v-card-text>
                  <!-- Chart -->
                  <transition name="fade">
                    <div class="chart-container"
                      :class="{ 'hide-chart': selectedOption === 'گزارش درخواستهای کد پستی' }">
                      <h4 class="text-h6 text-right mb-2">
                        نمودار {{ tabs[activeTab] }}
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
                      جدول {{ tabs[activeTab] }}
                    </h4>
                    <v-data-table :items="tableData[activeTab]" :headers="headers.values[0]"
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
        <v-card-actions class="mt-4">
          <v-spacer></v-spacer>
          <v-btn color="success" class="text-white rounded-pill elevation-2" @click="exportToExcel">
            <v-icon left>mdi-file-excel</v-icon>
            Export to Excel
          </v-btn>
        </v-card-actions>
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
import { useUrbanOperationsMonitoring } from "./urbanOperationsMonitoring";
import { useBSCIndices } from "./BSCIndices";
import { usePostalCodeRequest } from "./postalCodeRequest";
import { useGNAFCustomIndex } from "./gnafCustomIndex";
import { useInteroperabilityTaskForce } from './interoperabilityTaskForce';
import { computed } from 'vue';
export default {
  components: {
    apexchart: VueApexCharts,
  },
  setup() {

    const AppStore = useAppStore();

    // Reactive references
    const selectedOption = ref("پایش عملیات روستایی");
    const options = ref([
      "پایش عملیات روستایی",
      "پایش عملیات شهری",
      "BSC",
      "گزارش درخواستهای کد پستی",
      "شاخص اختصاصی GNAF"
      // "برنامه کارگروه تعامل پذیری"
    ]);
    const activeTab = ref(0);
    const tableData = ref([]);
    const chartOptions = ref({
      theme: {
        mode: AppStore.isDarkTheme ? "dark" : "light", // Initialize the theme based on current page theme
      },
      colors: AppStore.isDarkTheme ? ["#00E396"] : ["#008FFB"], // Set initial colors
    });
    const chartKey = ref(0);
    const loadModule = () => {
      switch (selectedOption.value) {
        case "پایش عملیات روستایی":
          return useRuralOperationsMonitoring();
        case "پایش عملیات شهری":
          return useUrbanOperationsMonitoring();
        case "BSC":
          return useBSCIndices();
        case "گزارش درخواستهای کد پستی":
          return usePostalCodeRequest();
        case "شاخص اختصاصی GNAF":
          return useGNAFCustomIndex();
        case "برنامه کارگروه تعامل پذیری":
          return useInteroperabilityTaskForce();
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
        document.documentElement.style.setProperty('--axis-label-color', newVal ? "white" : "black");
        document.documentElement.style.setProperty('--tabs-bg-color', newVal ? '#424242' : '#efefef');

        // 👇 (اختیاری) اگر رنگ متن هم بخوای عوض شه
        document.documentElement.style.setProperty('--tabs-text-color', newVal ? 'white' : 'black');

      },
      { immediate: true } // Ensure this runs during the initial setup
    );


    // Handle selectedOption changes
    watch(selectedOption, (newValue) => {
      activeTab.value = 0;
      const { tabs: modTabs, headers: modHeaders, tabEndpoints } = loadModule() || {
        tabs: [],
        headers: [],
        tabEndpoints: {},
      };
      tabs.value = modTabs.value;
      headers.value = modHeaders.value;
      const {
        tableData: newTableData,
        chartOptions: newChartOptions,
        chartKey: newChartKey,
        fetchData,
      } = useDataFetching(activeTab, headers, modTabs, tabEndpoints, selectedOption);

      // Update local refs
      tableData.value = newTableData.value;
      chartOptions.value = newChartOptions.value;

      fetchData().then(() => {
        chartKey.value++; // Force re-render after data is fetched
      });
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
      const isDark = AppStore.isDarkTheme;
      document.documentElement.style.setProperty('--tabs-bg-color', isDark ? '#424242' : '#efefef');
      document.documentElement.style.setProperty('--tabs-text-color', isDark ? 'white' : 'black');
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
      try {
        const currentHeaders = headers.value[activeTab.value];
        const currentData = tableData.value[activeTab.value];

        if (!currentHeaders || !currentData) {
          console.error("No headers or data available for the current tab.");
          return;
        }

        const worksheetData = [currentHeaders.map((header) => header.text)];
        currentData.forEach((row) => {
          const rowData = currentHeaders.map((header) => row[header.value]);
          worksheetData.push(rowData);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();

        // Use the full tab name for the sheet name (within 31 characters)
        const sheetName = tabs.value[activeTab.value].substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Truncate the file name to 30 characters
        const fileName = tabs.value[activeTab.value].substring(0, 31);
        const excelFileName = `${fileName}.xlsx`;
        XLSX.writeFile(workbook, excelFileName);
      } catch (error) {
        console.error("Error exporting to Excel:", error);
      }
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
.tabs-wrap {
  display: flex;
  flex-wrap: wrap;
  padding: 16px;
  /* برای ویژگی centered در v-tabs اصلی */
  background-color: var(--tabs-bg-color);
  color: var(--tabs-text-color);
}

.active-tab {
  background-color: rgba(var(--v-theme-primary), 0.8) !important;
  color: white !important;
}

.elevation-1 {
  direction: rtl;
}

.hide-chart {
  display: none;
}

.v-list-item-title,
.text-h6 {
  font-family: 'B Traffic', sans-serif !important;
}

th {
  padding-left: '8 px' !important;
}
</style>