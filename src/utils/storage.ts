// Simulated data storage: keeps prototype data in localStorage between reloads.

export function loadJson<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
}

export function saveJson(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value))
}
