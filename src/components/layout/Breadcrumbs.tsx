'use client'

import Link from 'next/link'
import { Icon } from '@/components/ui/Icons'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-sm text-wolf-grey px-4 py-2">
      <Link href="/dashboard" className="hover:text-navy dark:hover:text-white">
        Dashboard
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <Icon name="chevron-right" size={14} />
          {item.href ? (
            <Link href={item.href} className="hover:text-navy dark:hover:text-white">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
