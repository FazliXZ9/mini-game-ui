import { createApp } from 'vue';
import App from './App.vue';
import router from './components/router'; // <-- Impor router

import './assets/main.css'; // Sesuaikan jika perlu

const app = createApp(App);

app.use(router); // <-- Gunakan router

app.mount('#app');