<template>
  <v-main :class="AppStore.isDarkTheme ? 'dark-theme' : 'light-theme'">
    <v-container fluid fill-height>
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="elevation-12" :style="cardStyle">
            <v-toolbar :color="AppStore.isDarkTheme ? '#1e272e' : '#74b9ff'" dark>
              <v-toolbar-title class="toolbar-title">دسترسی غیر مجاز</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <div class="text-center">
                <v-icon size="100" :color="AppStore.isDarkTheme ? '#e17055' : '#d63031'">mdi-lock</v-icon>
              </div>
              <h2 class="text-center mt-4" :style="textStyle">شما مجوز دسترسی به این صفحه را ندارید.</h2>
              <p class="text-center mt-2" :style="subTextStyle">لطفا با مدیر سیستم تماس بگیرید اگر این یک اشتباه است.
              </p>
            </v-card-text>
            <v-card-actions class="justify-center">
              <v-btn :color="AppStore.isDarkTheme ? '#00cec9' : '#55efc4'" class="action-button"
                @click="$router.back()">
                بازگشت
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import { useAppStore } from '../stores/app';

export default {
  name: 'AccessDenied',
  setup() {
    const AppStore = useAppStore();
    return { AppStore };
  },
  computed: {
    cardStyle() {
      return {
        backgroundColor: this.AppStore.isDarkTheme ? '#2f3640' : '#f5f6fa',
        border: this.AppStore.isDarkTheme ? '1px solid #353b48' : '1px solid #dcdde1',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
      };
    },
    textStyle() {
      return {
        fontFamily: "'B Yekan'",
        fontSize: '20px',
        color: this.AppStore.isDarkTheme ? '#dcdde1' : '#2f3640',
        lineHeight: '1.5',
      };
    },
    subTextStyle() {
      return {
        fontFamily: "'B Yekan'",
        fontSize: '16px',
        color: this.AppStore.isDarkTheme ? '#7f8fa6' : '#636e72',
        lineHeight: '1.4',
      };
    },
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=B+Yekan&display=swap');

.v-card {
  border-radius: 12px;
  padding: 16px;
}

.v-toolbar {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.toolbar-title {
  font-family: 'B Yekan';
  font-size: 24px;
  letter-spacing: 0.5px;
}

.action-button {
  font-size: 16px;
  font-weight: bold;
  text-transform: none;
  border-radius: 8px;
  padding: 10px 20px;
}

.dark-theme {
  background-color: #1e272e;
  color: #dcdde1;
}

.light-theme {
  background-color: #f5f6fa;
  color: #2f3640;
}
</style>
