<template>
  <ion-page>
    <ion-content class="edit-content">
      <form @submit.prevent="submitForm">
        <ion-item>
          <ion-input
              label="Títol"
              label-placement="stacked"
              v-model="form.title"
              required
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-textarea
              label="Descripció"
              label-placement="stacked"
              v-model="form.description"
              rows="4"
              auto-grow
          ></ion-textarea>
        </ion-item>

        <div class="current-media">
          <h3>Contingut actual:</h3>
          <video v-if="currentType === 'video'" :src="currentMediaPath" controls class="preview-media"></video>
          <img v-else :src="currentMediaPath" class="preview-media" />
        </div>

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

        <ion-item v-if="errorMessage">
          <ion-text color="danger">{{ errorMessage }}</ion-text>
        </ion-item>

        <div class="form-actions">
          <ion-button expand="block" type="submit" :disabled="loading || isUploading">
            <ion-spinner v-if="loading || isUploading" name="crescent"></ion-spinner>
            <span v-else>Publicar</span>
          </ion-button>
          <ion-button expand="block" fill="clear" color="medium" @click="cancelEdit" :disabled="loading || isUploading">
            Cancel·lar
          </ion-button>
        </div>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonItem, IonInput, IonTextarea, IonText, IonButton, IonSpinner } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '@/plugins/axios';
import vueFilePond from 'vue-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import 'filepond/dist/filepond.min.css';

const FilePond = vueFilePond(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);
const route = useRoute();
const router = useRouter();
const mediaId = route.params.id;
const form = ref({ title: '', description: '' });
const currentType = ref('');
const currentMediaPath = ref('');
const isUploading = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const pond = ref(null);
const hasNewFile = ref(false);

const serverConfig = {
  url: 'http://localhost:8000/api',
  process: {
    url: `/multimedia/${mediaId}`,
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    ondata: (formData) => {
      formData.append('title', form.value.title);
      formData.append('description', form.value.description || '');
      formData.append('_method', 'PUT');
      return formData;
    },
    onerror: (response) => {
      isUploading.value = false;
      loading.value = false;
      errorMessage.value = 'Error en pujar el fitxer';
      console.error('Upload error:', response);
      return response;
    }
  }
};

onMounted(async () => {
  try {
    const { data } = await axios.get(`/multimedia/${mediaId}`);
    form.value.title = data.data.title;
    form.value.description = data.data.description;
    currentType.value = data.data.type;
    currentMediaPath.value = data.data.path;
  } catch (error) {
    console.error('Error carregant el contingut:', error);
  }
});

const cancelEdit = () => {
  router.push(`/multimedia/${mediaId}`);
};

const handleFileAdd = () => {
  hasNewFile.value = true;
};

const handleFileSuccess = async (error, file) => {
  isUploading.value = false;
  loading.value = false;

  if (!error) {
    console.log('File uploaded successfully:', file);
    // Forçar recàrrega per veure els canvis
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.href = `/multimedia/${mediaId}`;
  } else {
    errorMessage.value = 'Error en pujar el fitxer';
  }
};

const handleFileError = (error) => {
  isUploading.value = false;
  loading.value = false;
  errorMessage.value = 'Error en pujar el fitxer';
  console.error('File upload error:', error);
};

const submitForm = async () => {
  if (!form.value.title.trim()) {
    errorMessage.value = 'El títol és obligatori';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  const pondInstance = pond.value;

  if (pondInstance && pondInstance.getFiles().length > 0) {
    // Si hi ha fitxer nou, processar-lo
    hasNewFile.value = true;
    pondInstance.processFiles();
  } else {
    // Si no hi ha fitxer nou, enviar només les dades del formulari
    try {
      const response = await axios.put(`/multimedia/${mediaId}`, {
        title: form.value.title,
        description: form.value.description
      });
      console.log('Dades actualitzades:', response.data);
      // Forçar recàrrega per veure els canvis
      window.location.href = `/multimedia/${mediaId}`;
    } catch (error) {
      errorMessage.value = 'Error en actualitzar les dades';
      console.error('Update error:', error);
    } finally {
      loading.value = false;
    }
  }
};
</script>

<style scoped>
.current-media {
  margin: 20px 0;
  text-align: center;
}

.preview-media {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  margin-top: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filepond-container {
  margin: 20px 0;
  border: 2px dashed var(--ion-color-primary);
  border-radius: 12px;
  overflow: hidden;
}

.form-actions {
  padding: 16px;
}

.form-actions ion-button {
  margin-bottom: 8px;
}
</style>