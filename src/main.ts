import './assets/main.css'
import './assets/customTheme.css' //dark i light tema

import { createApp } from 'vue' 
import App from './App.vue' 
import router from './router'

const app = createApp(App) // app.vue, root tj. korena komponenta

app.use(router) //rutiranje linkova

app.mount('#app')
