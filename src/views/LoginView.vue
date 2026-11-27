<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

const route = useRoute()
const router = useRouter()
const { login, currentUser } = useAuth()
const { show } = useToast()

const username = ref('')
const password = ref('')
const error = ref('')

function onSubmit() {
    if (!login(username.value, password.value)) {
        error.value = 'Pogrešno korisničko ime ili lozinka.'
        return
    }
    show({ title: `Dobro došli, ${currentUser.value?.firstName}!` })
    // Go back to the page that asked for login (e.g. the plant being reserved)
    router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/')
}
</script>

<template>
    <div class="row justify-content-center my-5">
        <div class="col-sm-10 col-md-7 col-lg-5">
            <div class="card shadow-sm">
                <div class="card-body p-4">
                    <h1 class="h3 mb-4">Prijava</h1>

                    <div v-if="route.query.reason === 'reserve'" class="alert alert-info py-2">
                        Da biste rezervisali biljku, prijavite se ili napravite nalog.
                    </div>
                    <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

                    <form @submit.prevent="onSubmit">
                        <div class="mb-3">
                            <label for="login-username" class="form-label">Korisničko ime</label>
                            <input id="login-username" v-model="username" type="text" class="form-control" />
                        </div>
                        <div class="mb-4">
                            <label for="login-password" class="form-label">Lozinka</label>
                            <input id="login-password" v-model="password" type="password" class="form-control" />
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Prijavi se</button>
                    </form>

                    <p class="text-center mt-4 mb-0">
                        Nemate nalog?
                        <RouterLink :to="{ name: 'register', query: route.query }">Registrujte se</RouterLink>
                    </p>
                </div>
            </div>
            <p class="small text-body-secondary text-center mt-3">
                Demo nalog: korisničko ime <code>demo</code>, lozinka <code>biljka123</code>
            </p>
        </div>
    </div>
</template>
