<template>
  <v-card title="Boats" flat elevation="2" dir="rtl" class="pa-6 rounded">
    <!-- Card Title -->
    <v-card-title class="text-h5 font-weight-bold mb-4 primary--text">
      🚤 Boats Management
    </v-card-title>

    <!-- Search Field -->
    <v-card-text>
      <v-text-field v-model="search" label="Search for boats" append-inner-icon="mdi-magnify" variant="outlined"
        hide-details single-line dir="rtl" color="primary" class="mb-4"></v-text-field>
    </v-card-text>

    <!-- Data Table -->
    <v-data-table-virtual :headers="headers" :items="filteredBoats" height="35vw" item-value="name"
      class="elevation-1 rounded" fixed-header>
      <!-- Custom Header for Favorite Column -->
      <template v-slot:header.favorite="{ column }">
        <div class="d-flex justify-center align-center">
          {{ column.title }}
          <v-menu location="bottom end" :close-on-content-click="false" transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-filter-variant" size="small" variant="text" v-bind="props" class="ms-2"></v-btn>
            </template>
            <v-card class="pa-2" elevation="4">
              <v-list density="compact">
                <v-list-item v-for="option in favoriteOptions" :key="option.value"
                  @click="favoriteFilter = option.value">
                  <v-list-item-title class="d-flex align-center">
                    <v-icon :color="option.color" class="me-2">{{ option.icon }}</v-icon>
                    <span>{{ option.label }}</span>
                    <v-icon v-if="favoriteFilter === option.value" color="primary" class="ms-auto">mdi-check</v-icon>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </div>
      </template>

      <template v-slot:item.favorite="{ item }">
        <div class="d-flex justify-center">
          <v-checkbox v-model="item.favorite" @click.stop color="primary"></v-checkbox>
        </div>
      </template>

      <!-- Capacity Column -->
      <template v-slot:item.capacity="{ item }">
        <v-text-field v-model="item.capacity" type="number" dense hide-details single-line
          color="primary"></v-text-field>
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
  name: 'BoatsManagement',

  data() {
    return {
      search: '',
      favoriteFilter: 'all',
      headers: [
        {
          title: 'Boat Type',
          align: 'end',
          key: 'name',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'Speed (knots)',
          align: 'end',
          key: 'speed',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'Length (m)',
          align: 'end',
          key: 'length',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'Price ($)',
          align: 'end',
          key: 'price',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'Year',
          align: 'end',
          key: 'year',
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'Favorite',
          align: 'end',
          key: 'favorite',
          sortable: false,
          class: 'text-subtitle-1 font-weight-bold',
        },
        {
          title: 'Capacity',
          align: 'end',
          key: 'capacity',
          width: '100px',
          class: 'text-subtitle-1 font-weight-bold',
        },
      ],
      boats: [
        {
          name: 'Speedster',
          speed: 35,
          length: 22,
          price: 300000,
          year: 2021,
          favorite: true,
          capacity: 10,
        },
        {
          name: 'OceanMaster',
          speed: 25,
          length: 35,
          price: 500000,
          year: 2020,
          favorite: false,
          capacity: 15,
        },
        {
          name: 'CoastalCruiser',
          speed: 30,
          length: 28,
          price: 400000,
          year: 2022,
          favorite: true,
          capacity: 12,
        },
        {
          name: 'WaveRider',
          speed: 40,
          length: 20,
          price: 250000,
          year: 2021,
          favorite: false,
          capacity: 8,
        },
      ],
      snackbar: false,
      snackbarMessage: '',
      favoriteOptions: [
        { label: 'Checked', value: 'checked', icon: 'mdi-checkbox-marked', color: 'primary' },
        { label: 'Unchecked', value: 'unchecked', icon: 'mdi-checkbox-blank-outline', color: 'secondary' },
        { label: 'All', value: 'all', icon: 'mdi-filter', color: 'success' },
      ],
    };
  },

  computed: {
    virtualBoats() {
      return [...Array(10000).keys()].map((i) => {
        const boat = { ...this.boats[i % this.boats.length] };
        boat.name = `${boat.name} #${i + 1}`;
        return boat;
      });
    },

    filteredBoats() {
      const query = this.search.toLowerCase();

      // First apply search filter
      let filtered = this.virtualBoats.filter((boat) => {
        return Object.values(boat).some((value) => {
          return String(value).toLowerCase().includes(query);
        });
      });

      // Then apply favorite filter
      if (this.favoriteFilter !== 'all') {
        filtered = filtered.filter((boat) => {
          return this.favoriteFilter === 'checked' ? boat.favorite : !boat.favorite;
        });
      }

      return filtered;
    },
  },

  methods: {
    saveChanges() {
      // Here you would typically make an API call to save the changes
      this.snackbarMessage = 'Changes saved successfully!';
      this.snackbar = true;
    },

    exportToExcel() {
      try {
        const exportData = this.filteredBoats.map((boat) => ({
          'Boat Type': boat.name,
          'Speed (knots)': boat.speed,
          'Length (m)': boat.length,
          'Price ($)': boat.price,
          'Year': boat.year,
          'Favorite': boat.favorite ? 'Yes' : 'No',
          'Capacity': boat.capacity,
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

        XLSX.utils.book_append_sheet(wb, ws, 'Boats');
        XLSX.writeFile(wb, 'boats_data.xlsx');

        this.snackbarMessage = 'Excel file exported successfully!';
        this.snackbar = true;
      } catch (error) {
        console.error('Error exporting to Excel:', error);
        this.snackbarMessage = 'Error exporting to Excel file';
        this.snackbar = true;
      }
    },
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

/* Align the Favorite column header and items */
.v-data-table-virtual th:nth-child(6),
/* Adjust for the column order */
.v-data-table-virtual td:nth-child(6) {
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