<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { useToast } from './hooks/useToast'
import ToastHost from './components/ToastHost.vue'

const { theme, toggle } = useTheme()
const { currentUser, logout } = useAuth()
const { show } = useToast()

const route = useRoute()
const router = useRouter()

function onLogout() {
  logout()
  router.push({ name: 'home' })
  show({ title: 'Odjavljeni ste', variant: 'info' })
}
const searchText = ref('')

// Keep the navbar input in sync with ?q= (e.g. back/forward, or clearing it in the gallery)
watch(
  () => route.query.q,
  (q) => { searchText.value = typeof q === 'string' ? q : '' },
  { immediate: true }
)

function onSearch() {
  const q = searchText.value.trim()
  router.push({ name: 'gallery', query: q ? { q } : {} })
}
</script>

<template>

  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <RouterLink class="navbar-brand" to="/"><i class="fa-solid fa-seedling text-primary me-2"></i>Vivarium</RouterLink>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Prikaži ili sakrij navigaciju">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">Početna</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/gallery">Galerija</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/about">O nama</RouterLink>
          </li>
        </ul>
        <form class="d-flex" role="search" @submit.prevent="onSearch">
          <input v-model="searchText" class="form-control me-2" type="search" placeholder="Pretraži biljke"
            aria-label="Pretraži biljke" />
          <button class="btn btn-outline-primary me-2" type="submit" aria-label="Pretraži">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>
        <div class="form-check form-switch">
          <input class="form-check-input me-2" type="checkbox" role="switch" id="switchCheckDefault" @change="toggle"
            :checked="theme === 'light'">
          <label class="form-check-label" for="switchCheckDefault" title="Svetla / tamna tema"><i class="fa-solid fa-sun"></i></label>
        </div>

        <!-- Account -->
        <div v-if="currentUser" class="dropdown ms-lg-3 mt-2 mt-lg-0">
          <button class="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2" type="button"
            data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fa-solid fa-circle-user"></i>{{ currentUser.firstName }}
          </button>
          <ul class="dropdown-menu dropdown-menu-lg-end">
            <li>
              <RouterLink class="dropdown-item" :to="{ name: 'profile' }">
                <i class="fa-solid fa-user me-2"></i>Moj profil
              </RouterLink>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <button class="dropdown-item text-danger" type="button" @click="onLogout">
                <i class="fa-solid fa-right-from-bracket me-2"></i>Odjavi se
              </button>
            </li>
          </ul>
        </div>
        <div v-else class="d-flex gap-2 ms-lg-3 mt-2 mt-lg-0">
          <RouterLink class="btn btn-outline-primary text-nowrap" :to="{ name: 'login' }">
            Prijava
          </RouterLink>
          <RouterLink class="btn btn-primary text-nowrap" :to="{ name: 'register' }">
            Registracija
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
  <div class="container">
    <RouterView />
  </div>
  <ToastHost />
</template>
