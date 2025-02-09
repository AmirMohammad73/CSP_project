<template>
    <v-card class="field-card" :style="{ background: cardColor }" elevation="8">
        <v-card-text>
            <div class="header">
                <span class="badge">{{ title }} {{ emoji }}</span>
            </div>
            <div class="number">{{ number }}</div>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    props: {
        number: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            default: 'Field Operations'
        },
        emoji: {
            type: String,
            default: '🛠️'
        },
        cardColor: {
            type: String,
            default: 'linear-gradient(135deg, #42a5f5, #1e88e5)'
        }
    }
};
</script>

<style scoped>
.field-card {
    width: 250px;
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