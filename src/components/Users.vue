<template>
  <v-main :class="AppStore.isDarkTheme ? 'dark-theme' : 'light-theme'">
    <v-container fluid fill-height>
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="elevation-12" :style="cardStyle">
            <v-toolbar :color="AppStore.isDarkTheme ? '#2c3e50' : '#3498db'" dark>
              <v-toolbar-title style="font-family: 'B Yekan'; font-size: 24px;">دسترسی غیر مجاز</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <div class="text-center">
                <v-icon size="100" :color="AppStore.isDarkTheme ? '#e74c3c' : '#e74c3c'">mdi-lock</v-icon>
              </div>
              <h2 class="text-center mt-4" :style="textStyle">شما مجوز دسترسی به این صفحه را ندارید.</h2>
              <p class="text-center mt-2" :style="subTextStyle">لطفا با مدیر سیستم تماس بگیرید اگر این یک اشتباه است.</p>
            </v-card-text>
            <v-card-actions class="justify-center">
              <v-btn :color="AppStore.isDarkTheme ? '#27ae60' : '#2ecc71'" @click="$router.back()">بازگشت</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import { useAppStore } from '../stores/app'; // Import the AppStore

export default {
  name: 'AccessDenied',
  setup() {
    const AppStore = useAppStore();
    return { AppStore };
  },
  computed: {
    // Dynamic styles based on the theme
    cardStyle() {
      return {
        backgroundColor: this.AppStore.isDarkTheme ? '#34495e' : '#f7f7f7',
        border: this.AppStore.isDarkTheme ? '1px solid #2c3e50' : '1px solid #ccc',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
      };
    },
    textStyle() {
      return {
        fontFamily: "'B Yekan'",
        fontSize: '20px',
        color: this.AppStore.isDarkTheme ? '#ecf0f1' : '#666',
      };
    },
    subTextStyle() {
      return {
        fontFamily: "'B Yekan'",
        fontSize: '16px',
        color: this.AppStore.isDarkTheme ? '#bdc3c7' : '#999',
      };
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=B+Yekan&display=swap');

.v-card {
  border-radius: 10px;
}

.v-toolbar {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

/* Global theme styles */
.dark-theme {
  background-color: #2c3e50;
  color: #ecf0f1;
}

.light-theme {
  background-color: #ffffff;
  color: #2c3e50;
}
</style>