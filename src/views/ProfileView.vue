<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useAuth, type ProfileData } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { validatePassword, validateProfile } from '@/utils/validation'
import ProfileFields from '@/components/ProfileFields.vue'

const { currentUser, updateProfile } = useAuth()
const { show } = useToast()

// Editable copy of the user's data; saved only when the user clicks "Sačuvaj"
function copyProfile(): ProfileData {
    const u = currentUser.value!
    return {
        firstName: u.firstName, lastName: u.lastName, email: u.email,
        phone: u.phone, address: u.address, favoriteCategories: [...u.favoriteCategories],
    }
}

const profile = ref<ProfileData>(copyProfile())
const account = reactive({ username: currentUser.value!.username, password: '', confirm: '' })

const submitted = ref(false)
const errors = computed(() => ({
    ...validateProfile(profile.value),
    // The password is optional here: only checked when the user types a new one
    ...(account.password || account.confirm ? validatePassword(account.password, account.confirm) : {}),
    ...(account.username.trim() ? {} : { username: 'Unesite korisničko ime.' }),
}))
const shown = computed((): Record<string, string | undefined> => (submitted.value ? errors.value : {}))

function onSave() {
    submitted.value = true
    if (Object.keys(errors.value).length) return
    updateProfile({
        ...profile.value,
        username: account.username.trim(),
        ...(account.password ? { password: account.password } : {}),
    })
    account.password = ''
    account.confirm = ''
    submitted.value = false
    show({ title: 'Profil je sačuvan' })
}

function onCancel() {
    profile.value = copyProfile()
    Object.assign(account, { username: currentUser.value!.username, password: '', confirm: '' })
    submitted.value = false
}
</script>

<template>
    <div class="row justify-content-center my-4">
        <div class="col-lg-8 col-xl-7">
            <div class="card shadow-sm">
                <div class="card-body p-4">
                    <h1 class="h3 mb-1">Moj profil</h1>
                    <p class="text-body-secondary mb-4">Ovde možete izmeniti svoje podatke.</p>

                    <form @submit.prevent="onSave">
                        <ProfileFields v-model="profile" :errors="shown" />

                        <h2 class="h6 fw-semibold mt-4">Podaci za prijavu</h2>
                        <div class="row g-3">
                            <div class="col-12">
                                <label for="pr-username" class="form-label">Korisničko ime</label>
                                <input id="pr-username" v-model="account.username" type="text" class="form-control"
                                    :class="{ 'is-invalid': shown.username }" />
                                <div class="invalid-feedback">{{ shown.username }}</div>
                            </div>
                            <div class="col-sm-6">
                                <label for="pr-password" class="form-label">Nova lozinka</label>
                                <input id="pr-password" v-model="account.password" type="password" class="form-control"
                                    :class="{ 'is-invalid': shown.password }" placeholder="Ostavite prazno ako je ne menjate" />
                                <div class="invalid-feedback">{{ shown.password }}</div>
                            </div>
                            <div class="col-sm-6">
                                <label for="pr-confirm" class="form-label">Ponovite novu lozinku</label>
                                <input id="pr-confirm" v-model="account.confirm" type="password" class="form-control"
                                    :class="{ 'is-invalid': shown.confirm }" />
                                <div class="invalid-feedback">{{ shown.confirm }}</div>
                            </div>
                        </div>

                        <div class="d-flex gap-2 mt-4">
                            <button type="submit" class="btn btn-primary">Sačuvaj</button>
                            <button type="button" class="btn btn-outline-secondary" @click="onCancel">Poništi</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
