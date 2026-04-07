"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ClientContextType {
  selectedClientId: string | null
  setSelectedClientId: (clientId: string | null) => void
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ children }: { children: ReactNode }) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Only run on client side after hydration
  useEffect(() => {
    setIsHydrated(true)
    const stored = localStorage.getItem('selectedClientId')
    if (stored) {
      setSelectedClientId(stored)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    if (selectedClientId) {
      localStorage.setItem('selectedClientId', selectedClientId)
    } else {
      localStorage.removeItem('selectedClientId')
    }
  }, [selectedClientId, isHydrated])

  return (
    <ClientContext.Provider value={{ selectedClientId, setSelectedClientId }}>
      {children}
    </ClientContext.Provider>
  )
}

export function useClient() {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider')
  }
  return context
}
