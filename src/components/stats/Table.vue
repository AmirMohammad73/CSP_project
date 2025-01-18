<template>
    <div class="table-container mt-8">
      <h4 class="text-h6 text-right mb-2">{{ title }} Table</h4>
      <v-data-table :items="tableData" :headers="headers" class="elevation-1"></v-data-table>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      tableData: {
        type: Array,
        required: true,
      },
      headers: {
        type: Array,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
    },
  };
  </script>