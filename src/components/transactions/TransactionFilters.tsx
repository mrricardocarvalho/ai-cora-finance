"use client"
import React, { useState, useCallback } from 'react'
import Button from '../ui/button'

export type TransactionFilters = {
  accountId?: string
  category?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

type Props = {
  accounts: { id: string; name: string }[]
  categories: string[]
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
}

export default function TransactionFilters({ accounts, categories, filters, onFiltersChange }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const handleChange = useCallback((key: keyof TransactionFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value || undefined })
  }, [filters, onFiltersChange])

  const handleClear = useCallback(() => {
    onFiltersChange({})
  }, [onFiltersChange])

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="mb-4">
      {/* Filter toggle button */}
      <div className="flex items-center gap-2 mb-2">
        <Button 
          variant="ghost" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" onClick={handleClear} className="text-sm text-[var(--text-muted)]">
            Clear all
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {isExpanded && (
        <div className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Search</label>
              <input
                type="text"
                placeholder="Search description..."
                value={filters.search || ''}
                onChange={(e) => handleChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-sm bg-surface text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
              />
            </div>

            {/* Account filter */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Account</label>
              <select
                value={filters.accountId || ''}
                onChange={(e) => handleChange('accountId', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-sm bg-surface text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                aria-label="Filter by account"
              >
                <option value="">All accounts</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-sm bg-surface text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Date range - From */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Date from</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-sm bg-surface text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                aria-label="Filter by start date"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date range - To */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Date to</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-sm bg-surface text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                aria-label="Filter by end date"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
