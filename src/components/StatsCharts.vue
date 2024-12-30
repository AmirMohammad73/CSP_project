<template>
  <v-app dir="rtl">
    <v-container>
      <!-- Dropdown -->
      <v-row>
        <v-col>
          <v-select v-model="selectedOption" :items="options" label="Select an option" outlined ></v-select>
        </v-col>
      </v-row>
      <!-- Tabs and content -->
      <v-row v-if="selectedOption">
        <v-col>
          <v-tabs v-model="activeTab" dir="rtl">
            <v-tab
              v-for="(tab, index) in tabs"
              :key="index"
              :value="index"
            >
              {{ tab }}
            </v-tab>
          </v-tabs>

          <v-tabs-items v-model="activeTab">
            <v-tab-item>  
              <v-card>
                <v-card-text>
                  <!-- Chart -->
                  <div class="chart-container">
                    <h4>{{ tabs[activeTab] }} Chart</h4>
                    <p>Chart for {{ selectedOption }} and {{ tabs[activeTab] }} goes here.  Replace this with your actual chart component.</p>
                    <!-- Example using a placeholder div. Replace with your chart library. -->
                    <div :id="'chart-' + activeTab" style="width: 400px; height: 300px;"></div>
                  </div>

                  <!-- Table -->
                  <div class="table-container">
                    <h4>{{ tabs[activeTab] }} Table</h4>
                    <v-data-table
                      :headers="headers[activeTab]"  
                      :items="tableData[activeTab]"  
                      class="elevation-1"
                    ></v-data-table>
                  </div>
                </v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      selectedOption: null,
      options: ["Option 1", "Option 2", "Option 3"],
      tabs: ["Tab 1", "Tab 2", "Tab 3"],
      activeTab: 0,
      headers: [
        [{ text: "Column 1", value: "col1" }, { text: "Column 2", value: "col2" }], // Headers for Tab 1
        [{ text: "Column A", value: "colA" }, { text: "Column B", value: "colB" }], // Headers for Tab 2
        [{ text: "Column X", value: "colX" }, { text: "Column Y", value: "colY" }], // Headers for Tab 3
      ],
      tableData: [
        [{ col1: "Data 1", col2: "Data 2" }, { col1: "Data A", col2: "Data B" }], // Data for Tab 1
        [{ colA: "Data I", colB: "Data II" }, { colA: "Data Alpha", colB: "Data Beta" }], // Data for Tab 2
        [{ colX: "Data One", colY: "Data Two" }, { colX: "Data First", colY: "Data Second" }], // Data for Tab 3
      ],
    };
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
