import type { ProfileData } from '@/hooks/useAuth'

// Basic checks so the user gets a clear message next to the field.

export function validateProfile(d: ProfileData): Partial<Record<keyof ProfileData, string>> {
    const e: Partial<Record<keyof ProfileData, string>> = {}
    if (!d.firstName.trim()) e.firstName = 'Unesite ime.'
    if (!d.lastName.trim()) e.lastName = 'Unesite prezime.'
    if (!/^\S+@\S+\.\S+$/.test(d.email.trim())) e.email = 'Unesite ispravnu adresu e-pošte.'
    if (!d.phone.trim()) e.phone = 'Unesite broj telefona.'
    if (!d.address.trim()) e.address = 'Unesite adresu.'
    if (d.favoriteCategories.length === 0) e.favoriteCategories = 'Izaberite bar jednu vrstu biljaka.'
    return e
}

export function validatePassword(password: string, confirm: string): { password?: string; confirm?: string } {
    const e: { password?: string; confirm?: string } = {}
    if (password.length < 6) e.password = 'Lozinka mora imati najmanje 6 karaktera.'
    if (confirm !== password) e.confirm = 'Lozinke se ne poklapaju.'
    return e
}
