<template>
  <v-card title="Boats" flat dir="rtl" class="pa-4">
    <template v-slot:text>
      <v-text-field v-model="search" label="Search" append-inner-icon="mdi-magnify" variant="outlined" hide-details single-line dir="rtl" class="mb-4"></v-text-field>
    </template>
    <v-data-table-virtual :headers="headers" :items="filteredBoats" height="35vw" item-value="name" class="elevation-1" fixed-header>
      <template v-slot:item.favorite="{ item }">
        <v-checkbox v-model="item.favorite" @click.stop color="primary"></v-checkbox>
      </template>
      <template v-slot:item.capacity="{ item }">
        <v-text-field v-model="item.capacity" type="number" dense hide-details single-line></v-text-field>
      </template>
    </v-data-table-virtual>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="success" @click="exportToExcel" class="mr-2">
        Export to Excel
      </v-btn>
      <v-btn color="primary" @click="saveChanges">Save Changes</v-btn>
    </v-card-actions>
    <v-snackbar v-model="snackbar" :timeout="3000" :top="true">
      {{ snackbarMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      search: '',
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
          value: 'favorite',
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
      ],
      snackbar: false,
      snackbarMessage: '',
    }
  },
  computed: {
    virtualBoats() {
      return [...Array(10000).keys()].map((i) => {
        const boat = { ...this.boats[i % this.boats.length] }
        boat.name = `${boat.name} #${i}`
        return boat
      })
    },
    filteredBoats() {
      const query = this.search.toLowerCase();
      return this.virtualBoats.filter((boat) => {
        return Object.values(boat).some((value) => {
          return String(value).toLowerCase().includes(query);
        });
      });
    },
  },
  methods: {
    saveChanges() {
      this.snackbarMessage = 'Changes saved!';
      this.snackbar = true;
    },
    exportToExcel() {
      try {
        // Prepare the data for export
        const exportData = this.filteredBoats.map(boat => ({
          'Boat Type': boat.name,
          'Speed (knots)': boat.speed,
          'Length (m)': boat.length,
          'Price ($)': boat.price,
          'Year': boat.year,
          'Favorite': boat.favorite ? 'Yes' : 'No',
          'Capacity': boat.capacity
        }));

        // Create a new workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Boats');

        // Generate the Excel file
        XLSX.writeFile(wb, 'boats_data.xlsx');

        // Show success message
        this.snackbarMessage = 'Excel file exported successfully!';
        this.snackbar = true;
      } catch (error) {
        console.error('Error exporting to Excel:', error);
        this.snackbarMessage = 'Error exporting to Excel file';
        this.snackbar = true;
      }
    }
  }
}
</script>