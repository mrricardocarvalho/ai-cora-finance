"use client"
import React from 'react'
import Skeleton from '../ui/skeleton'

export default function DashboardSkeleton(){
  return (
    <div className="p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-48 rounded" as="div" />
        <Skeleton className="h-4 w-28 rounded ml-2" as="div" />
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Skeleton className="h-24 rounded col-span-1" as="div" />
          <Skeleton className="h-24 rounded col-span-1" as="div" />
          <Skeleton className="h-24 rounded col-span-1" as="div" />
        </div>
        <div className="md:col-span-1">
          <Skeleton className="h-40 rounded" as="div" />
        </div>
        <div className="md:col-span-2">
          <Skeleton className="h-40 rounded" as="div" />
        </div>
      </div>
    </div>
  )
}
