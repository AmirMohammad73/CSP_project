<template>
  <v-data-table-virtual v-if="!loading && !error" :headers="headers" :items="filteredLocations" height="33vw"
    item-value="row_number" class="elevation-1 rounded" fixed-header @click:row="handleRowClick">

    <template v-slot:item.total_naghsheh_count="{ item }">
      <div class="data-bar-container">
        <v-tooltip activator="parent" location="top">
          <template v-slot:default>
            <div class="tooltip-content" v-html="getTotalNaghshehTooltip(item)"></div>
          </template>
        </v-tooltip>
        <div class="data-bar" :style="{ width: (item.total_naghsheh_count / item.total_count) * 100 + '%' }"></div>
        <span class="data-bar-value">{{ item.total_naghsheh_count }}</span>
      </div>
    </template>

    <template v-slot:item.amaliate_meydani_count="{ item }">
      <div class="data-bar-container">
        <v-tooltip activator="parent" location="top">
          <template v-slot:default>
            <div class="tooltip-content" v-html="getTotalAmaliatTooltip(item)"></div>
          </template>
        </v-tooltip>
        <div class="data-bar" :style="{ width: (item.amaliate_meydani_count / item.total_count) * 100 + '%' }"></div>
        <span class="data-bar-value">{{ item.amaliate_meydani_count }}</span>
      </div>
    </template>

    <template v-slot:item.dadeh_amaei_count="{ item }">
      <div class="data-bar-container">
        <v-tooltip activator="parent" location="top">
          <template v-slot:default>
            <span class="tooltip-text">{{ getPercentageTooltip(item.dadeh_amaei_count, item.amaliate_meydani_count) }}</span>
          </template>
        </v-tooltip>
        <div class="data-bar" :style="{ width: (item.dadeh_amaei_count / item.amaliate_meydani_count) * 100 + '%' }"></div>
        <span class="data-bar-value">{{ item.dadeh_amaei_count }}</span>
      </div>
    </template>

    <template v-slot:item.geocode_count="{ item }">
      <div class="data-bar-container">
        <v-tooltip activator="parent" location="top">
          <template v-slot:default>
            <div class="tooltip-content" v-html="getTotalGeocodeTooltip(item)"></div>
          </template>
        </v-tooltip>
        <div class="data-bar" :style="{ width: (item.geocode_count / item.amaliate_meydani_count) * 100 + '%' }"></div>
        <span class="data-bar-value">{{ item.geocode_count }}</span>
      </div>
    </template>
    <template v-slot:item.mokhtasat_roosta_count="{ item }">
      <div class="data-bar-container">
        <v-tooltip activator="parent" location="top">
          <template v-slot:default>
            <span class="tooltip-text">{{ getPercentageTooltip(item.mokhtasat_roosta_count, item.total_count) }}</span>
          </template>
        </v-tooltip>
        <div class="data-bar" :style="{ width: (item.mokhtasat_roosta_count / item.total_count) * 100 + '%' }"></div>
        <span class="data-bar-value">{{ item.mokhtasat_roosta_count }}</span>
      </div>
    </template>

    <template v-slot:item.mahdoudeh_roosta_count="{ item }">
      <div class="data-bar-container">
        <v-tooltip activator="parent" location="top">
          <template v-slot:default>
            <span class="tooltip-text">{{ getPercentageTooltip(item.mahdoudeh_roosta_count, item.total_count) }}</span>
          </template>
        </v-tooltip>
        <div class="data-bar" :style="{ width: (item.mahdoudeh_roosta_count / item.total_count) * 100 + '%' }"></div>
        <span class="data-bar-value">{{ item.mahdoudeh_roosta_count }}</span>
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
      return `
        <div class="tooltip-content">
          <strong>${percentage}</strong>
          <hr>
          بنیاد مسکن: ${item.bonyad_maskan_count}<br>
          سایر منابع: ${item.sayer_manabe_count}<br>
          ترسیم: ${item.tarsim_count}
        </div>
      `;
    },
    getTotalAmaliatTooltip(item) {
      const percentage = this.getPercentageTooltip(item.amaliate_meydani_count, item.total_count);
      return `
        <div class="tooltip-content">
          <strong>${percentage}</strong>
          <hr>
          تعداد رکورد: ${item.record_count}<br>
          تعداد مکان: ${item.makan_count}<br>
          تعداد ساختمان: ${item.building_count}
        </div>
      `;
    },
    getTotalGeocodeTooltip(item) {
      const percentage = this.getPercentageTooltip(item.geocode_count, item.amaliate_meydani_count);
      return `
        <div class="tooltip-content">
          <strong>${percentage}</strong>
          <hr>
          تعداد مکان ژئوکد: ${item.geocode_makan_count}<br>
          تعداد ساختمان ژئوکد: ${item.geocode_building_count}
        </div>
      `;
    },
    handleRowClick(event, { item }) {
      this.$emit('row-click', item);
    },
  },
};
</script>

<style scoped>
.tooltip-content {
  direction: rtl;
  font-family: "B Traffic", sans-serif;
  text-align: right;
  padding: 8px;
  font-size: 14px;
  /* متن خوانا و مشکی ملایم */
  border-radius: 4px;
  border: 1px solid #ccc;
}

.tooltip-content hr {
  border: none;
  border-top: 1px solid #ccc;
  margin: 8px 0;
}

.tooltip-text {
  direction: rtl;
  font-family: "B Traffic", sans-serif;
  font-size: 14px;
  /* متن خوانا */
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
span {
  font-size: large !important;
}
</style>