<template>
  <ion-page>
    <ion-content class="profile-content">
      <div v-if="user" class="profile-container">
        <!-- Capçalera del perfil -->
        <div class="profile-header" :style="{ background: randomColor }">
          <ion-avatar class="profile-avatar">
            <img :src="user.profile_photo_url || 'https://ionicframework.com/docs/img/demos/avatar.svg'" />
          </ion-avatar>
          <div class="profile-info">
            <h1 class="profile-name">{{ user.name }}</h1>
            <p class="profile-email">{{ user.email }}</p>
            <ion-badge color="light" class="member-since">
              Membre des de {{ formatDate(user.created_at) }}
            </ion-badge>
          </div>
        </div>

        <!-- Informació del perfil -->
        <ion-card class="profile-card">
          <ion-card-header class="card-header">
            <ion-card-title class="card-title">
              <ion-icon :icon="personCircleOutline" class="title-icon"></ion-icon>
              Informació del perfil
            </ion-card-title>
          </ion-card-header>

          <ion-list lines="none" class="info-list">
            <ion-item class="info-item">
              <ion-icon :icon="personOutline" slot="start" class="info-icon"></ion-icon>
              <ion-label class="info-label">Nom complet</ion-label>
              <ion-text class="info-text">{{ user.name }}</ion-text>
            </ion-item>

            <ion-item class="info-item">
              <ion-icon :icon="mailOutline" slot="start" class="info-icon"></ion-icon>
              <ion-label class="info-label">Correu electrònic</ion-label>
              <ion-text class="info-text">{{ user.email }}</ion-text>
            </ion-item>

            <ion-item class="info-item" v-if="user.phone">
              <ion-icon :icon="callOutline" slot="start" class="info-icon"></ion-icon>
              <ion-label class="info-label">Telèfon</ion-label>
              <ion-text class="info-text">{{ user.phone }}</ion-text>
            </ion-item>

            <ion-item class="info-item">
              <ion-icon :icon="calendarOutline" slot="start" class="info-icon"></ion-icon>
              <ion-label class="info-label">Data de registre</ion-label>
              <ion-text class="info-text">{{ formatDate(user.created_at) }}</ion-text>
            </ion-item>
          </ion-list>
        </ion-card>

        <!-- Secció "Els meus arxius" -->
        <ion-card class="media-card">
          <ion-card-header class="card-header">
            <ion-card-title class="card-title">
              <ion-icon :icon="folderOutline" class="title-icon"></ion-icon>
              Els meus arxius
            </ion-card-title>
          </ion-card-header>

          <div v-if="userMedia.length > 0" class="media-grid">
            <div v-for="media in userMedia" :key="media.id" class="media-item" @click="goToMedia(media.id)">
              <div class="media-thumbnail-container">
                <div class="media-thumbnail">
                  <img v-if="media.type === 'image'" :src="media.path" class="thumbnail" />
                  <video v-else :src="media.path" class="thumbnail"></video>
                </div>
                <div class="media-overlay">
                  <ion-icon :icon="chevronForward" class="overlay-icon"></ion-icon>
                </div>
              </div>
              <div class="media-info">
                <h3 class="media-title">{{ media.title }}</h3>
                <p class="media-date">{{ formatShortDate(media.created_at) }}</p>
              </div>
            </div>
          </div>

          <div v-else class="empty-media">
            <ion-icon :icon="folderOpenOutline" class="empty-icon"></ion-icon>
            <p class="empty-text">Encara no has pujat cap arxiu</p>
            <ion-button fill="outline" router-link="/create" class="upload-button">
              Pujar contingut
            </ion-button>
          </div>
        </ion-card>
      </div>

      <div v-else class="loading-container">
        <ion-spinner name="crescent" class="loading-spinner"></ion-spinner>
        <p class="loading-text">Carregant perfil...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'
import {
  IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonAvatar, IonList, IonLabel, IonItem, IonSpinner, IonText, IonBadge,
  IonIcon, IonButton
} from '@ionic/vue'
import {
  personOutline, mailOutline, callOutline, calendarOutline,
  chevronForward, personCircleOutline, folderOutline,
  folderOpenOutline, refreshOutline
} from 'ionicons/icons'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const user = ref(null)
const userMedia = ref([])
const loading = ref(true)
const refreshing = ref(false)

