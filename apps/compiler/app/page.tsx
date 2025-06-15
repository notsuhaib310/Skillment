import dynamic from 'next/dynamic'

const CompilerPage = dynamic(() => import('../components/CompilerPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-300">Loading compiler...</span>
      </div>
    </div>
  ),
})

export default function Home() {
  return <CompilerPage />
}
