<template>
    <v-card flat elevation="2" dir="rtl" class="pa-6 rounded">
      <!-- Card Title -->
      <v-card-title class="text-h5 font-weight-bold mb-4 primary--text">
        📍 
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
      <LocationsTable v-if="!loading && !error" :headers="headers" :items="filteredLocations"
        @row-click="handleRowClick" />
  
      <!-- Action Buttons -->
      <v-card-actions class="mt-4">
        <v-spacer></v-spacer>
        <v-btn color="success" class="text-white rounded-pill elevation-2" @click="exportToExcel">
          <v-icon left>mdi-file-excel</v-icon>
          Export to Excel
        </v-btn>
      </v-card-actions>
  
      <template>
        <div>
          <!-- Dialog for Roosta Data -->
          <RoostaDialog v-model="dialog" :roosta-data="roostaData" :roosta-headers="roostaHeaders"
            :sticky-header-background-color="stickyHeaderBackgroundColor" :data-first-item="dataFirstItem"
            @save-success="handleSaveSuccess" @save-error="handleSaveError" />
  
          <!-- Snackbar -->
          <v-snackbar v-model="snackbar" :timeout="3000" :top="true" :color="snackbarColor" class="rounded elevation-2">
            <div v-html="snackbarMessage" class="rtl-message"></div>
            <template v-slot:action="{ attrs }">
              <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
                بستن
              </v-btn>
            </template>
          </v-snackbar>
        </div>
      </template>
    </v-card>
  </template>
  
  <script>
  import * as XLSX from 'xlsx';
  import { useAppStore } from "../stores/app";
  import { useIPStore } from '../stores/app';
  import LocationsTable from './LocationsTable.vue';
  import RoostaDialog from './RoostaDialog.vue';
  import { useAuthStore } from '../stores/app';
  import { useRouter } from 'vue-router';
  export default {
    components: {
      LocationsTable,
      RoostaDialog,
    },
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
          { title: 'ردیف', align: 'center', key: 'row_number', class: 'text-subtitle-1 font-weight-bold' },
          { title: 'مکان', align: 'center', key: 'locname', class: 'text-subtitle-1 font-weight-bold' },
          // { title: 'تعداد بنیاد مسکن', align: 'center', key: 'bonyad_maskan_count', class: 'text-subtitle-1 font-weight-bold' },
          // { title: 'تعداد سایر منابع', align: 'center', key: 'sayer_manabe_count', class: 'text-subtitle-1 font-weight-bold' },
          // { title: 'تعداد ترسیم', align: 'center', key: 'tarsim_count', class: 'text-subtitle-1 font-weight-bold' },
          { title: 'تعداد نقشه ها', align: 'center', key: 'total_naghsheh_count', class: 'text-subtitle-1 font-weight-bold' },
          { title: 'تعداد پارسلها', align: 'center', key: 'total_parcel_count', class: 'text-subtitle-1 font-weight-bold' },
          { title: 'تعداد عملیات میدانی', align: 'center', key: 'amaliate_meydani_count', class: 'text-subtitle-1 font-weight-bold data-bar-column' },
          // { title: 'تعداد رکورد بهنگام شده', align: 'center', key: 'record_count', class: 'text-subtitle-1 font-weight-bold' },
          // { title: 'تعداد مکان بهنگام شده', align: 'center', key: 'makan_count', class: 'text-subtitle-1 font-weight-bold' },
          // { title: 'تعداد ساختمان بهنگام شده', align: 'center', key: 'building_count', class: 'text-subtitle-1 font-weight-bold' },
          { title: 'تعداد داده آمائی', align: 'center', key: 'dadeh_amaei_count', class: 'text-subtitle-1 font-weight-bold' },
          { title: 'تعداد ژئوکد', align: 'center', key: 'geocode_count', class: 'text-subtitle-1 font-weight-bold' },
          // { title: 'تعداد مکان ژئوکدشده', align: 'center', key: 'geocode_makan_count', class: 'text-subtitle-1 font-weight-bold' },
          // { title: 'ساختمانهای ژئوکدشده', align: 'center', key: 'geocode_building_count', class: 'text-subtitle-1 font-weight-bold' },
          { title: 'تعداد مختصات روستا', align: 'center', key: 'mokhtasat_roosta_count', class: 'text-subtitle-1 font-weight-bold' },
          { title: 'تعداد حریم روستا', align: 'center', key: 'mahdoudeh_roosta_count', class: 'text-subtitle-1 font-weight-bold' },
        ],
        locations: [],
        roostaHeaders: [
          { title: 'استان', key: 'ostantitle' },
          { title: 'شهرستان', key: 'shahrestantitle' },
          { title: 'بخش', key: 'zonetitle' },
          { title: 'دهستان', key: 'dehestantitle' },
          { title: 'روستا', key: 'locationname' },
          { title: 'ID', key: 'population_point_id' },
          { title: 'شناسه ملی', key: 'shenaseh_melli' },
          // { title: 'بنیاد مسکن', key: 'bonyad_maskan' },
          // { title: 'سایر منابع', key: 'sayer_manabe' },
          // { title: 'ترسیم', key: 'tarsim' },
          { title: 'پارسلها', key: 'tedad_parcel' },
          { title: 'عملیات میدانی', key: 'amaliate_meydani' },
          { title: 'داده آمائی', key: 'dadeh_amaei' },
          { title: 'ژئوکد', key: 'geocode' },
          { title: 'اصلاح نقشه', key: 'eslah_naghsheh' },
          { title: 'مختصات روستا', key: 'mokhtasat_rousta' },
          { title: 'حریم روستا', key: 'mahdoudeh_rousta' },
          { title: 'تولید QR', key: 'tolid_qr' },
          { title: 'نصب پلاک', key: 'pelak_talfighi' },
        ],
        roostaData: [],
        loading: false,
        error: false,
        snackbar: false,
        snackbarMessage: '',
        breadcrumb: [{ text: 'کشور', disabled: false }],
        currentLevel: 'کشور',
        currentOstantitle: '',
        isRole4: false,
        filterOptions: [
          { label: 'Checked', value: 'checked', icon: 'mdi-checkbox-marked', color: 'primary' },
          { label: 'Unchecked', value: 'unchecked', icon: 'mdi-checkbox-blank-outline', color: 'secondary' },
          { label: 'All', value: 'all', icon: 'mdi-filter', color: 'success' },
        ],
        dataFirstItem: null,
      };
    },
  
    computed: {
      stickyHeaderBackgroundColor() {
        return this.AppStore.isDarkTheme ? 'black' : 'white';
      },
  
      filteredLocations() {
        return this.locations;
      },
    },
  
    methods: {
      async handleRowClick(item) {
        if (this.currentLevel === 'کشور') {
          // For role 4, this will not happen since we start at ostantitle
          this.currentOstantitle = item.locname;
          this.breadcrumb.push({ text: item.locname, disabled: false });
          this.currentLevel = 'ostantitle';
          await this.fetchDetailedLocations(item.locname);
        } else if (this.currentLevel === 'ostantitle') {
          this.currentOstantitle = item.locname;
          this.breadcrumb.push({ text: item.locname, disabled: false });
          this.currentLevel = 'shahrestantitle';
          this.selectedostan = item.locname;
          await this.fetchShahrestanData(item.locname);
        } else if (this.currentLevel === 'shahrestantitle') {
          this.breadcrumb.push({ text: item.locname, disabled: false });
          this.currentLevel = 'zonetitle';
          this.selectedshahrestan = item.locname;
          await this.fetchZoneData(this.selectedostan, item.locname);
        } else if (this.currentLevel === 'zonetitle') {
          this.breadcrumb.push({ text: item.locname, disabled: false });
          this.currentLevel = 'dehestantitle';
          this.selectedzonetitle = item.locname;
          await this.fetchDehestanData(this.selectedostan, this.selectedshahrestan, item.locname);
        } else if (this.currentLevel === 'dehestantitle') {
          this.selectedDehestan = item;
          await this.fetchRoostaData(this.selectedostan, this.selectedshahrestan, this.selectedzonetitle, item.locname);
          this.dialog = true;
        }
      },
      async fetchDetailedLocations() {
        this.loading = true;
        this.error = false;
        const ipStore = useIPStore();
        const authStore = useAuthStore();
        const SERVER_HOST = ipStore.SERVER_HOST;
        try {
          const response = await fetch(`${SERVER_HOST}/api/locations/detailed`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          });
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
        const ipStore = useIPStore();
        const authStore = useAuthStore();
        const SERVER_HOST = ipStore.SERVER_HOST;
        this.loading = true;
        this.error = false;
  
        try {
          const response = await fetch(`${SERVER_HOST}/api/locations/shahrestan?ostantitle=${encodeURIComponent(ostantitle)}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          });
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
        const ipStore = useIPStore();
        const authStore = useAuthStore();
        const SERVER_HOST = ipStore.SERVER_HOST;
        this.loading = true;
        this.error = false;
  
        try {
          const response = await fetch(`${SERVER_HOST}/api/locations/zone?ostantitle=${encodeURIComponent(ostantitle)}&shahrestantitle=${encodeURIComponent(shahrestantitle)}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          });
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
        const ipStore = useIPStore();
        const authStore = useAuthStore();
        const SERVER_HOST = ipStore.SERVER_HOST;
        this.loading = true;
        this.error = false;
        try {
          const response = await fetch(`${SERVER_HOST}/api/locations/dehestan?ostantitle=${encodeURIComponent(ostantitle)}&shahrestantitle=${encodeURIComponent(shahrestantitle)}&zonetitle=${encodeURIComponent(zonetitle)}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          });
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
        const ipStore = useIPStore();
        const authStore = useAuthStore();
        const SERVER_HOST = ipStore.SERVER_HOST;
        this.loading = true;
        this.error = false;
        try {
          const response = await fetch(
            `${SERVER_HOST}/api/locations/roosta?ostantitle=${encodeURIComponent(ostantitle)}&shahrestantitle=${encodeURIComponent(shahrestantitle)}&zonetitle=${encodeURIComponent(zonetitle)}&dehestantitle=${encodeURIComponent(dehestantitle)}`
            , {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${authStore.token}`,
              },
            });
          if (!response.ok) {
            throw new Error('Failed to fetch roosta data');
          }
          const data = await response.json();
          this.roostaData = data;
        } catch (error) {
          console.error('Error fetching roosta data:', error);
          this.error = true;
        } finally {
          this.loading = false;
        }
      },
      async fetchLocations() {
        const ipStore = useIPStore();
        const authStore = useAuthStore();
        const router = useRouter();
        const SERVER_HOST = ipStore.SERVER_HOST;
        this.loading = true;
        this.error = false;
  
        try {
          const response = await fetch(`${SERVER_HOST}/api/locations`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          });
          if (!response.ok) {
            authStore.logout();
            
            throw new Error('Failed to fetch locations data');
          }
          const data = await response.json();
          this.dataFirstItem = data[0];
          if (data[0] === 'ostan' || data[0] === 'setad' || data[0] === 'QR') {
            this.isRole4 = true;
            // If data is empty (role 4), fetch detailed locations directly
            await this.fetchDetailedLocations();
            // Update currentLevel and breadcrumb for role 4
            this.currentLevel = 'ostantitle';
            this.breadcrumb = [{ text: 'استان', disabled: false }];
          } else if (data[0] === 'nazer'){
            this.isRole4 = false;
            // Otherwise, use the fetched data
            this.locations = [data[1]];
          } else {
            this.isRole4 = false;
            // Otherwise, use the fetched data
            this.locations = data;
          }
        } catch (error) {
          console.error('Error fetching locations data:', error);
          this.error = true;
          authStore.logout();
          router.push('/');
        } finally {
          this.loading = false;
        }
      },
      navigateBreadcrumb(item) {
        if (item.text === 'کشور') {
          // For role 4, reset to ostantitle level
          this.currentLevel = 'کشور';
          this.breadcrumb = [{ text: 'کشور', disabled: false }];
          this.fetchLocations();
          this.roostaData = [];
        } else if (item.text === 'استان') {
          // For role 4, reset to ostantitle level
          this.currentLevel = 'ostantitle';
          this.breadcrumb = [{ text: 'استان', disabled: false }];
          this.fetchDetailedLocations(this.currentOstantitle);
          this.roostaData = [];
        }
        else if (this.breadcrumb.length > 1 && item.text === this.breadcrumb[1].text) {
          this.isRole4 ? this.currentLevel = 'shahrestantitle' : this.currentLevel = 'ostantitle';
          // this.currentLevel = 'ostantitle';
          this.breadcrumb = this.breadcrumb.slice(0, 2);
          this.isRole4 ? this.fetchShahrestanData(this.selectedostan) : this.fetchDetailedLocations(this.currentOstantitle);
          // this.fetchDetailedLocations(this.currentOstantitle);
          this.roostaData = [];
        } else if (this.breadcrumb.length > 2 && item.text === this.breadcrumb[2].text) {
          this.isRole4 ? this.currentLevel = 'zonetitle' : this.currentLevel = 'shahrestantitle';
          // this.currentLevel = 'shahrestantitle';
          this.breadcrumb = this.breadcrumb.slice(0, 3);
          this.isRole4 ? this.fetchZoneData(this.selectedostan, this.selectedshahrestan) : this.fetchShahrestanData(this.selectedostan);
          // this.fetchShahrestanData(this.selectedostan);
          this.roostaData = [];
        } else if (this.breadcrumb.length > 3 && item.text === this.breadcrumb[3].text) {
          this.isRole4 ? this.currentLevel = 'dehestantitle' : this.currentLevel = 'zonetitle';
          // this.currentLevel = 'zonetitle';
          this.breadcrumb = this.breadcrumb.slice(0, 4);
          this.isRole4 ? this.fetchDehestanData(this.selectedostan, this.selectedshahrestan, this.selectedzonetitle) : this.fetchZoneData(this.selectedostan, this.selectedshahrestan);
          // this.fetchZoneData(this.selectedostan, this.selectedshahrestan);
          this.roostaData = [];
        }
      },
      exportToExcel() {
        try {
          const exportData = this.filteredLocations.map((location) => ({
            'ردیف': location.row_number,
            'مکان': location.locname,
            'تعداد بنیاد مسکن': location.bonyad_maskan_count,
            'تعداد سایر منابع': location.sayer_manabe_count,
            'تعداد ترسیم': location.tarsim_count,
            'تعداد نقشه ها': location.total_naghsheh_count,
            'تعداد پارسلها': location.total_parcel_count,
            'تعداد عملیات میدانی': location.amaliate_meydani_count,
            'Record Count': location.record_count,
            'Makan Count': location.makan_count,
            'تعداد ساختمان بهنگام شده': location.building_count,
            'تعداد داده آمائی': location.dadeh_amaei_count,
            'GeoCode Count': location.geocode_count,
            'Geocode Makan Count': location.geocode_makan_count,
            'Geocode Building Count': location.geocode_building_count,
            'تعداد مختصات روستا': location.mokhtasat_roosta_count,
            'تعداد حریم روستا': location.mahdoudeh_roosta_count,
          }));
  
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.json_to_sheet(exportData);
  
          const headerStyle = {
            font: { bold: true },
            alignment: { horizontal: 'center' },
          };
  
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
      handleSaveSuccess(message) {
        this.snackbarMessage = `<span dir="rtl">${message}</span>`;
        this.snackbarColor = 'success';
        this.snackbar = true;
      },
      handleSaveError(message) {
        this.snackbarMessage = `<span dir="rtl">${message}</span>`;
        this.snackbarColor = 'error';
        this.snackbar = true;
      },
    },
  
    mounted() {
      this.fetchLocations();
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
  .v-data-table {
    font-size: large; /* یا مقدار مشخصی مانند 16px */
  }
  .v-data-table-virtual {
    direction: ltr;
    text-align: right;
    font-family: 'B Traffic', sans-serif;
  }
  .v-data-table-virtual th {
    font-weight: bold;
    text-align: right;
  }
  .v-btn--icon:hover {
    background-color: rgba(25, 118, 210, 0.04);
  }
  
  .v-list {
    min-width: 150px;
  }
  
  .v-radio {
    margin: 4px 0;
  }
  
  .v-radio-group {
    padding: 0;
  }
  
  .rtl-message {
    direction: rtl;
    text-align: right;
    font-family: 'B Traffic', sans-serif;
    /* Use the same font as in your dialog */
  }
  </style>