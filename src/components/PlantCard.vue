<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Plant } from '@/hooks/usePlants'
import { useReviews } from '@/hooks/useReviews'
import { useReservation } from '@/hooks/useReservation'
import { formatPrice } from '@/utils/format'
import StarRating from './StarRating.vue'

const props = defineProps<{ plant: Plant }>()

const { getRating } = useReviews()
const { reserve } = useReservation()
const rating = computed(() => getRating(props.plant.id))
const detailsLink = computed(() => ({ name: 'plant', params: { id: props.plant.id } }))

function getStock(stock: number) {
  if (stock <= 0) {
    return "Nema na stanju"
  } else {
    return "Na stanju: " + stock
  }
}
</script>

<template>
  <div class="card h-100 plant-card">
    <RouterLink :to="detailsLink" tabindex="-1" aria-hidden="true">
      <img :src="plant.imageUrl" class="card-img-top" :alt="plant.imageAlt || plant.name">
    </RouterLink>
    <div class="card-body d-flex flex-column">
      <span class="badge rounded-pill text-bg-light border align-self-start mb-2">{{ plant.category }}</span>
      <h5 class="card-title mb-1">
        <RouterLink :to="detailsLink" class="text-reset text-decoration-none plant-title">{{ plant.name }}</RouterLink>
      </h5>
      <div class="mb-2">
        <StarRating :value="rating.average" :count="rating.count" />
      </div>
      <p class="fs-5 fw-bold mb-2">{{ formatPrice(plant.price, plant.currency) }}</p>
      <p class="card-text clamp-3">{{ plant.description }}</p>
      <!-- Footer: stock on its own line, then the two buttons (never wrapping) -->
      <div class="mt-auto">
        <p class="small mb-2" :class="plant.stockQuantity > 0 ? 'text-success' : 'text-danger'">
          <i :class="plant.stockQuantity > 0 ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'" class="me-1"></i>{{ getStock(plant.stockQuantity) }}
        </p>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm flex-grow-1 text-nowrap" type="button"
            :disabled="plant.stockQuantity <= 0" @click="reserve(plant)">
            <i class="fa-solid fa-basket-shopping me-1"></i>Dodaj u korpu
          </button>
          <RouterLink :to="detailsLink" class="btn btn-outline-primary btn-sm text-nowrap">Detalji</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plant-card {
  transition: box-shadow 0.2s, transform 0.2s;
}

.plant-card:hover {
  box-shadow: var(--bs-box-shadow);
  transform: translateY(-2px);
}

.plant-title:hover {
  color: var(--bs-primary) !important;
}
</style>
