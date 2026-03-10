'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icons'

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSync, setPendingSync] = useState(0)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && pendingSync === 0) return null

  return (
    <div className="offline-banner flex items-center justify-center gap-2">
      {!isOnline ? (
        <>
          <Icon name="wifi-off" size={16} />
          <span>You are offline. Changes will sync when connected.</span>
          {pendingSync > 0 && (
            <span className="ml-2 bg-navy text-white text-xs px-2 py-0.5 rounded-full">
              {pendingSync} pending
            </span>
          )}
        </>
      ) : (
        <span>Syncing changes...</span>
      )}
    </div>
  )
}
