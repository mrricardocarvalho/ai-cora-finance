"use client"

import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConceptCard } from './ConceptCard'
import { ALL_CONCEPTS } from '@/lib/education'
import { useLearning } from './LearningContext'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function ConceptLibrary() {
  const { hasLearned } = useLearning()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'investing', label: 'Investing' },
    { id: 'budgeting', label: 'Budgeting' },
    { id: 'debt', label: 'Debt' },
    { id: 'taxes', label: 'Taxes' },
    { id: 'saving', label: 'Saving' }
  ]

  const filteredConcepts = ALL_CONCEPTS.filter((concept) => {
    // Filter by category
    if (activeTab !== 'all' && concept.category !== activeTab) return false
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const title = concept.title['en-US'].toLowerCase() // Default to EN for search for now
      const desc = concept.shortExplanation['en-US'].toLowerCase()
      return title.includes(query) || desc.includes(query)
    }
    
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex h-auto sm:h-10">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs sm:text-sm">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search concepts..."
            className="pl-9"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredConcepts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No concepts found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredConcepts.map((concept) => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              isLearned={hasLearned(concept.slug)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
