'use client'

import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GamePlansPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - in real app this would come from API
  const mockGamePlans = [
    {
      id: '1',
      title: 'vs Lakers Game Plan',
      description: 'Comprehensive plan for facing Lakers zone defense',
      opponent: 'Lakers',
      gameDate: '2024-01-20',
      playsCount: 8,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'Tournament Semi-Final',
      description: 'High-pressure game strategy with multiple scenarios',
      opponent: 'Warriors',
      gameDate: '2024-01-25', 
      playsCount: 12,
      createdAt: '2024-01-14',
    },
  ]

  const filteredPlans = mockGamePlans.filter(plan =>
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.opponent.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Game Plans</h1>
            <p className="text-gray-600 mt-2">Organize plays and strategies for specific games</p>
          </div>
          <Button>
            <span className="mr-2">+</span>
            New Game Plan
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search game plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">Filter by Date</Button>
          <Button variant="outline">Sort</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockGamePlans.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Upcoming Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">20</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
            </CardContent>
          </Card>
        </div>

        {/* Game Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.title}
                  <Button size="sm" variant="ghost">⋮</Button>
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Opponent:</span>
                    <span className="font-medium">{plan.opponent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Game Date:</span>
                    <span className="font-medium">
                      {new Date(plan.gameDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plays:</span>
                    <span className="font-medium">{plan.playsCount}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Created {new Date(plan.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/gameplans/${plan.id}`)}
                    >
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => router.push(`/gameplans/${plan.id}/edit`)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No game plans found.</div>
            <Button>Create Your First Game Plan</Button>
          </div>
        )}
      </div>
    </Layout>
  )
}