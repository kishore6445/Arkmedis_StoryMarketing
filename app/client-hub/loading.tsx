export default function ClientHubLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFBFC]">
      <div className="text-center">
        <div className="inline-flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading knowledge base...</p>
      </div>
    </div>
  )
}
