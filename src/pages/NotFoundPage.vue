<template>
    <NotFound />
  </template>
  
  <script setup>
  import NotFound from '../components/NotFound.vue';
  
  // Define the component
  defineComponent({
    name: 'NotFoundPage',
    components: { NotFound }
  });
  </script>