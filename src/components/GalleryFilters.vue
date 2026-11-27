<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Plant } from '@/hooks/usePlants'
import { SEASONS } from '@/hooks/useSeason'
import { LIST_FILTERS, useGalleryFilters, type ListFilterKey } from '@/hooks/useGalleryFilters'

const props = defineProps<{ plants: Plant[] }>()

const { filters, activeCount, update, toggle, clearAll } = useGalleryFilters()

// ----- Option lists (built from the data, with counts) -----
const GROUPS: { key: ListFilterKey; title: string; icon: string }[] = [
    { key: 'category', title: 'Kategorija', icon: 'fa-solid fa-layer-group' },
    { key: 'type', title: 'Tip biljke', icon: 'fa-solid fa-seedling' },
    { key: 'season', title: 'Sezona', icon: 'fa-solid fa-calendar-days' },
    { key: 'climate', title: 'Podneblje', icon: 'fa-solid fa-earth-europe' },
    { key: 'light', title: 'Svetlost', icon: 'fa-solid fa-sun' },
    { key: 'use', title: 'Namena', icon: 'fa-solid fa-house-chimney' },
    { key: 'audience', title: 'Ciljna grupa', icon: 'fa-solid fa-user-group' },
]

function labelFor(key: ListFilterKey, value: string, p: Plant): string {
    if (key === 'category') return p.category
    if (key === 'season') return SEASONS[Number(value)]?.label ?? p.season
    return value
}

const options = computed(() => {
    const out = {} as Record<ListFilterKey, { value: string; label: string; count: number }[]>
    for (const key of Object.keys(LIST_FILTERS) as ListFilterKey[]) {
        const map = new Map<string, { value: string; label: string; count: number }>()
        for (const p of props.plants) {
            const value = LIST_FILTERS[key](p)
            const o = map.get(value)
            if (o) o.count++
            else map.set(value, { value, label: labelFor(key, value, p), count: 1 })
        }
        out[key] = [...map.values()].sort((a, b) => a.label.localeCompare(b.label, 'sr'))
    }
    return out
})

const priceBounds = computed(() => {
    const prices = props.plants.map(p => p.price)
    return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: 0 }
})

const dateBounds = computed(() => {
    const dates = props.plants.map(p => p.productionDate).sort()
    return { min: dates[0] ?? '', max: dates[dates.length - 1] ?? '' }
})

// Sections with an active filter start expanded
const initiallyOpen = (key: ListFilterKey) => key === 'category' || filters.value.lists[key].length > 0

// ----- Keyword (debounced) -----
const keyword = ref(filters.value.q)
watch(() => filters.value.q, q => { if (q !== keyword.value.trim()) keyword.value = q })

let timer: ReturnType<typeof setTimeout> | undefined
watch(keyword, v => {
    clearTimeout(timer)
    timer = setTimeout(() => update({ q: v.trim() }), 300)
})

// ----- Price (committed on change/blur, not on every keystroke) -----
const priceMin = ref<string>(filters.value.priceMin?.toString() ?? '')
const priceMax = ref<string>(filters.value.priceMax?.toString() ?? '')
watch(() => filters.value.priceMin, v => { priceMin.value = v?.toString() ?? '' })
watch(() => filters.value.priceMax, v => { priceMax.value = v?.toString() ?? '' })

const RATING_OPTIONS = [4, 3, 2]
</script>

