<template>
    <div class="login-page" dir="rtl">
        <div class="login-container">
            <div class="logo-container">
                <!-- Add a logo or icon above the form -->
                <img src="../components/Login/icons/login.png" alt="Logo" class="logo" />
            </div>
            <h2>ورود به سیستم</h2>
            <p class="subheading">لطفاً اطلاعات خود را وارد کنید</p>
            <form @submit.prevent="handleLogin">
                <div class="input-group">
                    <label for="username"><b>نام کاربری:</b></label>
                    <input type="text" id="username" v-model="username" placeholder="نام کاربری خود را وارد کنید"
                        required />
                </div>
                <div class="input-group">
                    <label for="password"><b>پسورد:</b></label>
                    <input type="password" id="password" v-model="password" placeholder="پسورد خود را وارد کنید"
                        required />
                </div>
                <button type="submit" class="login-button" :disabled="loading">
                    ورود
                    <component class="logicon" :is="LogIn" />
                </button>
                <p v-if="error" class="error-message">
                    <v-icon class="error-icon" icon="mdi-alert-circle-outline"></v-icon>
                    نام کاربری یا رمز عبور اشتباه است.
                </p>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import LogIn from '../components/Login/icons/login.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/app';

// Get router and store instances
const router = useRouter();
const authStore = useAuthStore();

// Define reactive variables
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(false);

// Handle login logic
const handleLogin = async () => {
    loading.value = true; // Show loading state
    error.value = false; // Reset error state

    // Call the login action from the store
    const success = authStore.login(username.value, password.value);

    if (success) {
        // Redirect to the dashboard on successful login
        await router.push('/dashboard');
    } else {
        // Show an error message if login fails
        error.value = true;
    }

    loading.value = false; // Reset loading state
};
</script>

<style scoped>
/* General Styles */
body {
    margin: 0;
    padding: 0;
    font-family: 'B Traffic', sans-serif;
    direction: rtl; /* Set direction to RTL for the entire page */
}

/* Login Page Background */
.login-page {
    font-size: large;
    font-weight: bolder;
    font-family: 'B Traffic';
    direction: rtl; /* Ensure RTL direction */
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: url('../components/Login/26165.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: fixed;
    top: 0;
    left: 0;
}

/* Login Container */
.login-container {
    background: rgba(0, 0, 0, 0.7);
    padding: 30px;
    border-radius: 15px;
    width: 400px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    text-align: center;
    animation: fadeIn 0.8s ease-in-out;
}

.logo-container {
    margin-bottom: 20px;
}

.logo {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}

/* Headings */
h2 {
    color: white;
    margin-bottom: 10px;
    font-size: 24px;
}

.subheading {
    color: #ddd;
    font-size: 14px;
    margin-bottom: 30px;
}

/* Input Group */
.input-group {
    margin-bottom: 20px;
    text-align: right; /* Align text to the right */
}

label {
    color: white;
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

input {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #ddd;
    background: #333;
    color: white;
    font-size: 14px;
    text-align: right; /* Align input text to the right */
}

input::placeholder {
    color: rgba(255, 255, 255, 0.6);
    text-align: right; /* Align placeholder text to the right */
}

input:focus {
    border-color: #1e90ff;
    outline: none;
    box-shadow: 0 0 5px rgba(30, 144, 255, 0.3);
}

/* Login Button */
.login-button {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'B Traffic';
    width: 100%;
    padding: 12px;
    background-color: #1e90ff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s, transform 0.2s ease;
}

.login-button:hover {
    background-color: #0077ff;
    transform: scale(1.02);
}

.login-button:disabled {
    background-color: gray;
    cursor: not-allowed;
}

/* Loading Spinner */
.loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid transparent;
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Error Message */
.error-message {
    color: red;
    font-size: 14px;
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.error-icon {
    margin-left: 5px;
    font-size: 18px;
}

/* Animations */
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

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>