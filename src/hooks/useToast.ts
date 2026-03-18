'use client'

import { useState, useCallback, useRef } from 'react'

export type ToastType = 'success' | 'error' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

const AUTO_DISMISS_MS = 3000

interface UseToastReturn {
  toasts: Toast[]
  addToast: (message: string, type: ToastType) => string
  removeToast: (id: string) => void
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  )

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (message: string, type: ToastType): string => {
      const id = crypto.randomUUID()
      const toast: Toast = { id, message, type }

      setToasts((prev) => [...prev, toast])

      const timer = setTimeout(() => {
        removeToast(id)
      }, AUTO_DISMISS_MS)

      timersRef.current.set(id, timer)

      return id
    },
    [removeToast]
  )

  return { toasts, addToast, removeToast }
}
