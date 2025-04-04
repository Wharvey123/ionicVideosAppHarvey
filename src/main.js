import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { IonicVue } from '@ionic/vue'

// Importa TOTS els estils CSS necessaris
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'
import './theme/variables.css'

const app = createApp(App)
const pinia = createPinia()

// Ordre CRÍTIC de plugins
app.use(IonicVue) // Primer Ionic
app.use(pinia)     // Després Pinia
app.use(router)    // Finalment Router

// Espera que el router estigui preparat
router.isReady().then(() => {
    app.mount('#app')
})