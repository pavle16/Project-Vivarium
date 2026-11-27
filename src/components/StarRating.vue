<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: number; count?: number }>()

// 'full' | 'half' | 'empty' for each of the 5 stars
const stars = computed(() =>
    [1, 2, 3, 4, 5].map(i =>
        props.value >= i - 0.25 ? 'fa-solid fa-star' : props.value >= i - 0.75 ? 'fa-solid fa-star-half-stroke' : 'fa-regular fa-star'
    )
)
</script>

<template>
    <span class="star-rating d-inline-flex align-items-center gap-1"
        :aria-label="count === 0 ? 'Još nema recenzija' : `Ocena ${value.toFixed(1)} od 5`">
        <template v-if="count === 0">
            <span class="text-body-secondary small">Još nema recenzija</span>
        </template>
        <template v-else>
            <span class="stars" aria-hidden="true">
                <i v-for="(cls, i) in stars" :key="i" :class="cls"></i>
            </span>
            <span class="fw-semibold small">{{ value.toFixed(1) }}</span>
            <span v-if="count != null" class="text-body-secondary small">({{ count }})</span>
        </template>
    </span>
</template>

<style scoped>
.stars {
    color: #e0a526;
    font-size: 0.85rem;
    letter-spacing: 1px;
}
</style>
