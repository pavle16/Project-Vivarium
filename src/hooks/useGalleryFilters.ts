import { computed } from 'vue'
import { useRoute, useRouter, type LocationQuery } from 'vue-router'
import type { Plant } from './usePlants'
import { useReviews } from './useReviews'

// filteri se cuvaju u URL da bi ostali nakon refresha

export const SORT_OPTIONS = [
    { value: 'name-asc', label: 'Naziv: A → Ž' },
    { value: 'name-desc', label: 'Naziv: Ž → A' },
    { value: 'price-asc', label: 'Cena: od najniže' },
    { value: 'price-desc', label: 'Cena: od najviše' },
    { value: 'date-desc', label: 'Datum proizvodnje: najnovije' },
    { value: 'date-asc', label: 'Datum proizvodnje: najstarije' },
    { value: 'rating-desc', label: 'Ocena: najbolje prvo' },
    { value: 'reviews-desc', label: 'Najviše recenzija' },
] as const

export type SortValue = (typeof SORT_OPTIONS)[number]['value']
export const DEFAULT_SORT: SortValue = 'name-asc'

// multi select filteri
export const LIST_FILTERS = {
    category: (p: Plant) => String(p.categoryId),
    type: (p: Plant) => p.plantType,
    season: (p: Plant) => String(p.seasonId),
    climate: (p: Plant) => p.climate,
    light: (p: Plant) => p.lightRequirement,
    use: (p: Plant) => p.intendedUse,
    audience: (p: Plant) => p.targetAudience,
} as const

export type ListFilterKey = keyof typeof LIST_FILTERS

const FILTER_KEYS = ['q',...Object.keys(LIST_FILTERS), 'from', 'to', 'pmin', 'pmax', 'rating'] as const


// string sort
function str(query: LocationQuery, key: string): string {
    const v = query[key]
    return typeof v === 'string' ? v : ''
}

// number sort
function num(query: LocationQuery, key: string): number | null {
    const s = str(query, key)
    const n = Number(s)
    return s !== '' && Number.isFinite(n) ? n : null
}

function list(query: LocationQuery, key: string): string[] {
    const s = str(query, key)
    return s ? s.split(',').filter(Boolean) : []
}

export function useGalleryFilters() {
    const route = useRoute()
    const router = useRouter()
    const { getRating } = useReviews()

    const filters = computed(() => {
        const q = route.query
        const sort = str(q, 'sort')
        return {
            q: str(q, 'q').trim(),
            lists: Object.fromEntries(
                Object.keys(LIST_FILTERS).map(k => [k, list(q, k)])
            ) as Record<ListFilterKey, string[]>,
            dateFrom: str(q, 'from'),
            dateTo: str(q, 'to'),
            priceMin: num(q, 'pmin'),
            priceMax: num(q, 'pmax'),
            minRating: num(q, 'rating'),
            sort: (SORT_OPTIONS.some(o => o.value === sort) ? sort : DEFAULT_SORT) as SortValue,
        }
    })

    // patchovanje querry-ja prazne vrednosti su uklonjene
    function update(patch: Record<string, string | number | null | undefined>) {
        const next: Record<string, string> = {}
        for (const [k, v] of Object.entries(route.query)) {
            if (typeof v === 'string') next[k] = v
        }
        for (const [k, v] of Object.entries(patch)) {
            if (v == null || v === '') delete next[k]
            else next[k] = String(v)
        }
        if (next.sort === DEFAULT_SORT) delete next.sort
        router.replace({ name: 'gallery', query: next })
    }

    // checkbox klik
    function toggle(key: ListFilterKey, value: string) {
        const current = filters.value.lists[key]
        const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
        update({ [key]: next.join(',') })
    }

    function removeFromList(key: ListFilterKey, value: string) {
        update({ [key]: filters.value.lists[key].filter(v => v !== value).join(',') })
    }

    // cisti filtere, ne menja sort
    function clearAll() {
        update(Object.fromEntries(FILTER_KEYS.map(k => [k, null])))
    }

    const activeCount = computed(() => {
        const f = filters.value
        return (f.q ? 1 : 0)
            + Object.values(f.lists).reduce((s, l) => s + l.length, 0)
            + (f.dateFrom ? 1 : 0) + (f.dateTo ? 1 : 0)
            + (f.priceMin != null ? 1 : 0) + (f.priceMax != null ? 1 : 0)
            + (f.minRating != null ? 1 : 0)
    })

    function apply(plants: Plant[]): Plant[] {
        const f = filters.value
        const q = f.q.toLowerCase()

        const result = plants.filter(p => {
            if (q) {
                const fields = [p.name, p.latinName, p.description, p.plantingInstructions, p.careInstructions]
                if (!fields.some(x => x?.toLowerCase().includes(q))) return false
            }
            // prolazi kroz listu filtera 
            for (const [key, read] of Object.entries(LIST_FILTERS)) {
                const selected = f.lists[key as ListFilterKey]
                if (selected.length && !selected.includes(read(p))) return false
            }
            if (f.dateFrom && p.productionDate < f.dateFrom) return false
            if (f.dateTo && p.productionDate > f.dateTo) return false
            if (f.priceMin != null && p.price < f.priceMin) return false
            if (f.priceMax != null && p.price > f.priceMax) return false
            if (f.minRating != null) {
                const r = getRating(p.id)
                if (r.count === 0 || r.average < f.minRating) return false
            }
            return true
        })

        const [field, dir] = f.sort.split('-') as [string, 'asc' | 'desc']
        const sign = dir === 'asc' ? 1 : -1
        return result.sort((a, b) => {
            switch (field) {
                case 'price': return sign * (a.price - b.price)
                case 'date': return sign * a.productionDate.localeCompare(b.productionDate)
                case 'rating': {
                    const ra = getRating(a.id), rb = getRating(b.id)
                    return sign * (ra.average - rb.average) || rb.count - ra.count
                }
                case 'reviews': return sign * (getRating(a.id).count - getRating(b.id).count)
                default: return sign * a.name.localeCompare(b.name, 'sr')
            }
        })
    }

    return {
        filters, activeCount,
        update, toggle, removeFromList, clearAll, apply,
    }
}
