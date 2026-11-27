export function formatDate(iso: string): string {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('sr-Latn-RS', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatPrice(amount: number, currency = 'RSD'): string {
    return `${amount.toLocaleString('sr-RS')} ${currency}`
}

// Serbian plural forms: 1 biljka, 2–4 biljke, 5+ biljaka (21 biljka, 22 biljke, 11–14 biljaka)
export function plural(n: number, one: string, few: string, many: string): string {
    const mod10 = n % 10, mod100 = n % 100
    if (mod10 === 1 && mod100 !== 11) return one
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
    return many
}
