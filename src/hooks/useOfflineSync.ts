'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  addToSyncQueue,
  getSyncQueueCount,
  processSyncQueue,
} from '@/lib/offline/sync-queue'

type SyncStatus = 'idle' | 'syncing' | 'error'

interface UseOfflineSyncReturn {
  isOnline: boolean
  pendingCount: number
  syncStatus: SyncStatus
  submitWithOfflineSupport: (
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE',
    body: Record<string, unknown>
  ) => Promise<Response | null>
  processSyncQueue: () => Promise<void>
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const isSyncing = useRef(false)

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getSyncQueueCount()
      setPendingCount(count)
    } catch {
      // IndexedDB may not be available in SSR
    }
  }, [])

  const handleProcessQueue = useCallback(async () => {
    if (isSyncing.current || !navigator.onLine) return
    isSyncing.current = true
    setSyncStatus('syncing')

    try {
      const result = await processSyncQueue()
      setSyncStatus(result.failed > 0 ? 'error' : 'idle')
    } catch {
      setSyncStatus('error')
    } finally {
      isSyncing.current = false
      await refreshPendingCount()
    }
  }, [refreshPendingCount])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      void handleProcessQueue()
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial count
    void refreshPendingCount()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleProcessQueue, refreshPendingCount])

  const submitWithOfflineSupport = useCallback(
    async (
      endpoint: string,
      method: 'POST' | 'PUT' | 'DELETE',
      body: Record<string, unknown>
    ): Promise<Response | null> => {
      // Always add to queue first for durability
      await addToSyncQueue({ endpoint, method, body })
      await refreshPendingCount()

      if (!navigator.onLine) {
        return null
      }

      // Attempt immediate sync
      try {
        await handleProcessQueue()
        return new Response(JSON.stringify({ queued: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      } catch {
        return null
      }
    },
    [handleProcessQueue, refreshPendingCount]
  )

  return {
    isOnline,
    pendingCount,
    syncStatus,
    submitWithOfflineSupport,
    processSyncQueue: handleProcessQueue,
  }
}
