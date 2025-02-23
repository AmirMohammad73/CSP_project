<template>
    <v-container>
        <div v-if="loading">Loading data...</div>
        <v-card v-else>
            <v-card-title class="text-h5 font-weight-bold text-center py-4" style="direction: rtl;">
                {{ title }}
            </v-card-title>
            <v-card-text>
                <v-row justify="center" class="mb-4">
                    <v-col v-for="(city, index) in topCities" :key="index" cols="4" class="text-center">
                        <v-hover v-slot="{ hover }">
                            <div class="city-container">
                                <v-icon :size="80" :color="getMedalColor(index)" class="mb-2 transition-swing"
                                    :class="{ 'scale-up': hover }">
                                    mdi-medal
                                </v-icon>
                                <p class="mt-2 city-name">{{ city.ostantitle }}</p>
                            </div>
                        </v-hover>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <div v-if="error">Error loading data: {{ error }}</div>
    </v-container>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/app';
import { useIPStore } from '../stores/app';

export default defineComponent({
    props: {
        title: {
            type: String,
            default: 'رتبه‌بندی برترین شهرها'
        },
        url: {
            type: String,
            required: true
        }
    },

    setup(props) {
        const authStore = useAuthStore();
        const IPStore = useIPStore();
        const SERVER_HOST = IPStore.SERVER_HOST;
        const topCities = ref([]);
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
                    // جابجا کردن ترتیب شهرها
                    const [first, second, ...rest] = data.slice(0, 3); // دریافت ۳ شهر برتر
                    topCities.value = [second, first, ...rest]; // جابجا کردن اول و دوم
                } else {
                    throw new Error('Invalid server response: No data found');
                }
            } catch (e) {
                error.value = e.message;
            } finally {
                loading.value = false;
            }
        };

        const getMedalColor = (index) => {
            const colors = ['grey darken-1', 'yellow darken-2', 'brown darken-2']; // جابجا کردن رنگ‌ها
            return colors[index] || 'grey';
        };

        onMounted(() => {
            fetchData();
        });

        return {
            topCities,
            loading,
            error,
            getMedalColor
        };
    },
});
</script>

<style scoped>
.city-container {
    cursor: pointer;
}

.city-name {
    font-size: 1.2rem;
    font-weight: bold;
}

.transition-swing {
    transition: transform 0.3s ease;
}

.scale-up {
    transform: scale(1.1);
}

.font-weight-bold {
    font-family: 'B traffic';
    font-size: small !important;
}
</style>