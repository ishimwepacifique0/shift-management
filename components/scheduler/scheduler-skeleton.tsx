"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { startOfWeek, eachDayOfInterval, endOfWeek } from "date-fns"

interface SchedulerSkeletonProps {
  selectedWeek: Date
}

export function SchedulerSkeleton({ selectedWeek }: SchedulerSkeletonProps) {
  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedWeek, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(selectedWeek, { weekStartsOn: 1 }), // Sunday
  })

  // Generate 3 skeleton staff rows
  const skeletonRows = Array.from({ length: 3 }, (_, index) => index)

  return (
    <div className="flex-1 overflow-auto">
      {/* Header skeleton */}
      <div className="grid grid-cols-8 border-b border-r">
        {/* Search bar skeleton */}
        <div className="border-b border-r p-2">
          <Skeleton className="h-8 w-full" />
        </div>
        
        {/* Day headers skeleton */}
        {weekDays.map((_, index) => (
          <div key={index} className="border-b border-r p-2 text-center">
            <Skeleton className="h-4 w-8 mx-auto mb-1" />
            <Skeleton className="h-3 w-4 mx-auto" />
          </div>
        ))}
      </div>

      {/* Staff rows skeleton */}
      {skeletonRows.map((rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-8 border-b">
          {/* Staff info skeleton */}
          <div className="flex border-r items-center min-h-[80px] px-2 py-1">
            <div className="flex items-center space-x-2 w-full">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex flex-col space-y-1 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
          
          {/* Day cells skeleton */}
          {weekDays.map((_, dayIndex) => (
            <div key={dayIndex} className="border-r p-1 min-h-[80px]">
              <Skeleton className="h-16 w-full mb-1" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function StaffSkeleton() {
  return (
    <div className="grid grid-cols-8 border-b">
      {/* Staff info skeleton */}
      <div className="flex border-r items-center min-h-[80px] px-2 py-1">
        <div className="flex items-center space-x-2 w-full">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex flex-col space-y-1 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
      
      {/* Empty day cells */}
      {Array.from({ length: 7 }, (_, index) => (
        <div key={index} className="border-r p-1 min-h-[80px]" />
      ))}
    </div>
  )
}
