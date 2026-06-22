import type { CeremonyScheme, SchemeSnapshot } from '@/types'

const STORAGE_KEY = 'ancient-ceremony-schemes'
const SNAPSHOT_KEY = 'ancient-ceremony-snapshots'

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
  deleteSnapshotsBySchemeId(schemeId)
  return filtered
}

export function getSchemeById(schemeId: string): CeremonyScheme | undefined {
  const schemes = loadSchemes()
  return schemes.find(s => s.id === schemeId)
}

export function loadSnapshots(): SchemeSnapshot[] {
  try {
    const data = localStorage.getItem(SNAPSHOT_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load snapshots from localStorage:', e)
  }
  return []
}

export function saveSnapshots(snapshots: SchemeSnapshot[]): void {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshots))
  } catch (e) {
    console.error('Failed to save snapshots to localStorage:', e)
  }
}

export function addSnapshot(snapshot: SchemeSnapshot): SchemeSnapshot[] {
  const snapshots = loadSnapshots()
  snapshots.push(snapshot)
  const schemeSnapshots = snapshots.filter(s => s.schemeId === snapshot.schemeId)
  if (schemeSnapshots.length > 50) {
    const sorted = schemeSnapshots.sort((a, b) => a.timestamp - b.timestamp)
    const toRemove = sorted.slice(0, schemeSnapshots.length - 50).map(s => s.id)
    const filtered = snapshots.filter(s => !toRemove.includes(s.id))
    saveSnapshots(filtered)
    return filtered
  }
  saveSnapshots(snapshots)
  return snapshots
}

export function getSnapshotsBySchemeId(schemeId: string): SchemeSnapshot[] {
  const snapshots = loadSnapshots()
  return snapshots
    .filter(s => s.schemeId === schemeId)
    .sort((a, b) => b.timestamp - a.timestamp)
}

export function deleteSnapshotsBySchemeId(schemeId: string): void {
  const snapshots = loadSnapshots()
  const filtered = snapshots.filter(s => s.schemeId !== schemeId)
  saveSnapshots(filtered)
}

export function deleteSnapshot(snapshotId: string): SchemeSnapshot[] {
  const snapshots = loadSnapshots()
  const filtered = snapshots.filter(s => s.id !== snapshotId)
  saveSnapshots(filtered)
  return filtered
}

export function getSnapshotById(snapshotId: string): SchemeSnapshot | undefined {
  const snapshots = loadSnapshots()
  return snapshots.find(s => s.id === snapshotId)
}
