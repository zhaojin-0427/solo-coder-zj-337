import type { CeremonyScheme } from '@/types'

const STORAGE_KEY = 'ancient-ceremony-schemes'

export function loadSchemes(): CeremonyScheme[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load schemes from localStorage:', e)
  }
  return []
}

export function saveSchemes(schemes: CeremonyScheme[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schemes))
  } catch (e) {
    console.error('Failed to save schemes to localStorage:', e)
  }
}

export function addScheme(scheme: CeremonyScheme): CeremonyScheme[] {
  const schemes = loadSchemes()
  schemes.push(scheme)
  saveSchemes(schemes)
  return schemes
}

export function updateScheme(updatedScheme: CeremonyScheme): CeremonyScheme[] {
  const schemes = loadSchemes()
  const index = schemes.findIndex(s => s.id === updatedScheme.id)
  if (index !== -1) {
    schemes[index] = { ...updatedScheme, updatedAt: Date.now() }
    saveSchemes(schemes)
  }
  return schemes
}

export function deleteScheme(schemeId: string): CeremonyScheme[] {
  const schemes = loadSchemes()
  const filtered = schemes.filter(s => s.id !== schemeId)
  saveSchemes(filtered)
  return filtered
}

export function getSchemeById(schemeId: string): CeremonyScheme | undefined {
  const schemes = loadSchemes()
  return schemes.find(s => s.id === schemeId)
}
