<template>
    <div class="login-page">
        <div class="login-container">
            <h2>ورود</h2>
            <form @submit.prevent="submitForm">
                <div class="input-group">
                    <label for="email"><b>نام کاربری:</b></label>
                    <input type="text" id="email" v-model="username" required />
                </div>
                <div class="input-group">
                    <label for="password">پسورد:</label>
                    <input type="password" id="password" v-model="password" />
                </div>
                <button type="submit" class="login-button">
                    ورود
                    <component class="logicon" :is="LogIn" />
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import LogIn from '../components/Login/icons/login.vue'; // Make sure this path is correct

const username = ref('');
const password = ref('');

function submitForm() {
    console.log("Username:", username.value);
    console.log("Password:", password.value);
}
</script>
<style scoped>
/* Your CSS styles here */
html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
}

label {
    text-align: start;
}

.login-page {
    font-size: large;
    font-weight: bolder;
    font-family: 'B Traffic';
    direction: rtl;
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

.login-container {
    background: rgba(0, 0, 0, 0.7);
    padding: 30px;
    border-radius: 10px;
    width: 350px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    text-align: center;
}

h2 {
    color: white;
    margin-bottom: 20px;
}

.input-group {
    margin-bottom: 15px;
    text-align: left;
}

label {
    color: white;
    display: block;
    margin-bottom: 5px;
}

input {
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.login-button {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'B Traffic';
    width: 100%;
    padding: 10px;
    background-color: #1e90ff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

.login-button:hover {
    background-color: #1c7ed6;
}
</style>