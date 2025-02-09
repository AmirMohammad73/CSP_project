<template>
    <div>
      <div v-if="loading">Loading data...</div>
      <v-card v-else class="field-card" :style="{ background: cardColor }" elevation="8">
        <v-card-text>
          <div class="header">
            <span class="badge">{{ title }} {{ emoji }}</span>
          </div>
          <div class="number">{{ displayNumber }}</div>
        </v-card-text>
      </v-card>
      <div v-if="error">Error loading data: {{ error }}</div>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted, watch } from 'vue';
  import { useAuthStore } from '../stores/app';
  import { useIPStore } from '../stores/app';
  
  export default defineComponent({
    props: {
      url: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        default: 'Field Operations',
      },
      emoji: {
        type: String,
        default: '🛠️',
      },
      cardColor: {
        type: String,
        default: 'linear-gradient(135deg, #42a5f5, #1e88e5)',
      },
    },
    setup(props) {
      const authStore = useAuthStore();
      const IPStore = useIPStore();
      const SERVER_HOST = IPStore.SERVER_HOST;
      const number = ref(null);
      const displayNumber = ref(0);
      const loading = ref(false);
      const error = ref(null);
  
      const fetchData = async () => {
        loading.value = true;
        error.value = null;
        try {
          const response = await fetch(`http://${SERVER_HOST}:3001/api/${props.url}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authStore.token}`,
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            authStore.logout();
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            number.value = parseInt(data[0].stats, 10);
          } else {
            throw new Error('Invalid server response: No data found');
          }
        } catch (e) {
          error.value = e.message;
        } finally {
          loading.value = false;
        }
      };
  
      const animateNumber = (target) => {
        const duration = 1000;
        const startTime = Date.now();
  
        const updateNumber = () => {
          const currentTime = Date.now();
          const elapsed = currentTime - startTime;
  
          if (elapsed < duration) {
            displayNumber.value = Math.round((elapsed / duration) * target);
            requestAnimationFrame(updateNumber);
          } else {
            displayNumber.value = target;
          }
        };
  
        requestAnimationFrame(updateNumber);
      };
  
      watch(number, (newValue) => {
        if (newValue !== null) {
          animateNumber(newValue);
        }
      });
  
      onMounted(() => {
        fetchData();
      });
  
      return {
        displayNumber,
        loading,
        error,
      };
    },
  });
  </script>
  
  <style scoped>
  .field-card {
    width: auto;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 12px;
    color: white;
    text-align: center;
    font-family: 'Arial', sans-serif;
  }
  
  .header {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 14px;
  }
  
  .badge {
    font-family: 'B Traffic';
    background: rgba(255, 255, 255, 0.2);
    padding: 6px 12px;
    border-radius: 8px;
    font-weight: bold;
  }
  
  .number {
    font-size: 40px;
    font-weight: bold;
    font-family: 'B Traffic';
    line-height: 1.2;
    letter-spacing: -1px;
    margin-top: auto;
    animation: fadeIn 1.5s ease-in-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  </style>
  