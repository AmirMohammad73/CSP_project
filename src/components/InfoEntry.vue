<!-- infoentry.vue -->
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

    <!-- Search Field -->
    <v-card-text>
      <v-text-field v-model="search" label="Search for locations" append-inner-icon="mdi-magnify" variant="outlined"
        hide-details single-line dir="rtl" color="primary" class="mb-4"></v-text-field>
    </v-card-text>

    <!-- Loading State -->
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <!-- Error State -->
    <v-alert v-if="error" type="error" class="mb-4">
      Failed to load locations data. Please try again later.
    </v-alert>

    <!-- Data Table -->
    <v-data-table-virtual v-if="!loading && !error" :headers="headers" :items="filteredLocations" height="auto"
      item-value="row_number" class="elevation-1 rounded" fixed-header @click:row="handleRowClick">
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
  </v-card>
</template>

<script>
import * as XLSX from 'xlsx';

export default {
  name: 'LocationsManagement',

  data() {
    return {
      search: '',
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
        { title: 'تعداد عملیات میدانی', align: 'end', key: 'amaliate_meydani_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'Record Count', align: 'end', key: 'record_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'Makan Count', align: 'end', key: 'makan_count', class: 'text-subtitle-1 font-weight-bold' },
        { title: 'Building Count', align: 'end', key: 'building_count', class: 'text-subtitle-1 font-weight-bold' },
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
    filteredLocations() {
      return this.locations; // No need for filtering since the data is already aggregated
    },
  },

  methods: {
    async handleRowClick(event, { item }) {
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
        // Third drill-down: Fetch data for shahrestantitle
        this.breadcrumb.push({ text: item.locname, disabled: false });
        this.currentLevel = 'zonetitle';
        this.selectedshahrestan = item.locname;
        await this.fetchZoneData(this.selectedostan, item.locname);
      } else if (this.currentLevel === 'zonetitle') {
        // Third drill-down: Fetch data for shahrestantitle
        this.breadcrumb.push({ text: item.locname, disabled: false });
        this.currentLevel = 'dehestantitle';
        await this.fetchDehestanData(this.selectedostan, this.selectedshahrestan, item.locname);
      }
    },
    async fetchDetailedLocations() {
      this.loading = true;
      this.error = false;

      try {
        const response = await fetch(`http://172.16.8.33:3001/api/locations/detailed`);
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
        const response = await fetch(`http://172.16.8.33:3001/api/locations/shahrestan?ostantitle=${encodeURIComponent(ostantitle)}`);
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
        const response = await fetch(`http://172.16.8.33:3001/api/locations/zone?ostantitle=${encodeURIComponent(ostantitle)}&shahrestantitle=${encodeURIComponent(shahrestantitle)}`);
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
        const response = await fetch(`http://172.16.8.33:3001/api/locations/dehestan?ostantitle=${encodeURIComponent(ostantitle)}&shahrestantitle=${encodeURIComponent(shahrestantitle)}&zonetitle=${encodeURIComponent(zonetitle)}`);
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
    async fetchLocations() {
      this.loading = true;
      this.error = false;

      try {
        const response = await fetch('http://172.16.8.33:3001/api/locations'); // Replace with your API endpoint
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
        console.log("000");
        this.currentLevel = 'کشور';
        this.breadcrumb = [{ text: 'کشور', disabled: false }];
        this.fetchLocations();
      } else if (this.breadcrumb.length > 1 && item.text === this.breadcrumb[1].text) {
        console.log("111");
        this.currentLevel = 'ostantitle';
        this.breadcrumb = this.breadcrumb.slice(0, 2);
        this.fetchDetailedLocations(this.currentOstantitle);
      } else if (this.breadcrumb.length > 2 && item.text === this.breadcrumb[2].text) {
        console.log("222");
        this.currentLevel = 'shahrestantitle';
        this.breadcrumb = this.breadcrumb.slice(0, 3);
        this.fetchShahrestanData(this.selectedostan);
      } else if (this.breadcrumb.length > 3 && item.text === this.breadcrumb[3].text) {
        console.log("333");
        this.currentLevel = 'zonetitle';
        this.breadcrumb = this.breadcrumb.slice(0, 4);
        this.fetchZoneData(this.selectedostan, this.selectedshahrestan);
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
</style>