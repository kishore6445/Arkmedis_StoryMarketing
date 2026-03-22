'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function ClientHubPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientId = searchParams.get('clientId')

  useEffect(() => {
    if (clientId) {
      router.push(`/client-hub/${clientId}/knowledge-base`)
    } else {
      // If no client ID, redirect to account manager to select one
      router.push('/account-manager')
    }
  }, [clientId, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading knowledge base...</p>
      </div>
    </div>
  )
}
