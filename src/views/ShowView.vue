<template>
  <ion-page>
    <ion-content class="media-detail-content">
      <div class="media-layout">
        <!-- Secció principal (esquerra) -->
        <div class="main-content">
          <!-- Reproductor de vídeo/imatge -->
          <div class="media-container">
            <video
                v-if="currentMedia.type === 'video'"
                ref="videoPlayer"
                :src="currentMedia.path"
                controls
                autoplay
                class="media-player"
                playsinline
                disablePictureInPicture
            ></video>
            <img
                v-else
                :src="currentMedia.path"
                class="media-image"
            />
          </div>

          <!-- Informació del contingut -->
          <div class="media-info">
            <h1 class="media-title">{{ currentMedia.title }}</h1>

            <div class="media-meta">
              <div class="author-info">
                <ion-avatar class="author-avatar">
                  <img :src="currentMedia.user?.profile_photo_url || 'https://ionicframework.com/docs/img/demos/avatar.svg'" />
                </ion-avatar>
                <div class="author-details">
                  <span class="author-name">{{ currentMedia.user?.name || 'Anònim' }}</span>
                  <span class="upload-date">{{ formatDate(currentMedia.created_at) }}</span>
                </div>
              </div>

              <div class="media-stats">
                <span class="stat-item">
                  <ion-icon :icon="eyeOutline"></ion-icon>
                  {{ views.toLocaleString() }} visualitzacions
                </span>
              </div>
            </div>

            <div class="media-description">
              <p>{{ currentMedia.description }}</p>
            </div>

            <!-- Accions del propietari -->
            <div class="owner-actions" v-if="isOwner">
              <ion-button fill="outline" @click="goToEdit" class="action-button">
                <ion-icon slot="start" :icon="pencil"></ion-icon>
                Editar
              </ion-button>
              <ion-button fill="outline" color="danger" @click="goToDelete" class="action-button">
                <ion-icon slot="start" :icon="trash"></ion-icon>
                Eliminar
              </ion-button>
            </div>
          </div>
        </div>

        <!-- Llista de vídeos relacionats (dreta) -->
        <div class="related-videos">
          <h3 class="related-title">Més continguts</h3>
          <div class="video-list">
            <div
                v-for="item in relatedMedia"
                :key="item.id"
                class="video-item"
                @click="goToMedia(item.id)"
            >
              <div class="video-thumbnail">
                <img
                    v-if="item.type === 'image'"
                    :src="item.path"
                    class="thumbnail"
                />
                <video
                    v-else
                    :src="item.path"
                    class="thumbnail"
                ></video>
                <div class="video-duration" v-if="item.type === 'video'">3:45</div>
              </div>
              <div class="video-info">
                <h4 class="video-title">{{ item.title }}</h4>
                <div class="video-meta">
                  <span class="video-author">{{ item.user?.name }}</span>
                  <span class="video-views">{{ Math.floor(Math.random() * 10000).toLocaleString() }} visites</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  personCircle, pencil, trash, eyeOutline, timeOutline
} from 'ionicons/icons'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'
import {
  IonPage, IonContent, IonIcon, IonButton, IonAvatar
} from '@ionic/vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const videoPlayer = ref(null)
const currentMedia = ref({
  title: '',
  description: '',
  path: '',
  type: '',
  created_at: '',
  user_id: null,
  user: {}
})
const relatedMedia = ref([])
const views = ref(0)

// Computed property to check if current user is owner
const isOwner = computed(() => {
  return authStore.user?.id && currentMedia.value.user_id &&
      authStore.user.id === currentMedia.value.user_id
})

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('ca-ES', options)
}

const goToEdit = () => {
  pauseVideo()
  router.push(`/edit/${route.params.id}`)
}

const goToDelete = () => {
  pauseVideo()
  router.push(`/delete/${route.params.id}`)
}

const goToMedia = (id) => {
  pauseVideo()
  router.push(`/multimedia/${id}`)
}

const pauseVideo = () => {
  if (videoPlayer.value && currentMedia.value.type === 'video') {
    videoPlayer.value.pause()
  }
}

// Handle navigation events
const beforeRouteHandler = () => {
  pauseVideo()
}

onMounted(async () => {
  try {
    const [{ data: mediaData }, { data: relatedData }] = await Promise.all([
      axios.get(`/multimedia/${route.params.id}`),
      axios.get('/multimedia?limit=5')
    ])

    currentMedia.value = mediaData.data
    // Exclude the current media from the related media list
    relatedMedia.value = relatedData.data.filter(item => item.id !== mediaData.data.id)
    views.value = Math.floor(Math.random() * (1000000 - 100000) + 100000)

    // Add navigation guard
    window.addEventListener('beforeunload', pauseVideo)
    router.beforeEach(beforeRouteHandler)
  } catch (error) {
    console.error('Error loading media:', error)
  }
})


onBeforeUnmount(() => {
  pauseVideo()
  window.removeEventListener('beforeunload', pauseVideo)
  router.off('beforeEach', beforeRouteHandler)
})
</script>

<style scoped>
.media-detail-content {
  --background: #f9f9f9;
  --padding-top: 0;
  --padding-bottom: 0;
}

.media-layout {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  gap: 24px;
}

/* Secció principal (esquerra) */
.main-content {
  flex: 1;
  min-width: 0;
}

.media-container {
  width: 100%;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.media-player,
.media-image {
  width: 100%;
  display: block;
  aspect-ratio: 16/9;
  object-fit: contain;
}

.media-info {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.media-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #0f0f0f;
  line-height: 1.4;
}

.media-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 500;
  font-size: 0.95rem;
  color: #0f0f0f;
}

.upload-date {
  font-size: 0.85rem;
  color: #606060;
}

.media-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #606060;
}

.media-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #0f0f0f;
  margin: 0 0 24px 0;
  white-space: pre-wrap;
}

.owner-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.action-button {
  --border-radius: 6px;
  --padding-start: 16px;
  --padding-end: 16px;
  font-weight: 500;
  font-size: 0.9rem;
  height: 40px;
}

/* Llista de vídeos relacionats (dreta) */
.related-videos {
  width: 360px;
  flex-shrink: 0;
}

.related-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 16px 12px;
  color: #0f0f0f;
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.video-item:hover {
  background: rgba(0,0,0,0.05);
}

.video-thumbnail {
  position: relative;
  width: 168px;
  height: 94px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  background: #000;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0,0,0,0.8);
  color: white;
  font-size: 0.75rem;
  padding: 2px 4px;
  border-radius: 4px;
}

.video-info {
  flex: 1;
  min-width: 0;
}

.video-title {
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0 0 6px 0;
  color: #0f0f0f;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.video-author {
  font-size: 0.85rem;
  color: #606060;
}

.video-views {
  font-size: 0.8rem;
  color: #606060;
}

/* Disseny responsive */
@media (max-width: 1200px) {
  .media-layout {
    flex-direction: column;
    padding: 16px;
  }

  .related-videos {
    width: 100%;
    margin-top: 24px;
  }

  .video-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  .video-item {
    flex-direction: column;
    gap: 8px;
  }

  .video-thumbnail {
    width: 100%;
    height: auto;
    aspect-ratio: 16/9;
  }
}

@media (max-width: 768px) {
  .media-title {
    font-size: 1.3rem;
  }

  .media-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .owner-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .media-layout {
    padding: 12px;
  }

  .media-title {
    font-size: 1.2rem;
  }

  .video-list {
    grid-template-columns: 1fr;
  }
}
</style>