<template>
    <v-btn color="primary" @click="exportToExcel">
      Export to Excel
    </v-btn>
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
    methods: {
      exportToExcel() {
        const worksheetData = [this.headers.map((header) => header.text)];
        this.tableData.forEach((row) => {
          const rowData = this.headers.map((header) => row[header.value]);
          worksheetData.push(rowData);
        });
  
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, this.title);
  
        const excelFileName = `${this.title}-Table.xlsx`;
        XLSX.writeFile(workbook, excelFileName);
      },
    },
  };
  </script>