<template>
    <div class="gallery-filters">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h5 mb-0">Filteri</h2>
            <button v-if="activeCount" type="button" class="btn btn-link btn-sm p-0" @click="clearAll">
                Obriši sve ({{ activeCount }})
            </button>
        </div>

        <!-- Keyword -->
        <div class="mb-3">
            <label for="filter-keyword" class="form-label fw-semibold small">Pretraga</label>
            <div class="input-group">
                <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
                <input id="filter-keyword" v-model="keyword" type="search" class="form-control"
                    placeholder="npr. monstera, sunce…" />
            </div>
        </div>

        <!-- Price -->
        <details class="filter-section" open>
            <summary><i class="fa-solid fa-tag"></i><span class="title">Cena (RSD)</span>
                <i class="fa-solid fa-chevron-down chevron"></i></summary>
            <div class="d-flex gap-2 align-items-center">
                <input v-model="priceMin" type="number" class="form-control form-control-sm" min="0"
                    :placeholder="String(priceBounds.min)" aria-label="Minimalna cena"
                    @change="update({ pmin: priceMin })" />
                <span class="text-body-secondary">–</span>
                <input v-model="priceMax" type="number" class="form-control form-control-sm" min="0"
                    :placeholder="String(priceBounds.max)" aria-label="Maksimalna cena"
                    @change="update({ pmax: priceMax })" />
            </div>
        </details>

        <!-- Rating -->
        <details class="filter-section" open>
            <summary><i class="fa-solid fa-star"></i><span class="title">Ocena kupaca</span>
                <i class="fa-solid fa-chevron-down chevron"></i></summary>
            <div class="form-check">
                <input id="rating-any" class="form-check-input" type="radio" name="rating"
                    :checked="filters.minRating == null" @change="update({ rating: null })" />
                <label class="form-check-label" for="rating-any">Bilo koja ocena</label>
            </div>
            <div v-for="r in RATING_OPTIONS" :key="r" class="form-check">
                <input :id="`rating-${r}`" class="form-check-input" type="radio" name="rating"
                    :checked="filters.minRating === r" @change="update({ rating: r })" />
                <label class="form-check-label" :for="`rating-${r}`">
                    <span class="stars" aria-hidden="true">
                        <i v-for="i in 5" :key="i" :class="i <= r ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
                    </span>
                    <span class="ms-1">{{ r }} i više</span>
                </label>
            </div>
        </details>

        <!-- Multi-select groups -->
        <details v-for="g in GROUPS" :key="g.key" class="filter-section" :open="initiallyOpen(g.key)">
            <summary>
                <i :class="g.icon"></i><span class="title">{{ g.title }}</span>
                <span v-if="filters.lists[g.key].length" class="badge rounded-pill text-bg-primary">
                    {{ filters.lists[g.key].length }}
                </span>
                <i class="fa-solid fa-chevron-down chevron"></i>
            </summary>
            <div v-for="o in options[g.key]" :key="o.value" class="form-check">
                <input :id="`f-${g.key}-${o.value}`" class="form-check-input" type="checkbox"
                    :checked="filters.lists[g.key].includes(o.value)" @change="toggle(g.key, o.value)" />
                <label class="form-check-label d-flex w-100" :for="`f-${g.key}-${o.value}`">
                    {{ o.label }}
                    <span class="ms-auto text-body-secondary small">{{ o.count }}</span>
                </label>
            </div>
        </details>

        <!-- Production date -->
        <details class="filter-section" :open="!!(filters.dateFrom || filters.dateTo)">
            <summary><i class="fa-solid fa-calendar-check"></i><span class="title">Datum proizvodnje</span>
                <i class="fa-solid fa-chevron-down chevron"></i></summary>
            <label for="date-from" class="form-label small mb-1">Od</label>
            <input id="date-from" type="date" class="form-control form-control-sm mb-2" :value="filters.dateFrom"
                :min="dateBounds.min" :max="dateBounds.max"
                @change="update({ from: ($event.target as HTMLInputElement).value })" />
            <label for="date-to" class="form-label small mb-1">Do</label>
            <input id="date-to" type="date" class="form-control form-control-sm" :value="filters.dateTo"
                :min="dateBounds.min" :max="dateBounds.max"
                @change="update({ to: ($event.target as HTMLInputElement).value })" />
        </details>
    </div>
</template>

<style scoped>
.filter-section {
    border-top: 1px solid var(--bs-border-color);
    padding: 0.75rem 0;
}

.filter-section summary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    list-style: none;
}

.filter-section summary::-webkit-details-marker {
    display: none;
}

.filter-section summary .title {
    flex-grow: 1;
}

.filter-section summary i {
    color: var(--bs-primary);
    width: 1rem;
    text-align: center;
}

.filter-section summary .chevron {
    color: var(--bs-secondary-color);
    font-size: 0.7rem;
    transition: transform 0.2s;
}

.filter-section[open] summary {
    margin-bottom: 0.5rem;
}

.filter-section[open] summary .chevron {
    transform: rotate(180deg);
}

.stars {
    color: #e0a526;
    font-size: 0.8rem;
}
</style>
