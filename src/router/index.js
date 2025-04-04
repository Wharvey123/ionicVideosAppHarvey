import { createRouter, createWebHistory } from '@ionic/vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', redirect: '/home' },
        { path: '/home',  component: () => import('@/views/HomeView.vue')},
        { path: '/profile',  component: () => import('@/views/ProfileView.vue'),  meta: { requiresAuth: true }},
        { path: '/login',  component: () => import('@/views/AuthView.vue'),  meta: { requiresGuest: true }},
        { path: '/create',  component: () => import('@/views/CreateView.vue'),  meta: { requiresAuth: true }},
        { path: '/multimedia/:id',  component: () => import('@/views/ShowView.vue')},
        { path: '/delete/:id',  component: () => import('@/views/DeleteView.vue'),  meta: { requiresAuth: true }},
        { path: '/edit/:id',  component: () => import('@/views/EditView.vue'),  meta: { requiresAuth: true }}
    ]
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Initialize the store if needed
    if (!authStore.isInitialized) {
        await authStore.initialize()
    }

    // Check if route requires authentication
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login')
    }
    // Check if route requires guest (non-authenticated)
    else if (to.meta.requiresGuest && authStore.isAuthenticated) {
        next('/')
    }
    // Otherwise proceed
    else {
        next()
    }
})

export default router