// Colors per al fons del perfil
const colors = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
]

const randomColor = ref(colors[Math.floor(Math.random() * colors.length)])

const formatDate = (dateString) => {
  if (!dateString) return 'Desconegut'
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('ca-ES', options)
}

const formatShortDate = (dateString) => {
  if (!dateString) return ''
  const options = { day: 'numeric', month: 'short' }
  return new Date(dateString).toLocaleDateString('ca-ES', options)
}

const goToMedia = (mediaId) => {
  router.push(`/multimedia/${mediaId}`)
}

// Funció per carregar dades del perfil
const loadProfileData = async () => {
  try {
    refreshing.value = true
    const [userResponse, mediaResponse] = await Promise.all([
      axios.get('/user'),
      axios.get('/multimedia')
    ])

    // Afegim manualment els camps necessaris
    user.value = {
      ...userResponse.data,
      email: userResponse.data.email || 'Correu no disponible',
      created_at: userResponse.data.created_at
    }

    userMedia.value = mediaResponse.data.data
        .filter(media => media.user_id === user.value.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } catch (error) {
    console.error('Error carregant dades:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// Carregar dades inicials
onMounted(loadProfileData)

// Actualitzar quan la ruta canvia (per si s'obre el mateix perfil)
watch(() => route.path, (newPath) => {
  if (newPath === '/profile') {
    loadProfileData()
  }
})
</script>

<style scoped>
.profile-content {
  --background: #f8f9fa;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

/* Capçalera del perfil */
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  color: white;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
}

.profile-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.1);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border: 4px solid white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1;
  margin-bottom: 16px;
}

.profile-info {
  text-align: center;
  z-index: 1;
}

.profile-name {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.profile-email {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 16px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.member-since {
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  background-color: rgba(255,255,255,0.2);
}

/* Targetes d'informació */
.profile-card,
.media-card {
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
}

.card-header {
  padding: 20px 20px 10px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.title-icon {
  margin-right: 12px;
  color: var(--ion-color-primary);
}

/* Llista d'informació */
.info-list {
  padding: 0;
}

.info-item {
  --padding-start: 20px;
  --padding-end: 20px;
  --inner-padding-end: 0;
  --min-height: 56px;
  border-bottom: 1px solid rgba(var(--ion-color-medium-rgb), 0.1);
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  color: var(--ion-color-primary);
  font-size: 1.2rem;
}

.info-label {
  font-weight: 500;
  color: var(--ion-color-medium);
}

.info-text {
  color: var(--ion-color-dark);
}

/* Secció d'arxius */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  padding: 16px;
}

.media-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.media-item:hover {
  transform: translateY(-4px);
}

.media-thumbnail-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
  background: #000;
}

.media-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.media-item:hover .thumbnail {
  transform: scale(1.05);
}

.media-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.media-item:hover .media-overlay {
  opacity: 1;
}

.overlay-icon {
  color: white;
  font-size: 1.5rem;
}

.media-info {
  padding: 8px 4px;
}

.media-title {
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-date {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
  margin: 4px 0 0;
}

/* Estat buit */
.empty-media {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  color: var(--ion-color-medium);
  margin-bottom: 24px;
}

.upload-button {
  --border-radius: 20px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  --padding-start: 24px;
  --padding-end: 24px;
}

/* Loading state */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  color: var(--ion-color-primary);
}

.loading-text {
  margin-top: 16px;
  color: var(--ion-color-medium);
}

/* Responsive */
@media (max-width: 768px) {
  .profile-header {
    padding: 24px 16px;
  }

  .profile-avatar {
    width: 100px;
    height: 100px;
  }

  .profile-name {
    font-size: 1.5rem;
  }

  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 8px;
  }

  .profile-header {
    padding: 20px 12px;
  }

  .profile-avatar {
    width: 80px;
    height: 80px;
  }

  .media-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>