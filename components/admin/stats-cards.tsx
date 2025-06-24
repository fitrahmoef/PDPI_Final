'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatData {
  title: string
  value: string
  description: string
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
}

interface StatsCardsProps {
  stats: StatData[]
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <Card key={index} className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold animate-counter">
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
            {stat.trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs mt-1",
                stat.trendUp ? "text-green-600" : "text-red-600"
              )}>
                {stat.trendUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {stat.trend}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}