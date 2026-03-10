'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  timestamp?: string
  checkedBy?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, timestamp, checkedBy, className, ...props }, ref) => {
    return (
      <label className={clsx('flex items-center gap-3 min-h-touch cursor-pointer', className)}>
        <input
          ref={ref}
          type="checkbox"
          className="w-6 h-6 rounded border-wolf-grey text-action-green focus:ring-action-green cursor-pointer"
          {...props}
        />
        <div className="flex-1">
          <span className={clsx('text-base', props.checked && 'line-through text-wolf-grey')}>
            {label}
          </span>
          {timestamp && (
            <span className="block text-xs text-wolf-grey">
              {checkedBy && `${checkedBy} - `}{timestamp}
            </span>
          )}
        </div>
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
