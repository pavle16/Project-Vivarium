import { computed, ref, watch } from 'vue'
import { loadJson, saveJson } from '@/utils/storage'

// Simulated accounts: no backend, users and the session live in localStorage.

export interface ProfileData {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    favoriteCategories: number[] // category ids, see utils/categories.ts
}

export interface User extends ProfileData {
    id: number
    username: string
    password: string
}

const DEMO_USER: User = {
    id: 1,
    username: 'demo',
    password: 'biljka123',
    firstName: 'Ana',
    lastName: 'Petrović',
    email: 'ana.petrovic@primer.rs',
    phone: '064 123 4567',
    address: 'Bulevar oslobođenja 12, Novi Sad',
    favoriteCategories: [4, 5],
}

const users = ref<User[]>(loadJson('vivarium.users', [DEMO_USER]))
const sessionUserId = ref<number | null>(loadJson('vivarium.session', null))

watch(users, v => saveJson('vivarium.users', v), { deep: true })
watch(sessionUserId, v => saveJson('vivarium.session', v))

const currentUser = computed(() => users.value.find(u => u.id === sessionUserId.value) ?? null)
const isLoggedIn = computed(() => currentUser.value !== null)

export function useAuth() {
    /** Returns true if the username and password match. */
    function login(username: string, password: string): boolean {
        const user = users.value.find(u => u.username === username.trim() && u.password === password)
        if (user) sessionUserId.value = user.id
        return !!user
    }

    function logout() {
        sessionUserId.value = null
    }

    /** Creates the account and logs in. Returns an error message if the username is taken. */
    function register(data: Omit<User, 'id'>): string | null {
        if (users.value.some(u => u.username === data.username.trim())) return 'Ovo korisničko ime je zauzeto.'
        const user = { ...data, username: data.username.trim(), id: users.value.length + 1 }
        users.value.push(user)
        sessionUserId.value = user.id
        return null
    }

    function updateProfile(changes: Partial<Omit<User, 'id'>>) {
        if (currentUser.value) Object.assign(currentUser.value, changes)
    }

    return { currentUser, isLoggedIn, login, logout, register, updateProfile }
}
