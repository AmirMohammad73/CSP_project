<template>
    <v-select
      :model-value="selectedOption" <!-- Bind the prop value -->
      :items="options"
      label="Select an option"
      outlined
      dense
      @update:model-value="updateSelectedOption" <!-- Emit an event to update the prop -->
    ></v-select>
  </template>
  
  <script>
  export default {
    props: {
      options: {
        type: Array,
        required: true,
      },
      selectedOption: {
        type: String,
        required: true,
      },
    },
    emits: ["update:selectedOption"], // Declare the event
    methods: {
      updateSelectedOption(newValue) {
        this.$emit("update:selectedOption", newValue); // Emit the new value
      },
    },
  };
  </script>