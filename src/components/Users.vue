<template>
    <v-main>
      <v-container fluid fill-height>
        <v-row justify="center" align="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="elevation-12" style="background-color: #f7f7f7; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <v-toolbar color="#3498db" dark>
                <v-toolbar-title style="font-family: 'B Yekan'; font-size: 24px;">دسترسی غیر مجاز</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <div class="text-center">
                  <v-icon size="100" color="#e74c3c">mdi-lock</v-icon>
                </div>
                <h2 class="text-center mt-4" style="font-family: 'B Yekan'; font-size: 20px; color: #666;">شما مجوز دسترسی به این صفحه را ندارید.</h2>
                <p class="text-center mt-2" style="font-family: 'B Yekan'; font-size: 16px; color: #999;">لطفا با مدیر سیستم تماس بگیرید اگر این یک اشتباه است.</p>
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn color="#2ecc71" @click="$router.back()">بازگشت</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </template>
  
  <script>
  export default {
    name: 'AccessDenied',
  }
  </script>
  
  <style scoped>
    @import url('https://fonts.googleapis.com/css2?family=B+Yekan&display=swap');
    .v-card {
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .v-toolbar {
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
    }
  </style>
  

