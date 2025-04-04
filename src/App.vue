<template>
  <ion-app>
    <HeaderComponent />
    <ion-content class="main-content">
      <ion-router-outlet />
    </ion-content>
    <FooterComponent />
  </ion-app>
</template>

<script setup>
import { IonApp, IonRouterOutlet, IonContent } from '@ionic/vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import FooterComponent from '@/components/FooterComponent.vue'
</script>

<style>
:root {
  --header-height: 56px;
  --footer-height: 56px;
}

ion-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-top: var(--header-height);
  margin-bottom: var(--footer-height);
}

/* Eliminem el position:fixed del header */
ion-header {
  position: static;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>