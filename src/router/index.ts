import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/hooks/useAuth'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import GalleryView from '../views/GalleryView.vue'
import PlantDetailView from '../views/PlantDetailView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean // logged-out users are sent to login, then back
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Početna' }
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { title: 'O nama' }
    }, {
      path: '/gallery',
      name: 'gallery',
      component: GalleryView,
      meta: { title: 'Galerija' }
    },
    {
      path: '/plant/:id',
      name: 'plant',
      component: PlantDetailView,
      props: true,
      meta: { title: 'Biljka' }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: 'Prijava' }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { title: 'Registracija' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { title: 'Moj profil', requiresAuth: true }
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition // back/forward keeps position
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    if (to.name === from.name && to.name === 'gallery') return false // changing filters: stay put
    return { top: 0 }
  },
})

router.beforeEach(to => {
  const { isLoggedIn } = useAuth()
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

router.afterEach(to => {
  document.title = to.meta.title ? `${to.meta.title} · Vivarium` : 'Vivarium'
})

export default router
