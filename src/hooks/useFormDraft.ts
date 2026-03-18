'use client'

import { useCallback, useEffect, useRef } from 'react'
import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'rink-reports-offline'
const STORE_NAME = 'form-drafts'
const DB_VERSION = 2
const DEBOUNCE_MS = 500

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
}

interface UseFormDraftReturn {
  saveDraft: (formKey: string, data: Record<string, unknown>) => void
  loadDraft: (formKey: string) => Promise<Record<string, unknown> | null>
  clearDraft: (formKey: string) => Promise<void>
}

export function useFormDraft(): UseFormDraftReturn {
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  )

  // Clean up pending timers on unmount
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const saveDraft = useCallback(
    (formKey: string, data: Record<string, unknown>): void => {
      const existingTimer = timersRef.current.get(formKey)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      const timer = setTimeout(() => {
        timersRef.current.delete(formKey)
        void (async () => {
          try {
            const db = await getDB()
            await db.put(STORE_NAME, data, formKey)
          } catch {
            // IndexedDB may not be available
          }
        })()
      }, DEBOUNCE_MS)

      timersRef.current.set(formKey, timer)
    },
    []
  )

  const loadDraft = useCallback(
    async (formKey: string): Promise<Record<string, unknown> | null> => {
      try {
        const db = await getDB()
        const draft =
          await db.get(STORE_NAME, formKey) as Record<string, unknown> | undefined
        return draft ?? null
      } catch {
        return null
      }
    },
    []
  )

  const clearDraft = useCallback(async (formKey: string): Promise<void> => {
    try {
      const existingTimer = timersRef.current.get(formKey)
      if (existingTimer) {
        clearTimeout(existingTimer)
        timersRef.current.delete(formKey)
      }
      const db = await getDB()
      await db.delete(STORE_NAME, formKey)
    } catch {
      // IndexedDB may not be available
    }
  }, [])

  return { saveDraft, loadDraft, clearDraft }
}
