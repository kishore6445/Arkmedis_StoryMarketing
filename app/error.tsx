'use client'

export default function Error() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-[#86868B] mb-4">Please try refreshing the page</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0051D5]"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}
