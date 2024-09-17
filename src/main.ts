import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// element style
import "element-plus/theme-chalk/src/message.scss";   // ElMessage
import 'element-plus/theme-chalk/dark/css-vars.css'   // dark mode
import "@/styles/index.scss";

// basic style
// import './assets/main.css'

const app = createApp(App)

app.use(router)

app.mount('#app')
