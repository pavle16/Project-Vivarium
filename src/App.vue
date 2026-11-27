<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { useToast } from './hooks/useToast'
import { useCart } from './hooks/useCart'
import { usePlants } from './hooks/usePlants'
import ToastHost from './components/ToastHost.vue'

const { theme, toggle } = useTheme()
const { currentUser, logout } = useAuth()
const { pendingCount } = useCart()
const { plants } = usePlants()
const { show } = useToast()

const route = useRoute()
const router = useRouter()

// opens a random plant, never the one already on screen
function onSurprise() {
  const others = plants.value.filter(p => String(p.id) !== route.params.id)
  const pick = others[Math.floor(Math.random() * others.length)]
  if (pick) router.push({ name: 'plant', params: { id: pick.id } })
}

function onLogout() {
  logout() //logout tj. ciscenje sesije u auth
  router.push({ name: 'home' }) 
  show({ title: 'Odjavljeni ste', variant: 'info' })
}
const searchText = ref('')

// navbar search, url /gallery?q=searchtext
watch(
  () => route.query.q,
  (q) => { searchText.value = typeof q === 'string' ? q : '' },
  { immediate: true }
)

function onSearch() {
  const q = searchText.value.trim()
  router.push({ name: 'gallery', query: q ? { q } : {} }) // ako je search empty samo /gallery ako nije /gallery?q=searchtext
}
</script>

<template>
<!-- navbar -->
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
            <RouterLink class="nav-link" to="/gallery">Galerija</RouterLink>
          </li>
          <li class="nav-item">
            <button type="button" class="nav-link" :disabled="!plants.length" @click="onSurprise"
              title="Otvori nasumičnu biljku">
              Iznenadi me
            </button>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/about">O nama</RouterLink>
          </li>
        </ul>
        <!-- desna strana korpa, search, nalog, promena teme -->
        <div class="d-flex flex-wrap align-items-center gap-2 mb-2 mb-lg-0">
        <form class="search" role="search" @submit.prevent="onSearch">
          <div class="input-group">
            <input v-model="searchText" class="form-control" type="search" placeholder="Pretraži biljke"
              aria-label="Pretraži biljke" />
            <button class="btn btn-outline-primary" type="submit" aria-label="Pretraži">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </form>

        <!-- korpa, ako je prijavljen -->
        <RouterLink v-if="currentUser" :to="{ name: 'cart' }"
          class="btn btn-outline-secondary position-relative" title="Korpa rezervacija">
          <i class="fa-solid fa-basket-shopping"></i><span class="d-lg-none ms-2">Korpa</span>
          <!-- krug pored korpe koji ukazuje na  nepotvrdjene rezervacije -->
          <span v-if="pendingCount" class="badge rounded-pill text-bg-danger position-absolute top-0 start-100 translate-middle">
            {{ pendingCount }}<span class="visually-hidden"> nepotvrđenih stavki</span>
          </span>
        </RouterLink>

        <!-- account, ako je prijavljen -->
        <div v-if="currentUser" class="dropdown">
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
        <!-- ako korisnik nije prijavljen/registrovan pokazuje opciju za prijavljivanje/registrovanje  -->
        <template v-else>
          <RouterLink class="btn btn-outline-primary text-nowrap" :to="{ name: 'login' }">
            Prijava
          </RouterLink>
          <RouterLink class="btn btn-primary text-nowrap" :to="{ name: 'register' }">
            Registracija
          </RouterLink>
        </template>

        <!-- switch za temu i sliku koja se prikazuje -->
        <button type="button" class="btn btn-outline-secondary" @click="toggle"
          :title="theme === 'light' ? 'Uključi tamnu temu' : 'Uključi svetlu temu'"
          :aria-label="theme === 'light' ? 'Uključi tamnu temu' : 'Uključi svetlu temu'">
          <i :class="theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'"></i>
        </button>
        </div>
      </div>
    </div>
  </nav>
  <div class="container">
    <RouterView />
  </div>
  <ToastHost />
</template>

<style scoped>
/* search za telefone, fiksan za desktop */
.search {
  width: 100%;
}

@media (min-width: 992px) {
  .search {
    width: 16rem;
  }
}
</style>
