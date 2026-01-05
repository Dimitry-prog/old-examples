import { useState } from 'react'
import { useQueryStats, useGlobalCache, useGlobalOffline } from '@/contexts/QueryContext'

interface QueryDevPanelProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Панель разработчика для TanStack Query
 */
export function QueryDevPanel({ isOpen, onClose }: QueryDevPanelProps) {
  const stats = useQueryStats()
  const cache = useGlobalCache()
  const offline = useGlobalOffline()
  const [activeTab, setActiveTab] = useState<'stats' | 'cache' | 'offline'>('stats')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Query Developer Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'stats', label: 'Statistics' },
            { id: 'cache', label: 'Cache Management' },
            { id: 'offline', label: 'Offline Status' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Cache Statistics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.cache.queriesCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Active Queries
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.cache.cacheSizeFormatted}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Cache Size
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">All Query Keys</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-40 overflow-y-auto">
                  <pre className="text-xs">
                    {JSON.stringify(cache.getAllQueryKeys(), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cache' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Cache Management</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => cache.clearAll()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear All Cache
                </button>
                
                <button
                  onClick={() => {
                    const cleared = cache.clearStale()
                    alert(`Cleared ${cleared} stale queries`)
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Clear Stale Data
                </button>
                
                <button
                  onClick={() => cache.invalidateAll()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Invalidate All
                </button>
                
                <button
                  onClick={() => {
                    const exported = cache.exportCache()
                    navigator.clipboard.writeText(exported)
                    alert('Cache exported to clipboard')
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Export Cache
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">All Queries Data</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-60 overflow-y-auto">
                  <pre className="text-xs">
                    {JSON.stringify(cache.getAllQueriesData(), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'offline' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Offline Status</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className={`text-2xl font-bold ${
                    stats.offline.isOnline 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stats.offline.isOnline ? 'Online' : 'Offline'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Connection Status
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.offline.offlineQueriesCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Failed Queries
                  </div>
                </div>
              </div>

              {stats.offline.offlineQueriesCount > 0 && (
                <div className="space-y-2">
                  <button
                    onClick={() => offline.retryOfflineQueries()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry Failed Queries
                  </button>
                  
                  <button
                    onClick={() => offline.clearOfflineQueries()}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ml-2"
                  >
                    Clear Failed Queries
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Network Events</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm">
                    <div>Status: {stats.offline.isOnline ? '🟢 Online' : '🔴 Offline'}</div>
                    <div>Failed Queries: {stats.offline.offlineQueriesCount}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Кнопка для открытия панели разработчика
 */
export function QueryDevButton() {
  const [isOpen, setIsOpen] = useState(false)

  // Показываем только в development режиме
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        title="Open Query Developer Panel"
      >
        🔍
      </button>
      
      <QueryDevPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}