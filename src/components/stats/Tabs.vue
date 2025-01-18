<template>
    <v-tabs
      :model-value="activeTab" <!-- Bind the prop value -->
      dir="rtl"
      dark
      centered
      @update:model-value="updateActiveTab" <!-- Emit an event to update the prop -->
    >
      <v-tab v-for="(tab, index) in tabs" :key="index" :value="index">
        {{ tab }}
      </v-tab>
    </v-tabs>
    <v-tabs-items :model-value="activeTab">
      <v-tab-item>
        <slot></slot>
      </v-tab-item>
    </v-tabs-items>
  </template>
  
  <script>
  export default {
    props: {
      tabs: {
        type: Array,
        required: true,
      },
      activeTab: {
        type: Number,
        required: true,
      },
    },
    emits: ["update:activeTab"], // Declare the event
    methods: {
      updateActiveTab(newValue) {
        this.$emit("update:activeTab", newValue); // Emit the new value
      },
    },
  };
  </script>