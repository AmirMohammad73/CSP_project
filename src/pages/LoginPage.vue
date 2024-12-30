<template>
    <Login />
  </template>
  
  <script setup>
  import Login from '../components/Login.vue';
  
  // Define the component
  defineComponent({
    name: 'LoginPage',
    components: { Login }
  });
  </script>