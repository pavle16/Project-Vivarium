<script setup lang="ts">
import type { ProfileData } from '@/hooks/useAuth'
import { CATEGORIES } from '@/utils/categories'

// Profile fields shared by the registration and the profile page.

const form = defineModel<ProfileData>({ required: true })
defineProps<{ errors: Partial<Record<keyof ProfileData, string>> }>()

const FIELDS: { key: Exclude<keyof ProfileData, 'favoriteCategories'>; label: string; type: string; col: string }[] = [
    { key: 'firstName', label: 'Ime', type: 'text', col: 'col-sm-6' },
    { key: 'lastName', label: 'Prezime', type: 'text', col: 'col-sm-6' },
    { key: 'email', label: 'E-pošta', type: 'email', col: 'col-sm-6' },
    { key: 'phone', label: 'Telefon', type: 'tel', col: 'col-sm-6' },
    { key: 'address', label: 'Adresa', type: 'text', col: 'col-12' },
]

function toggleFavorite(id: number) {
    const list = form.value.favoriteCategories
    form.value.favoriteCategories = list.includes(id) ? list.filter(x => x !== id) : [...list, id]
}
</script>

<template>
    <div class="row g-3">
        <div v-for="f in FIELDS" :key="f.key" :class="f.col">
            <label :for="`pf-${f.key}`" class="form-label">{{ f.label }}</label>
            <input :id="`pf-${f.key}`" v-model="form[f.key]" :type="f.type" class="form-control"
                :class="{ 'is-invalid': errors[f.key] }" />
            <div class="invalid-feedback">{{ errors[f.key] }}</div>
        </div>

        <div class="col-12">
            <label class="form-label d-block">Omiljene vrste biljaka</label>
            <div class="d-flex flex-wrap gap-2">
                <template v-for="c in CATEGORIES" :key="c.id">
                    <input :id="`pf-fav-${c.id}`" type="checkbox" class="btn-check"
                        :checked="form.favoriteCategories.includes(c.id)" @change="toggleFavorite(c.id)" />
                    <label class="btn btn-outline-primary btn-sm rounded-pill" :for="`pf-fav-${c.id}`">
                        <i :class="c.icon" class="me-1"></i>{{ c.name }}
                    </label>
                </template>
            </div>
            <div v-if="errors.favoriteCategories" class="text-danger small mt-2">{{ errors.favoriteCategories }}</div>
        </div>
    </div>
</template>
