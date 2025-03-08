<!-- LocationsTable.vue -->
<template>
  <v-data-table-virtual v-if="!loading && !error" :headers="headers" :items="filteredLocations" height="33vw"
    item-value="row_number" class="elevation-1 rounded" fixed-header @click:row="handleRowClick">
    <template v-slot:item.total_naghsheh_count="{ item }">
      <div class="data-bar-container" v-tooltip="getTotalNaghshehTooltip(item)">
        <div class="data-bar" :style="{ width: (item.total_naghsheh_count / item.total_count) * 100 + '%' }"></div>
        <span class="data-bar-value">{{ item.total_naghsheh_count }}</span>
      </div>
    </template>
    <template v-slot:item.amaliate_meydani_count="{ item }">
      <div class="data-bar-container" v-tooltip="getPercentageTooltip(item.amaliate_meydani_count, item.total_count)">
        <div class="data-bar" :style="{ width: (item.amaliate_meydani_count / item.total_count) * 100 + '%' }"></div>
        <span class="data-bar-value">{{ item.amaliate_meydani_count }}</span>
      </div>
    </template>
    <template v-slot:item.dadeh_amaei_count="{ item }">
      <div class="data-bar-container" v-tooltip="getPercentageTooltip(item.dadeh_amaei_count, item.total_count)">
        <div class="data-bar" :style="{ width: (item.dadeh_amaei_count / item.total_count) * 100 + '%' }"></div>
        <span class="data-bar-value">{{ item.dadeh_amaei_count }}</span>
      </div>
    </template>
    <template v-slot:item.geocode_count="{ item }">
      <div class="data-bar-container" v-tooltip="getPercentageTooltip(item.geocode_count, item.total_count)">
        <div class="data-bar" :style="{ width: (item.geocode_count / item.total_count) * 100 + '%' }"></div>
        <span class="data-bar-value">{{ item.geocode_count }}</span>
      </div>
    </template>
  </v-data-table-virtual>
</template>

<script>
export default {
  props: {
    loading: Boolean,
    error: Boolean,
    headers: Array,
    filteredLocations: Array,
  },
  methods: {
    getPercentageTooltip(count, total) {
      if (total === 0) return '0%';
      const percentage = ((count / total) * 100).toFixed(2);
      return `${percentage}%`;
    },
    getTotalNaghshehTooltip(item) {
      const percentage = this.getPercentageTooltip(item.total_naghsheh_count, item.total_count);
      return `${percentage}<br>
          بنیاد مسکن: ${item.bonyad_maskan_count}<br>
          سایر منابع: ${item.sayer_manabe_count}<br>
          ترسیم: ${item.tarsim_count}`;
    },
    handleRowClick(event, { item }) {
      this.$emit('row-click', item);
    },
  },
};
</script>
<style scoped>
.v-data-table-virtual {
  table-layout: fixed;
  text-align: center;
}

.v-data-table-virtual th:nth-child(8),
.v-data-table-virtual td:nth-child(8) {
  text-align: center;
}

.v-data-table-virtual th {
  vertical-align: middle;
}

.v-data-table-virtual td {
  vertical-align: middle;
}

.data-bar-container {
  position: relative;
  width: 100%;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  direction: rtl;
}

.data-bar {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  background-color: lightgreen;
  transition: width 0.3s ease;
}

.data-bar-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  color: #000;
  z-index: 1;
}

.tooltip-content {
  white-space: pre-line;
}

.data-bar-column {
  text-align: center !important;
}
</style>