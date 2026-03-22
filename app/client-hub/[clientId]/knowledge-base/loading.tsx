export default function KnowledgeBaseLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-48 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="w-24 h-10 bg-gray-200 rounded animate-pulse" />
              <div className="w-24 h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-4 gap-6 p-8 h-[calc(100vh-160px)]">
        {/* Left Skeleton */}
        <div className="col-span-2 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="w-full h-10 bg-gray-200 rounded animate-pulse" />
            <div className="w-full h-10 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex-1 p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Right Skeleton */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
            <div className="w-full h-8 bg-gray-200 rounded animate-pulse" />
            <div className="w-full h-6 bg-gray-100 rounded animate-pulse" />
            <div className="w-full h-20 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 space-y-2">
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-full h-8 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 space-y-2">
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-full h-8 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
