<template>
  <v-card title="Locations" flat elevation="2" dir="rtl" class="pa-6 rounded">
    <!-- Card Title -->
    <v-card-title class="text-h5 font-weight-bold mb-4 primary--text">
      📍 Locations Management
    </v-card-title>

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
    <v-data-table-virtual v-if="!loading && !error" :headers="headers" :items="filteredLocations" height="35vw"
      item-value="ostantitle" class="elevation-1 rounded" fixed-header>
      <!-- Custom Header for Bonyad Maskan Column -->
      <template v-slot:header.bonyad_maskan="{ column }">
        <div class="d-flex justify-center align-center">
          {{ column.title }}
          <v-menu location="bottom end" :close-on-content-click="false" transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-filter-variant" size="small" variant="text" v-bind="props" class="ms-2"></v-btn>
            </template>
            <v-card class="pa-2" elevation="4">
              <v-list density="compact">
                <v-list-item v-for="option in filterOptions" :key="option.value"
                  @click="bonyadMaskanFilter = option.value">
                  <v-list-item-title class="d-flex align-center">
                    <v-icon :color="option.color" class="me-2">{{ option.icon }}</v-icon>
                    <span>{{ option.label }}</span>
                    <v-icon v-if="bonyadMaskanFilter === option.value" color="primary"
                      class="ms-auto">mdi-check</v-icon>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </div>
      </template>

      <!-- Bonyad Maskan Column -->
      <template v-slot:item.bonyad_maskan="{ item }">
        <div class="d-flex justify-center">
          <v-icon v-if="item.bonyad_maskan" color="primary">mdi-check</v-icon>
        </div>
      </template>

      <!-- Other Boolean Columns -->
      <template v-slot:item.tarsim="{ item }">
        <div class="d-flex justify-center">
          <v-icon v-if="item.tarsim" color="primary">mdi-check</v-icon>
        </div>
      </template>

      <template v-slot:item.sayer_manabe="{ item }">
        <div class="d-flex justify-center">
          <v-icon v-if="item.sayer_manabe" color="primary">mdi-check</v-icon>
        </div>
      </template>

      <template v-slot:item.amaliate_meydani="{ item }">
        <div class="d-flex justify-center">
          <v-icon v-if="item.amaliate_meydani" color="primary">mdi-check</v-icon>
        </div>
      </template>

      <template v-slot:item.dadeh_amaei="{ item }">
        <div class="d-flex justify-center">
          <v-icon v-if="item.dadeh_amaei" color="primary">mdi-check</v-icon>
        </div>
      </template>

      <template v-slot:item.eslah_naghsheh="{ item }">
        <div class="d-flex justify-center">
          <v-icon v-if="item.eslah_naghsheh" color="primary">mdi-check</v-icon>
        </div>
      </template>

      <template v-slot:item.daryafte_naghsheh="{ item }">
        <div class="d-flex justify-center">
          <v-icon v-if="item.daryafte_naghsheh" color="primary">mdi-check</v-icon>
        </div>
      </template>

      <template v-slot:item.tolid_qr="{ item }">
        <div class="d-flex justify-center">
          <v-icon v-if="item.tolid_qr" color="primary">mdi-check</v-icon>
        </div>
      </template>

      <template v-slot:item.nasbe_pelak="{ item }">
        <div class="d-flex justify-center">
          <v-icon v-if="item.nasbe_pelak" color="primary">mdi-check</v-icon>
        </div>
      </template>

      <template v-slot:item.tayid_va_bargozari="{ item }">
        <div class="d-flex justify-center">
          <v-icon v-if="item.tayid_va_bargozari" color="primary">mdi-check</v-icon>
        </div>
      </template>

      <template v-slot:item.pdf="{ item }">
        <div class="d-flex justify-center">
          <v-icon v-if="item.pdf" color="primary">mdi-check</v-icon>
        </div>
      </template>

      <template v-slot:item.ersal_setad="{ item }">
        <div class="d-flex justify-center">
          <v-icon v-if="item.ersal_setad" color="primary">mdi-check</v-icon>
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
        {
          title: 'استان',
          align: 'end',
          key: 'ostantitle',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'شهرستان',
          align: 'end',
          key: 'shahrestantitle',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'بخش',
          align: 'end',
          key: 'zonetitle',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'دهستان',
          align: 'end',
          key: 'dehestantitle',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'روستا',
          align: 'end',
          key: 'locationname',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'ID',
          align: 'end',
          key: 'population_point_id',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'شناسه ملی',
          align: 'end',
          key: 'shenaseh_melli',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'بنیاد مسکن',
          align: 'end',
          key: 'bonyad_maskan',
          sortable: false,
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'ترسیم',
          align: 'end',
          key: 'tarsim',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'سایر منابع',
          align: 'end',
          key: 'sayer_manabe',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'عملیات میدانی',
          align: 'end',
          key: 'amaliate_meydani',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'داده آمائی',
          align: 'end',
          key: 'dadeh_amaei',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'اصلاح و ارسال',
          align: 'end',
          key: 'eslah_naghsheh',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'ژئوکد',
          align: 'end',
          key: 'daryafte_naghsheh',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'Tolid QR',
          align: 'end',
          key: 'tolid_qr',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'Nasbe Pelak',
          align: 'end',
          key: 'nasbe_pelak',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'Tayid va Bargozari',
          align: 'end',
          key: 'tayid_va_bargozari',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'تعداد ساختمان',
          align: 'end',
          key: 'tedad_sakhteman',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'تعداد ساختمان ژئوکدشده',
          align: 'end',
          key: 'tedad_geosakhteman',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'Tedad Makan',
          align: 'end',
          key: 'tedad_makan',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'Tedad Geocode Makan',
          align: 'end',
          key: 'tedad_geocode_makan',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'Tedad Makan Jadid',
          align: 'end',
          key: 'tedad_makan_jadid',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'مختصات روستا',
          align: 'end',
          key: 'pdf',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'محدوده روستا',
          align: 'end',
          key: 'ersal_setad',
          class: 'text-subtitle-1 font-weight-bold',
        },
      ],
      locations: [], // Data will be fetched from the server
      loading: false,
      error: false,
      snackbar: false,
      snackbarMessage: '',
      filterOptions: [
        { label: 'Checked', value: 'checked', icon: 'mdi-checkbox-marked', color: 'primary' },
        { label: 'Unchecked', value: 'unchecked', icon: 'mdi-checkbox-blank-outline', color: 'secondary' },
        { label: 'All', value: 'all', icon: 'mdi-filter', color: 'success' },
      ],
    };
  },

  computed: {
    filteredLocations() {
      const query = this.search.toLowerCase();

      // First apply search filter
      let filtered = this.locations.filter((location) => {
        return Object.values(location).some((value) => {
          return String(value).toLowerCase().includes(query);
        });
      });

      // Then apply Bonyad Maskan filter
      if (this.bonyadMaskanFilter !== 'all') {
        filtered = filtered.filter((location) => {
          return this.bonyadMaskanFilter === 'checked' ? location.bonyad_maskan : !location.bonyad_maskan;
        });
      }

      return filtered;
    },
  },

  methods: {
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

    saveChanges() {
      // Here you would typically make an API call to save the changes
      this.snackbarMessage = 'Changes saved successfully!';
      this.snackbar = true;
    },

    exportToExcel() {
      try {
        const exportData = this.filteredLocations.map((location) => ({
          'Ostantitle': location.ostantitle,
          'Shahrestantitle': location.shahrestantitle,
          'Zonetitle': location.zonetitle,
          'Dehestantitle': location.dehestantitle,
          'Location Name': location.locationname,
          'Population Point ID': location.population_point_id,
          'Shenaseh Melli': location.shenaseh_melli,
          'Bonyad Maskan': location.bonyad_maskan ? '✔' : '',
          'Tarsim': location.tarsim ? '✔' : '',
          'Sayer Manabe': location.sayer_manabe ? '✔' : '',
          'Amaliate Meydani': location.amaliate_meydani ? '✔' : '',
          'Dadeh Amaei': location.dadeh_amaei ? '✔' : '',
          'Eslah Naghsheh': location.eslah_naghsheh ? '✔' : '',
          'Daryafte Naghsheh': location.daryafte_naghsheh ? '✔' : '',
          'Tolid QR': location.tolid_qr ? '✔' : '',
          'Nasbe Pelak': location.nasbe_pelak ? '✔' : '',
          'Tayid va Bargozari': location.tayid_va_bargozari ? '✔' : '',
          'Tedad Sakhteman': location.tedad_sakhteman,
          'Tedad Geosakhteman': location.tedad_geosakhteman,
          'Tedad Makan': location.tedad_makan,
          'Tedad Geocode Makan': location.tedad_geocode_makan,
          'Tedad Makan Jadid': location.tedad_makan_jadid,
          'PDF': location.pdf ? '✔' : '',
          'Ersal Setad': location.ersal_setad ? '✔' : '',
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