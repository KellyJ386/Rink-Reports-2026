'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning'
  onClose: () => void
  duration?: number
}

const typeStyles = {
  success: 'bg-action-green text-white',
  error: 'bg-alert-red text-white',
  warning: 'bg-alert-yellow text-navy',
}

export function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={clsx(
        'fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300',
        typeStyles[type],
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      {message}
    </div>
  )
}
