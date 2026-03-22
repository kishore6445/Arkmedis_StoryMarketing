'use client'

import { Suspense } from 'react'
import ClientHubPageContent from './client-hub-content'

export const dynamic = 'force-dynamic'

export default function ClientHubPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ClientHubPageContent />
    </Suspense>
  )
}
