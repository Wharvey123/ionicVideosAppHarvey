<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="confirmation-container">
        <div class="confirmation-card">
          <!-- Icona d'advertència -->
          <ion-icon :icon="warningOutline" color="warning" class="warning-icon"></ion-icon>
          <h2>Confirmar eliminació</h2>
          <p>Estàs segur que vols eliminar aquest contingut? Aquesta acció no es pot desfer.</p>

          <div class="action-buttons">
            <ion-button expand="block" fill="outline" @click="cancelDelete">Cancel·lar</ion-button>
            <ion-button expand="block" color="danger" @click="deleteMedia" :disabled="loading">
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <span v-else>Eliminar</span>
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { warningOutline } from 'ionicons/icons'
import axios from '@/plugins/axios'
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  toastController
} from '@ionic/vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)

const cancelDelete = () => {
  router.go(-1) // Go back
}

const showToast = async (message, color = 'success') => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'top',
    color
  })
  await toast.present()
}

const deleteMedia = async () => {
  loading.value = true;
  try {
    await axios.delete(`/multimedia/${route.params.id}`);
    showToast('Contingut eliminat correctament');

    //Redirigir a home i forçar refresc de dades
    router.push('/home').then(() => {
      // Forçar refresc de la pàgina per assegurar que es veuen els canvis
      window.location.reload();
    });


  } catch (error) {
    console.error('Error eliminant el contingut:', error);
    showToast('Error en eliminar el contingut', 'danger');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.confirmation-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 1rem;
}

.confirmation-card {
  background: var(--ion-color-light);
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.warning-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

h2 {
  color: var(--ion-color-dark);
  margin-bottom: 1rem;
  font-weight: 600;
}

p {
  color: var(--ion-color-medium);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 480px) {
  .confirmation-card {
    padding: 1.5rem;
  }

  .warning-icon {
    font-size: 3rem;
  }
}
</style>