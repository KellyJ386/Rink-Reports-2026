'use client'

import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

export default function CommunicationPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Communication' }]} />

      <h1 className="text-2xl font-bold text-navy dark:text-white mb-6 px-4">
        Communication
      </h1>

      <div className="px-4">
        <div className="card text-center py-12">
          <p className="text-wolf-grey text-lg">Communication module coming soon.</p>
          <p className="text-sm text-wolf-grey mt-2">
            This module will support internal messaging and announcements.
          </p>
        </div>
      </div>
    </div>
  )
}
