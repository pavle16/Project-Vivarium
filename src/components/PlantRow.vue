<script setup lang="ts">
import { ref } from 'vue'
import type { Plant } from '@/hooks/usePlants'
import PlantCard from './PlantCard.vue'

defineProps<{ plants: Plant[] }>()

const scroller = ref<HTMLElement | null>(null)

function scroll(direction: 1 | -1) {
    const el = scroller.value
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
}
</script>

<template>
    <div class="plant-row-wrapper position-relative">
        <button type="button" class="btn btn-light border shadow-sm rounded-circle row-nav row-nav-left d-none d-md-flex"
            aria-label="Pomeri levo" @click="scroll(-1)">
            <i class="fa-solid fa-chevron-left"></i>
        </button>

        <div ref="scroller" class="plant-row d-flex gap-3 overflow-auto pb-3">
            <div v-for="p in plants" :key="p.id" class="plant-row-item">
                <PlantCard :plant="p" />
            </div>
        </div>

        <button type="button" class="btn btn-light border shadow-sm rounded-circle row-nav row-nav-right d-none d-md-flex"
            aria-label="Pomeri desno" @click="scroll(1)">
            <i class="fa-solid fa-chevron-right"></i>
        </button>
    </div>
</template>

<style scoped>
.plant-row {
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;
}

.plant-row-item {
    flex: 0 0 auto;
    width: 230px;
    scroll-snap-align: start;
}

.row-nav {
    position: absolute;
    top: 40%;
    z-index: 2;
    width: 2.5rem;
    height: 2.5rem;
    align-items: center;
    justify-content: center;
}

.row-nav-left {
    left: -1.25rem;
}

.row-nav-right {
    right: -1.25rem;
}
</style>
