import { openDB, IDBPDatabase } from 'idb'
import type { SyncQueueItem } from '@/types'

const DB_NAME = 'rink-reports-offline'
const STORE_NAME = 'sync-queue'
const DB_VERSION = 1

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    },
  })
}

export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<string> {
  const db = await getDB()
  const id = crypto.randomUUID()
  const queueItem: SyncQueueItem = {
    ...item,
    id,
    timestamp: Date.now(),
    retries: 0,
  }
  await db.put(STORE_NAME, queueItem)
  return id
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function clearSyncQueue(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE_NAME)
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getDB()
  return db.count(STORE_NAME)
}

export async function processSyncQueue(): Promise<{ success: number; failed: number }> {
  const queue = await getSyncQueue()
  let success = 0
  let failed = 0

  for (const item of queue) {
    try {
      const response = await fetch(item.endpoint, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.body),
      })

      if (response.ok) {
        await removeFromSyncQueue(item.id)
        success++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }

  return { success, failed }
}
