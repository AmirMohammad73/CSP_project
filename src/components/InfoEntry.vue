<template>
  <v-card title="Locations" flat elevation="2" dir="rtl" class="pa-6 rounded">
    <!-- Card Title -->
    <v-card-title class="text-h5 font-weight-bold mb-4 primary--text">
      📍 Locations Management
    </v-card-title>

    <!-- Breadcrumb -->
    <v-breadcrumbs :items="breadcrumb" class="mb-4">
      <template v-slot:divider>
        <v-icon>mdi-chevron-left</v-icon>
      </template>
      <template v-slot:item="{ item }">
        <v-breadcrumbs-item :disabled="item.disabled" @click="navigateBreadcrumb(item)">
          {{ item.text }}
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>

    <!-- Loading State -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <!-- Error State -->
    <v-alert v-if="error" type="error" class="mb-4">
      اشکالی در بارگیری داده ها پیش آمد.
    </v-alert>

    <!-- Data Table -->
    <v-data-table-virtual v-if="!loading && !error" :headers="headers" :items="filteredLocations" height="auto"
      item-value="row_number" class="elevation-1 rounded" fixed-header @click:row="handleRowClick">
      <template v-slot:item.amaliate_meydani_count="{ item }">
        <div class="data-bar-container">
          <div class="data-bar" :style="{ width: (item.amaliate_meydani_count / item.total_count) * 100 + '%' }"></div>
          <span class="data-bar-value">{{ item.amaliate_meydani_count }}</span>
        </div>
      </template>
      <template v-slot:item.dadeh_amaei_count="{ item }">
        <div class="data-bar-container">
          <div class="data-bar" :style="{ width: (item.dadeh_amaei_count / item.total_count) * 100 + '%' }"></div>
          <span class="data-bar-value">{{ item.dadeh_amaei_count }}</span>
        </div>
      </template>
      <template v-slot:item.total_naghsheh_count="{ item }">
        <div class="data-bar-container">
          <div class="data-bar" :style="{ width: (item.total_naghsheh_count / item.total_count) * 100 + '%' }"></div>
          <span class="data-bar-value">{{ item.total_naghsheh_count }}</span>
        </div>
      </template>
    </v-data-table-virtual>

    <!-- Action Buttons -->
    <v-card-actions class="mt-4">
      <v-spacer></v-spacer>
      <v-btn color="success" class="text-white rounded-pill elevation-2" @click="exportToExcel">
        <v-icon left>mdi-file-excel</v-icon>
        Export to Excel
      </v-btn>
      <v-btn color="primary" class="text-white rounded-pill elevation-2" @click="saveChanges">
        <v-icon left>mdi-content-save</v-icon>
        Save Changes
      </v-btn>
    </v-card-actions>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :timeout="3000" :top="true" color="success" class="rounded elevation-2">
      {{ snackbarMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Dialog for Roosta Data -->
    <v-dialog v-model="dialog" max-width="none" content-class="full-width-dialog">
      <v-card>
        <v-card-title class="text-h5">
          <div style="direction: rtl;">مشخصات روستا</div>
        </v-card-title>
        <v-card-text class="table-container">
          <v-table dir="rtl" class="sticky-header-table" :style="{ '--sticky-header-bg': stickyHeaderBackgroundColor }">
            <thead>
              <tr>
                <th v-for="header in roostaHeaders" :key="header.key" class="sticky-header">{{ header.title }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in roostaData" :key="index">
                <td v-for="header in roostaHeaders" :key="header.key">
                  <template v-if="header.key === 'shenaseh_melli'">
                    <v-text-field v-model="item[header.key]" variant="outlined" density="compact" hide-details
                      :class="header.key === 'shenaseh_melli' ? 'wide-field-5x' : 'wide-field-3x'"></v-text-field>
                  </template>
                  <template v-else-if="isBooleanColumn(header.key)">
                    <v-checkbox v-model="item[header.key]" :true-value="true" :false-value="false"
                      :disabled="!isEditableCheckbox(header.key)" hide-details density="compact"></v-checkbox>
                  </template>
                  <template v-else>
                    {{ item[header.key] }}
                  </template>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="saveRoostaData">Save</v-btn>
          <v-btn color="error" @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import * as XLSX from 'xlsx';
import { useAppStore } from "../stores/app";

export default {
  setup() {
    const AppStore = useAppStore();
    return { AppStore };
  },
  name: 'LocationsManagement',

  data() {
    return {
      dialog: false,
      selectedDehestan: {},
      bonyadMaskanFilter: 'all',
      headers: [
        { title: 'ردیف', align: 'end', key: 'row_number', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'مکان', align: 'end', key: 'locname', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'تعداد رکورد کل', align: 'end', key: 'total_record_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'تعداد بنیاد مسکن', align: 'end', key: 'bonyad_maskan_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'تعداد سایر منابع', align: 'end', key: 'sayer_manabe_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'تعداد ترسیم', align: 'end', key: 'tarsim_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'تعداد نقشه ها', align: 'end', key: 'total_naghsheh_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'تعداد پارسلها', align: 'end', key: 'total_parcel_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'تعداد عملیات میدانی', align: 'end', key: 'amaliate_meydani_count', class: 'text-subtitle-1 font-weight-bold data-bar-column' },
        { title: 'تعداد رکورد بهنگام شده', align: 'end', key: 'record_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'تعداد مکان بهنگام شده', align: 'end', key: 'makan_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'تعداد ساختمان', align: 'end', key: 'building_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'تعداد داده آمائی', align: 'end', key: 'dadeh_amaei_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'تعداد اصلاح نقشه', align: 'end', key: 'eslah_naghsheh_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'تعداد تایید و بارگذاری', align: 'end', key: 'tayid_va_bargozari_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'GeoCode Count', align: 'end', key: 'geocode_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'Geocode Makan Count', align: 'end', key: 'geocode_makan_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'ساختمانهای ژئوکدشده', align: 'end', key: 'geocode_building_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'تعداد مختصات روستا', align: 'end', key: 'mokhtasat_roosta_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'تعداد حریم روستا', align: 'end', key: 'mahdoudeh_roosta_count', class: 'text-subtitle-1 font-weight-bold' },
      ],
      locations: [], // Data will be fetched from the server
      roostaHeaders: [
        { title: 'استان', key: 'ostantitle' },
        { title: 'شهرستان', key: 'shahrestantitle' },
        { title: 'بخش', key: 'zonetitle' },
        { title: 'دهستان', key: 'dehestantitle' },
        { title: 'روستا', key: 'locationname' },
        { title: 'ID', key: 'population_point_id' },
        { title: 'شناسه ملی', key: 'shenaseh_melli' }, // Editable
        { title: 'بنیاد مسکن', key: 'bonyad_maskan' },
        { title: 'سایر منابع', key: 'sayer_manabe' },
        { title: 'ترسیم', key: 'tarsim' },
        { title: 'پارسلها', key: 'tedad_parcel' }, // Editable
        { title: 'عملیات میدانی', key: 'amaliate_meydani' },
        { title: 'داده آمائی', key: 'dadeh_amaei' },
        { title: 'اصلاح و ارسال', key: 'eslah_naghsheh' },
        { title: 'ژئوکد', key: 'geocode' },
        { title: 'عدم تایید', key: 'adam_tayid' },
        { title: 'تایید و بارگذاری', key: 'tayid_va_bargozari' },
        { title: 'مختصات روستا', key: 'mokhtasat_rousta' },
        { title: 'حریم روستا', key: 'mahdoudeh_rousta' },
        { title: 'تولید QR', key: 'tolid_qr' },
        { title: 'نصب پلاک', key: 'pelak_talfighi' },
      ],
      roostaData: [], // Stores the fetched roosta data
      loading: false,
      error: false,
      snackbar: false,
      snackbarMessage: '',
      breadcrumb: [{ text: 'کشور', disabled: false }], // Breadcrumb items
      currentLevel: 'کشور', // Track current navigation level
      currentOstantitle: '', // Track the selected ostantitle
      filterOptions: [
        { label: 'Checked', value: 'checked', icon: 'mdi-checkbox-marked', color: 'primary' },
        { label: 'Unchecked', value: 'unchecked', icon: 'mdi-checkbox-blank-outline', color: 'secondary' },
        { label: 'All', value: 'all', icon: 'mdi-filter', color: 'success' },
      ],
    };
  },

  computed: {
    stickyHeaderBackgroundColor() {
      return this.AppStore.isDarkTheme ? 'black' : 'white';
    },

    filteredLocations() {
      return this.locations; // No need for filtering since the data is already aggregated
    },
  },

  methods: {
    isEditableCheckbox(key) {
      // Only enable checkboxes for these columns
      const editableColumns = [
        'amaliate_meydani', // عملیات میدانی
        'dadeh_amaei',      // داده آمائی
        'eslah_naghsheh',   // اصلاح و ارسال
        'geocode',          // ژئوکد
      ];
      return editableColumns.includes(key);
    },
    isBooleanColumn(key) {
      const booleanColumns = [
        'bonyad_maskan',
        'sayer_manabe',
        'tarsim',
        'amaliate_meydani',
        'dadeh_amaei',
        'eslah_naghsheh',
        'geocode',
        'adam_tayid',
        'tayid_va_bargozari',
        'mokhtasat_rousta',
        'mahdoudeh_rousta',
        'tolid_qr',
        'pelak_talfighi',
      ];
      return booleanColumns.includes(key);
    },
    async saveRoostaData() {
      try {
        const response = await fetch('http://192.168.47.1:3001/api/locations/update-roosta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.roostaData),
        });
        if (!response.ok) {
          throw new Error('Failed to save roosta data');
        }
        this.snackbarMessage = 'Roosta data saved successfully!';
        this.snackbar = true;
      } catch (error) {
        console.error('Error saving roosta data:', error);
        this.snackbarMessage = 'Error saving roosta data';
        this.snackbar = true;
      }
    },
    async handleRowClick(event, { item }) {
      console.log(item.total_count);
      if (this.currentLevel === 'کشور') {
        // First drill-down: Fetch data for ostantitle
        this.currentOstantitle = item.locname;
        this.breadcrumb.push({ text: item.locname, disabled: false });
        this.currentLevel = 'ostantitle';
        await this.fetchDetailedLocations(item.locname);
      } else if (this.currentLevel === 'ostantitle') {
        // Second drill-down: Fetch data for shahrestantitle
        this.breadcrumb.push({ text: item.locname, disabled: false });
        this.currentLevel = 'shahrestantitle';
        this.selectedostan = item.locname;
        await this.fetchShahrestanData(item.locname);
      } else if (this.currentLevel === 'shahrestantitle') {
        // Third drill-down: Fetch data for zonetitle
        this.breadcrumb.push({ text: item.locname, disabled: false });
        this.currentLevel = 'zonetitle';
        this.selectedshahrestan = item.locname;
        await this.fetchZoneData(this.selectedostan, item.locname);
      } else if (this.currentLevel === 'zonetitle') {
        // Fourth drill-down: Fetch data for dehestantitle
        this.breadcrumb.push({ text: item.locname, disabled: false });
        this.currentLevel = 'dehestantitle';
        this.selectedzonetitle = item.locname;
        await this.fetchDehestanData(this.selectedostan, this.selectedshahrestan, item.locname);
      } else if (this.currentLevel === 'dehestantitle') {
        // Fetch roosta data and open the dialog
        this.selectedDehestan = item; // Store the selected dehestan data
        await this.fetchRoostaData(this.selectedostan, this.selectedshahrestan, this.selectedzonetitle, item.locname);
        this.dialog = true; // Open the dialog
      }
    },
    async fetchDetailedLocations() {
      this.loading = true;
      this.error = false;

      try {
        const response = await fetch(`http://192.168.47.1:3001/api/locations/detailed`);
        if (!response.ok) {
          throw new Error('Failed to fetch detailed locations data');
        }
        const data = await response.json();
        this.locations = data;
      } catch (error) {
        console.error('Error fetching detailed locations data:', error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    async fetchShahrestanData(ostantitle) {
      this.loading = true;
      this.error = false;

      try {
        const response = await fetch(`http://192.168.47.1:3001/api/locations/shahrestan?ostantitle=${encodeURIComponent(ostantitle)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch shahrestan data');
        }
        const data = await response.json();
        this.locations = data;
      } catch (error) {
        console.error('Error fetching shahrestan data:', error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    async fetchZoneData(ostantitle, shahrestantitle) {
      this.loading = true;
      this.error = false;

      try {
        const response = await fetch(`http://192.168.47.1:3001/api/locations/zone?ostantitle=${encodeURIComponent(ostantitle)}&shahrestantitle=${encodeURIComponent(shahrestantitle)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch zone data');
        }
        const data = await response.json();
        this.locations = data;
      } catch (error) {
        console.error('Error fetching zone data:', error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    async fetchDehestanData(ostantitle, shahrestantitle, zonetitle) {
      this.loading = true;
      this.error = false;

      try {
        const response = await fetch(`http://192.168.47.1:3001/api/locations/dehestan?ostantitle=${encodeURIComponent(ostantitle)}&shahrestantitle=${encodeURIComponent(shahrestantitle)}&zonetitle=${encodeURIComponent(zonetitle)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dehestan data');
        }
        const data = await response.json();
        this.locations = data;
      } catch (error) {
        console.error('Error fetching dehestan data:', error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    async fetchRoostaData(ostantitle, shahrestantitle, zonetitle, dehestantitle) {
      this.loading = true;
      this.error = false;

      try {
        const response = await fetch(
          `http://192.168.47.1:3001/api/locations/roosta?ostantitle=${encodeURIComponent(ostantitle)}&shahrestantitle=${encodeURIComponent(shahrestantitle)}&zonetitle=${encodeURIComponent(zonetitle)}&dehestantitle=${encodeURIComponent(dehestantitle)}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch roosta data');
        }
        const data = await response.json();
        this.roostaData = data; // Store the fetched roosta data
      } catch (error) {
        console.error('Error fetching roosta data:', error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    async fetchLocations() {
      this.loading = true;
      this.error = false;

      try {
        const response = await fetch('http://192.168.47.1:3001/api/locations'); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch locations data');
        }
        const data = await response.json();
        this.locations = data; // Update the locations array with fetched data
      } catch (error) {
        console.error('Error fetching locations data:', error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    navigateBreadcrumb(item) {
      if (item.text === 'کشور') {
        this.currentLevel = 'کشور';
        this.breadcrumb = [{ text: 'کشور', disabled: false }];
        this.fetchLocations();
        this.roostaData = []; // Reset roosta data
      } else if (this.breadcrumb.length > 1 && item.text === this.breadcrumb[1].text) {
        this.currentLevel = 'ostantitle';
        this.breadcrumb = this.breadcrumb.slice(0, 2);
        this.fetchDetailedLocations(this.currentOstantitle);
        this.roostaData = []; // Reset roosta data
      } else if (this.breadcrumb.length > 2 && item.text === this.breadcrumb[2].text) {
        this.currentLevel = 'shahrestantitle';
        this.breadcrumb = this.breadcrumb.slice(0, 3);
        this.fetchShahrestanData(this.selectedostan);
        this.roostaData = []; // Reset roosta data
      } else if (this.breadcrumb.length > 3 && item.text === this.breadcrumb[3].text) {
        this.currentLevel = 'zonetitle';
        this.breadcrumb = this.breadcrumb.slice(0, 4);
        this.fetchZoneData(this.selectedostan, this.selectedshahrestan);
        this.roostaData = []; // Reset roosta data
      }
    },
    saveChanges() {
      // Here you would typically make an API call to save the changes
      this.snackbarMessage = 'Changes saved successfully!';
      this.snackbar = true;
    },

    exportToExcel() {
      try {
        const exportData = this.filteredLocations.map((location) => ({
          'ردیف': location.row_number,
          'مکان': location.locname,
          'Total Record Count': location.total_record_count,
          'Bonyad Maskan Count': location.bonyad_maskan_count,
          'Sayer Manabe Count': location.sayer_manabe_count,
          'Tarsim Count': location.tarsim_count,
          'تعداد نقشه ها': location.total_naghsheh_count,
          'تعداد پارسلها': location.total_parcel_count,
          'تعداد عملیات میدانی': location.amaliate_meydani_count,
          'Record Count': location.record_count,
          'Makan Count': location.makan_count,
          'تعداد ساختمان': location.building_count,
          'تعداد داده آمائی': location.dadeh_amaei_count,
          'Eslah Naghsheh Count': location.eslah_naghsheh_count,
          'تعداد تایید و بارگذاری': location.tayid_va_bargozari_count,
          'GeoCode Count': location.geocode_count,
          'Geocode Makan Count': location.geocode_makan_count,
          'Geocode Building Count': location.geocode_building_count,
          'تعداد مختصات روستا': location.mokhtasat_roosta_count,
          'تعداد حریم روستا': location.mahdoudeh_roosta_count,
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Add some styling to the headers
        const headerStyle = {
          font: { bold: true },
          alignment: { horizontal: 'center' },
        };

        // Apply header styling (if supported by your XLSX version)
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const address = XLSX.utils.encode_cell({ r: 0, c: C });
          if (!ws[address]) continue;
          ws[address].s = headerStyle;
        }

        XLSX.utils.book_append_sheet(wb, ws, 'Locations');
        XLSX.writeFile(wb, 'locations_data.xlsx');

        this.snackbarMessage = 'Excel file exported successfully!';
        this.snackbar = true;
      } catch (error) {
        console.error('Error exporting to Excel:', error);
        this.snackbarMessage = 'Error exporting to Excel file';
        this.snackbar = true;
      }
    },
  },

  mounted() {
    this.fetchLocations(); // Fetch data when the component is mounted
  },
};
</script>

<style scoped>
.v-card-title {
  border-bottom: 2px solid #1976d2;
}

.v-text-field {
  max-width: 400px;
  font-family: 'B Traffic', sans-serif;
}

.v-snackbar {
  font-weight: bold;
}

/* Ensure table layout consistency */
.v-data-table-virtual {
  table-layout: fixed;
  text-align: center;
}

/* Align the Bonyad Maskan column header and items */
.v-data-table-virtual th:nth-child(8),
.v-data-table-virtual td:nth-child(8) {
  text-align: center;
}

/* Style adjustments to align headers and values */
.v-data-table-virtual th {
  vertical-align: middle;
}

.v-data-table-virtual td {
  vertical-align: middle;
}

/* Add hover effect to the filter button */
.v-btn--icon:hover {
  background-color: rgba(25, 118, 210, 0.04);
}

/* Style the menu */
.v-list {
  min-width: 150px;
}

/* Add some spacing between radio buttons */
.v-radio {
  margin: 4px 0;
}

/* Ensure the radio group doesn't have unnecessary padding */
.v-radio-group {
  padding: 0;
}

.full-width-dialog {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
}

/* Custom width for shenaseh_melli (5 times wider, but reduced to one-third) */
.wide-field-5x {
  width: 115px;
  /* 500px / 3 */
}

/* Custom width for tedad_parcel (3 times wider, but reduced to one-third) */
.wide-field-3x {
  width: 70px;
  /* 300px / 3 */
}

/* Ensure the table cells expand to fit the content */
.v-table td {
  white-space: nowrap;
  padding: 8px;
  font-family: 'B Traffic', sans-serif;
  /* Prevent text wrapping */
}

/* Optional: Adjust the table header width to match the content */
.v-table th {
  white-space: nowrap;
  font-family: 'B Traffic', sans-serif;
  font-size: smaller;
}

/* Ensure the table layout respects the column widths */
.v-table {
  table-layout: auto;
  /* Allows columns to resize based on content */
}

.v-dialog {
  font-family: 'B Traffic', sans-serif;
}

.v-checkbox {
  display: flex;
  justify-content: center;
  align-items: center;
}

.sticky-header-table {
  overflow: auto;
  height: 70vh;
  /* Adjust this value as needed */
}

.sticky-header-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

.sticky-header {
  position: sticky;
  top: 0;
  background-color: var(--sticky-header-bg);
  /* Adjust this color to match your design */
  z-index: 1;
}

/* Ensure the table takes up the full width of its container */
.v-table {
  width: 100%;
}

/* Add a max-height to the table container to enable scrolling */
.table-container {
  max-height: 70vh;
  /* Adjust this value as needed */
  overflow-y: auto;
}

/* Data Bar Container */
.data-bar-container {
  position: relative;
  width: 100%;
  height: 20px;
  /* Adjust height as needed */
  background-color: #e0e0e0;
  /* Background color for the bar container */
  border-radius: 4px;
  /* Rounded corners */
  overflow: hidden;
  /* Ensure the bar doesn't overflow */
  direction: rtl;
  /* Fill from the right */
}

/* Data Bar */
.data-bar {
  position: absolute;
  top: 0;
  right: 0;
  /* Align to the right */
  height: 100%;
  background-color: lightgreen;
  /* Color of the filled bar */
  transition: width 0.3s ease;
  /* Smooth transition for width changes */
}

/* Data Bar Value */
.data-bar-value {
  position: absolute;
  top: 50%;
  left: 50%;
  /* Center the text */
  transform: translate(-50%, -50%);
  font-size: 12px;
  /* Adjust font size as needed */
  color: #000;
  /* Text color */
  z-index: 1;
  /* Ensure the text is above the bar */
}

/* Ensure the column aligns properly */
.data-bar-column {
  text-align: center !important;
}
</style>