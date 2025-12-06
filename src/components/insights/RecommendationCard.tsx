import React from 'react'
import { Recommendation, updateRecommendationStatus } from '@/lib/intelligence/recommendations'
import { CheckCircle, Clock, X, ArrowRight, AlertCircle, Star, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  recommendation: Recommendation
  onUpdate?: () => void
}

export default function RecommendationCard({ recommendation, onUpdate }: Props) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const handleAction = async (status: 'completed' | 'dismissed' | 'snoozed') => {
    setLoading(true)
    await updateRecommendationStatus(recommendation.id, status)
    setLoading(false)
    if (onUpdate) onUpdate()
  }

  const getIcon = () => {
    switch (recommendation.priority) {
      case 'urgent': return <AlertCircle className="w-6 h-6 text-red-500" />
      case 'important': return <Star className="w-6 h-6 text-amber-500" />
      case 'optimization': return <Zap className="w-6 h-6 text-blue-500" />
      default: return <Star className="w-6 h-6 text-zinc-500" />
    }
  }

  const getBgColor = () => {
    switch (recommendation.priority) {
      case 'urgent': return 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'
      case 'important': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30'
      case 'optimization': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30'
      default: return 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
    }
  }

  return (
    <div className={`rounded-xl p-6 border shadow-sm ${getBgColor()} transition-all`}>
      <div className="flex gap-4">
        <div className="shrink-0 mt-1">
          {getIcon()}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1 block">
                {recommendation.priority === 'urgent' ? 'Top Priority' : recommendation.priority}
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {recommendation.title}
              </h3>
            </div>
          </div>
          
          <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
            {recommendation.description}
          </p>

          <div className="pt-4 flex flex-wrap gap-3">
            {recommendation.action_link && (
              <button 
                onClick={() => router.push(recommendation.action_link!)}
                className="flex items-center px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Take Action <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
            
            <button 
              onClick={() => handleAction('completed')}
              disabled={loading}
              className="flex items-center px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
              Done
            </button>

            <button 
              onClick={() => handleAction('snoozed')}
              disabled={loading}
              className="flex items-center px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <Clock className="w-4 h-4 mr-2 text-zinc-500" />
              Snooze
            </button>

            <button 
              onClick={() => handleAction('dismissed')}
              disabled={loading}
              className="flex items-center px-3 py-2 bg-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              title="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
