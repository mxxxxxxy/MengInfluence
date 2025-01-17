import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import color from "@/js/color"
import App from './App.vue'
// import router from './router'
const app = createApp(App)

app.config.globalProperties.$color = color

app.use(createPinia())
// app.use(router)

app.mount('#app')
