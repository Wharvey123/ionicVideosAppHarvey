<template>
  <ion-page>
    <ion-content class="home-content">
      <!-- Media Grid -->
      <div class="media-container">
        <div v-for="item in mediaItems" :key="item.id" class="media-card" @click="goToShow(item.id)">
          <div class="media-thumbnail-container">
            <div class="media-thumbnail">
              <img
                  v-if="item.type === 'image'"
                  :src="item.path"
                  class="thumbnail"
                  loading="lazy"
              />
              <video
                  v-else
                  :src="item.path"
                  class="thumbnail"
                  preload="metadata"
                  disablePictureInPicture
                  disableRemotePlayback
              ></video>
              <div class="media-overlay">
                <ion-icon v-if="item.type === 'video'" :icon="playCircle" class="play-icon"></ion-icon>
              </div>
            </div>
            <div class="media-info">
              <h3 class="media-title">{{ item.title }}</h3>
              <div class="media-meta">
                <ion-icon :icon="timeOutline" class="meta-icon"></ion-icon>
                <span class="media-date">{{ formatDate(item.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="mediaItems.length === 0" class="empty-state">
        <ion-icon :icon="filmOutline" class="empty-icon"></ion-icon>
        <p class="empty-text">No hi ha contingut disponible</p>
      </div>

      <!-- Fixed Create Button - Only show if authenticated -->
      <ion-fab v-if="authStore.isAuthenticated" vertical="bottom" horizontal="end" slot="fixed" class="create-fab">
        <ion-fab-button @click="goToCreate" class="fab-button">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth'
import {
  add, playCircle, timeOutline, filmOutline
} from 'ionicons/icons'
import {
  IonPage, IonContent, IonFab, IonFabButton, IonIcon
} from '@ionic/vue'

const mediaItems = ref([])
const router = useRouter()
const authStore = useAuthStore()

const formatDate = (dateString) => {
  if (!dateString) return ''
  const options = { day: 'numeric', month: 'short' }
  return new Date(dateString).toLocaleDateString('ca-ES', options)
}

const goToShow = (id) => {
  router.push(`/multimedia/${id}`)
}

const goToCreate = () => {
  if (!authStore.isAuthenticated) {
    // Optionally redirect to login here if you want
    return
  }
  router.push('/create')
}

onMounted(async () => {
  try {
    const { data } = await axios.get('/multimedia')
    mediaItems.value = data.data
  } catch (error) {
    console.error('Error loading content:', error)
    // You might want to show an error message to the user here
  }
})
</script>

<style scoped>
.home-content {
  --background: #f8f9fa;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 80px;
}

.media-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  max-width: 1600px;
  margin: 0 auto;
}

.media-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.media-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.12);
}

.media-thumbnail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.media-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  overflow: hidden;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.media-card:hover .thumbnail {
  transform: scale(1.03);
}

.media-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.2);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.media-card:hover .media-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 3rem;
  color: rgba(255,255,255,0.9);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.media-info {
  padding: 12px;
  flex-grow: 1;
}

.media-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--ion-color-dark);
}

.media-meta {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: var(--ion-color-medium);
}

.meta-icon {
  font-size: 0.9rem;
  margin-right: 6px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
  padding: 20px;
}

.empty-icon {
  font-size: 3rem;
  color: var(--ion-color-medium);
  opacity: 0.5;
  margin-bottom: 16px;
}

.empty-text {
  color: var(--ion-color-medium);
  font-size: 1.1rem;
  margin: 0;
}

/* Fixed Create Button */
.create-fab {
  margin-bottom: 20px;
}

.fab-button {
  --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.fab-button:hover {
  transform: scale(1.1);
  --box-shadow: 0 6px 16px rgba(var(--ion-color-primary-rgb), 0.4);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .media-container {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
  }

  .home-content {
    --padding-start: 8px;
    --padding-end: 8px;
  }
}

@media (max-width: 480px) {
  .media-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .media-card {
    border-radius: 8px;
  }
}
</style>