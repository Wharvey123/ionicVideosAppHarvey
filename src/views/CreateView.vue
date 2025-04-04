<template>
  <ion-page>
    <ion-content class="ion-padding">
      <!-- Upload Form -->
      <template v-if="$route.path === '/create'">
        <form @submit.prevent="handleSubmit">
          <div class="filepond-container">
            <file-pond
                name="file"
                ref="pond"
                label-idle="Arrossega vídeo/imatge o <span class='filepond--label-action'>Buscar</span>"
                accepted-file-types="image/jpeg, image/png, video/mp4"
                max-file-size="20MB"
                :server="serverConfig"
                :instant-upload="false"
                @processfile="handleFileSuccess"
                @error="handleFileError"
                @addfile="handleFileAdd"
                @processfilestart="isUploading = true"
                @processfileprogress="isUploading = true"
            />
          </div>

          <ion-item class="ion-margin-top">
            <ion-label position="stacked">Títol*</ion-label>
            <ion-input v-model="form.title" required></ion-input>
          </ion-item>

          <ion-item class="ion-margin-top">
            <ion-label position="stacked">Descripció</ion-label>
            <ion-textarea v-model="form.description" rows="3"></ion-textarea>
          </ion-item>

          <ion-button
              type="submit"
              expand="block"
              class="ion-margin-top"
              :disabled="!formValid || isUploading"
          >
            <ion-spinner v-if="isUploading" name="crescent"></ion-spinner>
            <span v-else>Publicar</span>
          </ion-button>
        </form>
      </template>

      <!-- Media Gallery -->
      <template v-else>
        <ion-grid class="media-grid">
          <ion-row>
            <ion-col
                v-for="item in mediaItems"
                :key="item.id"
                size="12" size-md="6" size-lg="4"
            >
              <ion-card class="media-card" @click="$router.push(`/multimedia/${item.id}`)">
                <div class="media-thumbnail">
                  <img
                      v-if="item.type === 'image'"
                      :src="item.path"
                      alt="Media thumbnail"
                  />
                  <video
                      v-else
                      :src="item.path"
                      :poster="getVideoPoster(item)"
                  ></video>
                </div>

                <ion-card-content>
                  <p class="description">{{ truncateDescription(item.description) }}</p>
                  <p class="date">{{ formatDate(item.created_at) }}</p>
                </ion-card-content>

                <ion-fab vertical="top" horizontal="end" v-if="authStore.user?.id === item.user_id">
                  <ion-fab-button size="small" color="light" @click.stop>
                    <ion-icon :icon="ellipsisVertical" />
                  </ion-fab-button>
                  <ion-fab-list side="bottom">
                    <ion-fab-button color="light" @click.stop="$router.push(`/edit/${item.id}`)">
                      <ion-icon :icon="pencil" />
                    </ion-fab-button>
                    <ion-fab-button color="danger" @click.stop="confirmDelete(item.id)">
                      <ion-icon :icon="trash" />
                    </ion-fab-button>
                  </ion-fab-list>
                </ion-fab>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-fab vertical="bottom" horizontal="end" class="main-fab">
          <ion-fab-button @click="$router.push('/create')">
            <ion-icon :icon="add" />
          </ion-fab-button>
        </ion-fab>
      </template>
      <ion-button
          expand="block"
          color="medium"
          class="ion-margin-top"
          @click="$router.go(-1)"
      >
        Cancel·lar
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from '@/plugins/axios';
import { useAuthStore } from '@/stores/auth';
import {
  add, ellipsisVertical, pencil, trash
} from 'ionicons/icons';
import {
  IonPage, IonContent, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonAvatar, IonIcon, IonFab, IonFabButton, IonFabList, IonButton,
  IonItem, IonLabel, IonInput, IonTextarea, IonSpinner, toastController
} from '@ionic/vue';
import vueFilePond from 'vue-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import 'filepond/dist/filepond.min.css';

const FilePond = vueFilePond(
    FilePondPluginFileValidateType,
    FilePondPluginFileValidateSize
);

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const pond = ref(null);
const isUploading = ref(false);
const hasFiles = ref(false);
const mediaItems = ref([]);

