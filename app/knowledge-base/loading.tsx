"use client"

export default function KnowledgeBaseLoading() {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar Skeleton */}
      <div className="w-60 bg-gray-100 border-r border-gray-300 flex flex-col overflow-hidden">
        <div className="px-3 py-4 border-b border-gray-300">
          <div className="h-4 bg-gray-300 rounded w-16 mb-4" />
          <div className="h-3 bg-gray-300 rounded w-20" />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded" />
          ))}
        </div>

        <div className="p-3 border-t border-gray-300">
          <div className="h-9 bg-gray-300 rounded" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Breadcrumb Header */}
        <div className="border-b border-gray-200 px-8 py-4">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="h-12 bg-gray-300 rounded w-64 mb-8" />
            <div className="space-y-3 max-w-3xl">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded w-full" />
              ))}
            </div>
          </div>

          {/* Details Panel Skeleton */}
          <div className="w-80 border-l border-gray-200 bg-gray-50 p-6">
            <div className="h-5 bg-gray-300 rounded w-24 mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-300 rounded w-16 mb-2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
