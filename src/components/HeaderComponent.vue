<template>
  <ion-header>
    <ion-toolbar class="header-toolbar">
      <ion-title class="header-title">VideosApp Harvey</ion-title>

      <ion-buttons slot="end" class="desktop-menu">
        <ion-button router-link="/">Home</ion-button>
        <ion-button router-link="/login" v-if="!isAuthenticated">Login</ion-button>
        <template v-else>
          <ion-button router-link="/profile">Perfil</ion-button>
          <ion-button @click="logout">Tancar Sessió</ion-button>
        </template>
      </ion-buttons>

      <ion-buttons slot="end" class="mobile-menu">
        <ion-button @click="toggleMenu">
          <ion-icon :icon="menuOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>

    <div v-if="isMenuOpen" class="mobile-dropdown">
      <ion-button router-link="/" @click="toggleMenu">Home</ion-button>
      <ion-button router-link="/login" v-if="!isAuthenticated" @click="toggleMenu">Login</ion-button>
      <template v-else>
        <ion-button router-link="/profile" @click="toggleMenu">Perfil</ion-button>
        <ion-button @click="handleLogout">Tancar Sessió</ion-button>
      </template>
    </div>
  </ion-header>
</template>

<script setup>
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { menuOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();
const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
    isMenuOpen.value = false;
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style scoped>
.header-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-title {
  flex-grow: 1;
  text-align: center;
}

.desktop-menu {
  display: flex;
}

.mobile-menu {
  display: none;
}

.mobile-dropdown {
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 16px;
  top: 56px;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 8px;
  z-index: 1000;
}

@media (max-width: 768px) {
  .desktop-menu {
    display: none;
  }
  .mobile-menu {
    display: flex;
  }
}
</style>