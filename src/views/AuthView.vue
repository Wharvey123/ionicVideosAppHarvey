<template>
  <ion-page>
    <ion-content class="auth-content" scroll-y="false">
      <div class="auth-wrapper">
        <div class="auth-container">
          <div class="auth-header">
            <h1>{{ isLogin ? 'Iniciar Sessió' : 'Crear Compte' }}</h1>
          </div>

          <form @submit.prevent="handleSubmit" class="auth-form">
            <ion-item v-if="!isLogin" class="form-item">
              <ion-input
                  v-model="form.name"
                  type="text"
                  :placeholder="!isLogin ? 'Nom' : ''"
                  required
                  :key="'name-' + isLogin"
              ></ion-input>
            </ion-item>

            <ion-item class="form-item">
              <ion-input
                  v-model="form.email"
                  type="email"
                  placeholder="Email"
                  required
                  :key="'email-' + isLogin"
              ></ion-input>
            </ion-item>

            <ion-item class="form-item">
              <ion-input
                  v-model="form.password"
                  type="password"
                  placeholder="Contrasenya"
                  required
                  :key="'password-' + isLogin"
              ></ion-input>
            </ion-item>

            <ion-item v-if="!isLogin" class="form-item">
              <ion-input
                  v-model="form.password_confirmation"
                  type="password"
                  placeholder="Confirma Contrasenya"
                  required
                  :key="'confirm-' + isLogin"
              ></ion-input>
            </ion-item>

            <ion-button
                type="submit"
                expand="block"
                class="submit-button"
                :disabled="loading"
            >
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <span v-else>{{ isLogin ? 'Entrar' : 'Registrar' }}</span>
            </ion-button>

            <ion-button
                fill="clear"
                expand="block"
                class="toggle-button"
                @click="toggleAuthMode"
            >
              {{ isLogin ? 'No tens compte? Registra\'t' : 'Ja tens compte? Entra' }}
            </ion-button>
          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  IonPage, IonContent, IonItem, IonInput, IonButton, IonSpinner
} from '@ionic/vue'

const router = useRouter()
const authStore = useAuthStore()
const isLogin = ref(true)
const loading = ref(false)

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

// Reset form quan canvia el mode
watch(isLogin, () => {
  resetForm()
})

// Reset form quan l'usuari fa logout
watch(() => authStore.isAuthenticated, (newVal) => {
  if (!newVal) resetForm()
})

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value
}

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  }
}

const handleSubmit = async () => {
  if (!isLogin.value && form.value.password !== form.value.password_confirmation) {
    return alert('Les contrasenyes no coincideixen!')
  }

  loading.value = true
  try {
    if (isLogin.value) {
      await authStore.login({
        email: form.value.email,
        password: form.value.password
      })
    } else {
      await authStore.register({
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        password_confirmation: form.value.password_confirmation
      })
    }
    router.push('/')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-item {
  --border-radius: 8px;
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 24px;
  --background: #f8f9fa;
  border-radius: 8px;
}

.form-item ion-input::part(placeholder) {
  color: var(--ion-color-medium);
  opacity: 0.8;
  font-size: 0.95rem;
  transition: opacity 0.2s ease;
}

.auth-content {
  --background: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.auth-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.auth-header {
  padding: 24px 24px 16px;
  text-align: center;
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-secondary) 100%);
  color: white;
}

.auth-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.auth-form {
  padding: 20px 24px 24px;
}

.submit-button {
  --border-radius: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
  margin-top: 32px;
  margin-bottom: 16px;
  font-weight: 600;
  height: 48px;
}

.toggle-button {
  margin-top: 16px;
  --color: var(--ion-color-medium);
  font-size: 0.9rem;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .auth-wrapper {
    padding: 16px;
  }

  .auth-container {
    border-radius: 12px;
  }

  .auth-header {
    padding: 20px 16px 12px;
  }

  .auth-form {
    padding: 16px;
  }

  .form-item {
    margin-bottom: 20px;
  }

  .submit-button {
    margin-top: 24px;
  }
}
</style>