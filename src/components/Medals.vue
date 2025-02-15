<template>
    <v-container>
        <v-card>
            <v-card-title class="text-h5 font-weight-bold text-center py-4" style="direction: rtl;">
                {{ title }}
            </v-card-title>
            <v-card-text>
                <v-row justify="center" class="mb-4">
                    <v-col v-for="(city, index) in topCities" :key="index" cols="4" class="text-center">
                        <v-hover v-slot="{ hover }">
                            <div class="city-container">
                                <v-icon :size="80" :color="city.color" class="mb-2 transition-swing"
                                    :class="{ 'scale-up': hover }">
                                    {{ city.icon }}
                                </v-icon>
                                <p class="mt-2 city-name">{{ city.name }}</p>
                            </div>
                        </v-hover>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
import { ref } from 'vue';

export default {
    props: {
        title: {
            type: String,
            default: 'رتبه‌بندی برترین شهرها'
        }
    },

    setup() {
        const topCities = ref([
            { name: 'مشهد', icon: 'mdi-medal', color: 'grey darken-1' },
            { name: 'تهران', icon: 'mdi-medal', color: 'yellow darken-2' },
            { name: 'اصفهان', icon: 'mdi-medal', color: 'brown darken-2' },
        ]);

        return { topCities };
    },
};
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