'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'form-input',
            error && 'border-alert-red focus:ring-alert-red',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-alert-red">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
