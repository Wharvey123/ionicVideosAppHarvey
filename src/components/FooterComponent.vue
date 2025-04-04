<template>
  <ion-footer class="app-footer">
    <ion-toolbar>
      <div class="footer-content">
        <div class="footer-copyright">
          &copy; {{ new Date().getFullYear() }} VideosApp - Desenvolupat per Harvey
        </div>
      </div>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup>
import { IonFooter, IonToolbar } from '@ionic/vue'
</script>

<style scoped>
.app-footer {
  --background: #f8f9fa;
  --border-color: #e0e0e0;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  font-size: 0.8rem;
  color: #5f6368;
}

.footer-copyright {
  opacity: 0.8;
}
</style>