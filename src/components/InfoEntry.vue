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
        // Other boat objects with the capacity property
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
        // Convert the value to a string and check if it includes the query
        return String(value).toLowerCase().includes(query);
      });
    });
  },
  },
  methods: {
    saveChanges() {
      // Implement the logic to save changes here
      this.snackbarMessage = 'Changes saved!';
      this.snackbar = true;
    }
  }
}
</script>

<style scoped>
.v-data-table-virtual {
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.v-data-table-virtual thead th {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 1;
}

.v-data-table-virtual tbody td {
  font-size: 14px;
  color: #666;
}

.v-data-table-virtual tbody tr:hover {
  background-color: #f7f7f7;
}

.v-checkbox {
  margin: 0;
  padding: 0;
}
</style>
