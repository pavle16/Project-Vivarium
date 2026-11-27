<script setup lang="ts">
import { computed } from 'vue'
import { usePlants } from '@/hooks/usePlants'
import { SEASONS } from '@/hooks/useSeason'
import { SORT_OPTIONS, useGalleryFilters, type ListFilterKey } from '@/hooks/useGalleryFilters'
import { plural } from '@/utils/format'
import PlantCard from '@/components/PlantCard.vue'
import GalleryFilters from '@/components/GalleryFilters.vue'

const { plants, loading, error, fetchPlants } = usePlants()
const { filters, activeCount, update, removeFromList, clearAll, apply } =
    useGalleryFilters()

const results = computed(() => apply(plants.value))

const formatDate = (d: string) => new Date(d).toLocaleDateString('sr-RS')

// One removable chip per active filter value
const chips = computed(() => {
    const f = filters.value
    const out: { id: string; label: string; remove: () => void }[] = []

    if (f.q) {
        const where = f.searchIn === 'name' ? ' u nazivu' : f.searchIn === 'desc' ? ' u opisu' : ''
        out.push({ id: 'q', label: `"${f.q}"${where}`, remove: () => update({ q: null, in: null }) })
    }
    for (const [key, values] of Object.entries(f.lists) as [ListFilterKey, string[]][]) {
        for (const v of values) {
            let label = v
            if (key === 'category') label = plants.value.find(p => String(p.categoryId) === v)?.category ?? 'Kategorija'
            if (key === 'season') label = SEASONS[Number(v)]?.label ?? 'Sezona'
            out.push({ id: `${key}-${v}`, label, remove: () => removeFromList(key, v) })
        }
    }
    if (f.priceMin != null || f.priceMax != null) {
        const label = f.priceMin != null && f.priceMax != null ? `${f.priceMin}–${f.priceMax} RSD`
            : f.priceMin != null ? `Od ${f.priceMin} RSD` : `Do ${f.priceMax} RSD`
        out.push({
            id: 'price', label,
            remove: () => update({ pmin: null, pmax: null }),
        })
    }
    if (f.dateFrom || f.dateTo) {
        const label = f.dateFrom && f.dateTo ? `Proizvedeno ${formatDate(f.dateFrom)} – ${formatDate(f.dateTo)}`
            : f.dateFrom ? `Proizvedeno od ${formatDate(f.dateFrom)}` : `Proizvedeno do ${formatDate(f.dateTo)}`
        out.push({
            id: 'date', label,
            remove: () => update({ from: null, to: null }),
        })
    }
    if (f.minRating != null) {
        out.push({ id: 'rating', label: `${f.minRating}★ i više`, remove: () => update({ rating: null }) })
    }
    return out
})
</script>

<template>
    <div class="mt-4">
        <div v-if="loading" class="d-flex align-items-center gap-2">
            <div class="spinner-border" role="status"></div>
            <span>Učitavanje biljaka...</span>
        </div>

        <div v-else-if="error" class="alert alert-danger d-flex justify-content-between align-items-center">
            <span>Biljke nije moguće učitati. Proverite internet vezu i pokušajte ponovo.</span>
            <button class="btn btn-outline-danger btn-sm" type="button" @click="fetchPlants()">Pokušaj ponovo</button>
        </div>

        <div v-else class="row g-4">
            <!-- Filters: sidebar on large screens, slide-in panel on small ones -->
            <aside class="col-lg-3">
                <div id="filtersPanel" class="offcanvas-lg offcanvas-start filters-sticky" tabindex="-1"
                    aria-labelledby="filtersPanelLabel">
                    <div class="offcanvas-header border-bottom">
                        <h2 id="filtersPanelLabel" class="offcanvas-title h5">Filteri</h2>
                        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#filtersPanel"
                            aria-label="Zatvori filtere"></button>
                    </div>
                    <div class="offcanvas-body d-block">
                        <GalleryFilters :plants="plants" />
                    </div>
                    <div class="p-3 border-top d-lg-none">
                        <button type="button" class="btn btn-primary w-100" data-bs-dismiss="offcanvas"
                            data-bs-target="#filtersPanel">
                            Prikaži {{ results.length }} {{ plural(results.length, 'biljku', 'biljke', 'biljaka') }}
                        </button>
                    </div>
                </div>
            </aside>

            <section class="col-lg-9">
                <!-- Toolbar -->
                <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                    <h1 class="h3 mb-0 me-auto">
                        Galerija
                        <small class="text-body-secondary fs-6 fw-normal ms-1">
                            prikazano {{ results.length }} od {{ plants.length }}
                        </small>
                    </h1>

                    <button type="button" class="btn btn-outline-primary d-lg-none" data-bs-toggle="offcanvas"
                        data-bs-target="#filtersPanel" aria-controls="filtersPanel">
                        <i class="fa-solid fa-sliders me-1"></i> Filteri
                        <span v-if="activeCount" class="badge rounded-pill text-bg-primary ms-1">{{ activeCount }}</span>
                    </button>

                    <div class="d-flex align-items-center gap-2">
                        <label for="sort-select" class="text-body-secondary small text-nowrap">Sortiraj po</label>
                        <select id="sort-select" class="form-select form-select-sm w-auto" :value="filters.sort"
                            @change="update({ sort: ($event.target as HTMLSelectElement).value })">
                            <option v-for="o in SORT_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
                        </select>
                    </div>
                </div>

                <!-- Active filter chips -->
                <div v-if="chips.length" class="d-flex flex-wrap align-items-center gap-2 mb-3">
                    <span v-for="c in chips" :key="c.id"
                        class="badge rounded-pill text-bg-primary d-inline-flex align-items-center gap-2 py-2 px-3">
                        {{ c.label }}
                        <button type="button" class="btn-close btn-close-white" style="font-size: .55rem"
                            :aria-label="`Ukloni filter ${c.label}`" @click="c.remove()"></button>
                    </span>
                    <button v-if="chips.length > 1" type="button" class="btn btn-link btn-sm" @click="clearAll">
                        Obriši sve
                    </button>
                </div>

                <!-- Results -->
                <div v-if="results.length === 0" class="text-center py-5">
                    <i class="fa-solid fa-seedling fs-1 text-body-secondary mb-3"></i>
                    <p class="fs-5 mb-2">Nijedna biljka ne odgovara izabranim filterima.</p>
                    <p class="text-body-secondary">Pokušajte da uklonite neki filter ili krenite iz početka.</p>
                    <button class="btn btn-outline-primary" type="button" @click="clearAll">Obriši sve filtere</button>
                </div>

                <div v-else class="row g-3">
                    <div class="col-12 col-sm-6 col-xl-4" v-for="p in results" :key="p.id">
                        <PlantCard :plant="p" />
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
@media (min-width: 992px) {
    .filters-sticky {
        position: sticky;
        top: 1rem;
        max-height: calc(100vh - 2rem);
        overflow-y: auto;
        padding-right: 0.5rem;
    }
}
</style>
