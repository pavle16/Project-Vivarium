<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth, type ProfileData } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { validatePassword, validateProfile } from '@/utils/validation'
import ProfileFields from '@/components/ProfileFields.vue'

const route = useRoute()
const router = useRouter()
const { register } = useAuth()
const { show } = useToast()

const profile = ref<ProfileData>({ firstName: '', lastName: '', email: '', phone: '', address: '', favoriteCategories: [] })
const account = reactive({ username: '', password: '', confirm: '' })
const usernameTaken = ref('')

// Errors are shown after the first submit attempt
const submitted = ref(false)
const errors = computed(() => ({
    ...validateProfile(profile.value),
    ...validatePassword(account.password, account.confirm),
    ...(account.username.trim() ? {} : { username: 'Unesite korisničko ime.' }),
}))
const shown = computed((): Record<string, string | undefined> => (submitted.value ? errors.value : {}))

function onSubmit() {
    submitted.value = true
    usernameTaken.value = ''
    if (Object.keys(errors.value).length) return

    const error = register({ ...profile.value, username: account.username, password: account.password })
    if (error) {
        usernameTaken.value = error
        return
    }
    show({ title: 'Nalog je napravljen', message: `Dobro došli, ${profile.value.firstName}!` })
    router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/')
}
</script>

<template>
    <div class="row justify-content-center my-4">
        <div class="col-lg-8 col-xl-7">
            <div class="card shadow-sm">
                <div class="card-body p-4">
                    <h1 class="h3 mb-1">Registracija</h1>
                    <p class="text-body-secondary mb-4">Sva polja su obavezna.</p>

                    <form @submit.prevent="onSubmit">
                        <ProfileFields v-model="profile" :errors="shown" />

                        <div class="row g-3 mt-1">
                            <div class="col-12">
                                <label for="reg-username" class="form-label">Korisničko ime</label>
                                <input id="reg-username" v-model="account.username" type="text" class="form-control"
                                    :class="{ 'is-invalid': shown.username || usernameTaken }" />
                                <div class="invalid-feedback">{{ shown.username || usernameTaken }}</div>
                            </div>
                            <div class="col-sm-6">
                                <label for="reg-password" class="form-label">Lozinka</label>
                                <input id="reg-password" v-model="account.password" type="password" class="form-control"
                                    :class="{ 'is-invalid': shown.password }" />
                                <div class="invalid-feedback">{{ shown.password }}</div>
                            </div>
                            <div class="col-sm-6">
                                <label for="reg-confirm" class="form-label">Ponovite lozinku</label>
                                <input id="reg-confirm" v-model="account.confirm" type="password" class="form-control"
                                    :class="{ 'is-invalid': shown.confirm }" />
                                <div class="invalid-feedback">{{ shown.confirm }}</div>
                            </div>
                        </div>

                        <div class="d-flex flex-wrap align-items-center gap-3 mt-4">
                            <button type="submit" class="btn btn-primary">Napravi nalog</button>
                            <span class="text-body-secondary">
                                Već imate nalog?
                                <RouterLink :to="{ name: 'login', query: route.query }">Prijavite se</RouterLink>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
