<template>
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center" class="text-center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="pa-6" elevation="12" color="primary" dark>
            <v-icon size="100" class="mb-4">mdi-alert-circle-outline</v-icon>
            <h1 class="display-2 font-weight-bold mb-4">404</h1>
            <p class="headline mb-4">Oops! Page Not Found</p>
            <p class="subtitle-1 mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <v-btn
              color="white"
              outlined
              large
              @click="$router.push('/')"
            >
              <v-icon left>mdi-home</v-icon>
              Go Back Home
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  export default {
    name: "NotFoundPage",
  };
  </script>
  
  <style scoped>
  .fill-height {
    height: 100vh;
    background: linear-gradient(135deg, #ff6f61, #ffcc00);
    animation: gradientAnimation 10s ease infinite;
  }
  
  @keyframes gradientAnimation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  .v-card {
    border-radius: 20px;
    overflow: hidden;
    transition: transform 0.3s ease;
  }
  
  .v-card:hover {
    transform: scale(1.05);
  }
  </style>