const form = ref({
  title: '',
  description: '',
});

const serverConfig = {
  url: 'http://localhost:8000/api',
  process: {
    url: '/multimedia',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    ondata: (formData) => {
      // Add form data to the upload
      formData.append('title', form.value.title);
      formData.append('description', form.value.description);
      return formData;
    },
    onerror: (response) => {
      console.error('Upload error:', response);
      isUploading.value = false;
      showToast('Error en pujar el fitxer');
      return response;
    }
  }
};

const formValid = computed(() => {
  return form.value.title.length > 3 && hasFiles.value;
});

const handleFileAdd = () => {
  hasFiles.value = true;
};

const handleFileSuccess = async (error, file) => {
  isUploading.value = false;
  if (!error) {
    if (file.serverId) {
      showToast('Publicació completada!');

      // Forçar refresh dels elements multimèdia
      try {
        const response = await axios.get('/multimedia');
        mediaItems.value = response.data;

        // Redirigir a la pàgina principal amb refresh
        router.push('/home').then(() => {
          window.location.reload();
        });
      } catch (error) {
        console.error('Error loading media:', error);
        router.push('/home');
      }
    } else {
      showToast('Error: El servidor no ha retornat dades');
      console.error('Server response:', file);
    }
  }
};

const handleFileError = (error) => {
  isUploading.value = false;
  console.error('File error:', error);
  showToast('Error en pujar el fitxer');
};

const handleSubmit = () => {
  if (!hasFiles.value) {
    showToast('Si us plau, selecciona almenys un fitxer.');
    return;
  }

  // Trigger the upload process
  const pondInstance = pond.value;
  if (pondInstance) {
    isUploading.value = true; // Activar l'estat de loading
    pondInstance.processFiles();
  }
};

const truncateDescription = (text) => {
  return text?.length > 100 ? text.substring(0, 97) + '...' : text;
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getVideoPoster = (item) => {
  return item.thumbnail_path || '/assets/video-placeholder.jpg';
};

const confirmDelete = async (id) => {
  const toast = await toastController.create({
    header: 'Delete this media?',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Delete', handler: () => deleteMedia(id) }
    ],
    duration: 5000
  });
  await toast.present();
};

const deleteMedia = async (id) => {
  try {
    await axios.delete(`/multimedia/${id}`);
    mediaItems.value = mediaItems.value.filter(item => item.id !== id);
  } catch (error) {
    console.error('Error deleting media:', error);
  }
};

const showToast = async (message) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'top',
  });
  await toast.present();
};

// Load media items when component mounts
onMounted(async () => {
  try {
    const response = await axios.get('/multimedia');
    mediaItems.value = response.data;
  } catch (error) {
    console.error('Error loading media:', error);
  }
});
</script>

<style scoped>
.transparent-header ion-toolbar {
  --border-width: 0 !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.media-grid {
  max-width: 1600px;
  margin: 0 auto;
  padding: 8px;
}

.media-card {
  margin: 8px;
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.media-card:hover {
  transform: translateY(-2px);
}

.media-thumbnail {
  position: relative;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: #000;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.media-thumbnail img,
.media-thumbnail video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

ion-card-header {
  padding: 12px 16px 0;
}

ion-card-content {
  padding: 0 16px 12px;
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.author ion-avatar {
  width: 24px;
  height: 24px;
}

.main-fab {
  margin-bottom: 80px;
}

ion-fab-list ion-fab-button {
  --size: 40px;
}

/* Upload form styles */
.filepond-container {
  border: 2px dashed var(--ion-color-primary);
  border-radius: 16px;
  overflow: hidden;
  margin: 24px 0;
  background: rgba(var(--ion-color-primary-rgb), 0.05);
}

.filepond--root {
  margin: 0;
}

.form-item {
  margin-bottom: 24px;
  --background: rgba(var(--ion-color-light-rgb), 0.5);
  border-radius: 12px;
  padding: 8px;
}

.submit-button {
  --border-radius: 12px;
  height: 50px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (min-width: 768px) {
  .upload-container {
    padding: 32px;
  }

  .form-item {
    margin-bottom: 32px;
  }
}
</style>