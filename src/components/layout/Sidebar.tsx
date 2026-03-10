'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { Icon } from '@/components/ui/Icons'
import { MODULES } from '@/lib/constants'

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full bg-navy text-white z-40 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-navy-light">
        {collapsed ? (
          <span className="text-xl font-bold">MF</span>
        ) : (
          <span className="text-lg font-bold">Max Facility</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {MODULES.map((mod) => {
            const isActive = pathname?.startsWith(mod.href)
            return (
              <li key={mod.id}>
                <Link
                  href={mod.href}
                  className={clsx('sidebar-link', isActive && 'active')}
                  title={mod.name}
                >
                  <Icon name={mod.icon} size={20} />
                  {!collapsed && <span>{mod.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-navy-light p-4">
        <Link href="/profile" className="sidebar-link">
          <Icon name="user" size={20} />
          {!collapsed && <span>Profile</span>}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="hidden lg:flex items-center justify-center h-12 border-t border-navy-light hover:bg-navy-light transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Icon
          name="chevron-right"
          size={20}
          className={clsx('transition-transform', !collapsed && 'rotate-180')}
        />
      </button>
    </aside>
  )
}
