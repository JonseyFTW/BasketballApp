'use client'

import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Play } from '@/modules/plays/types'

export default function PlaysPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [plays, setPlays] = useState<Play[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlays() {
      try {
        const response = await fetch('/api/plays?limit=50&includeRelations=true')
        
        if (!response.ok) {
          throw new Error('Failed to fetch plays')
        }

        const data = await response.json()
        setPlays(data.data.plays || [])
      } catch (err) {
        console.error('Error fetching plays:', err)
        setError(err instanceof Error ? err.message : 'Failed to load plays')
      } finally {
        setLoading(false)
      }
    }

    fetchPlays()
  }, [])

  const filteredPlays = plays.filter(play =>
    play.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (play.description && play.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Play Library</h1>
            <p className="text-gray-600 mt-2">Manage and organize your basketball plays</p>
          </div>
          <Link href="/designer">
            <Button>
              <span className="mr-2">+</span>
              Create New Play
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search plays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">Filter by Tags</Button>
          <Button variant="outline">Sort</Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading plays...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">Error: {error}</div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* Stats */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{plays.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Primary Plays</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {plays.filter(play => play.tags?.some(tag => tag.name.toLowerCase().includes('primary'))).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Special Situations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {plays.filter(play => play.tags?.some(tag => tag.name.toLowerCase().includes('blob') || tag.name.toLowerCase().includes('slob'))).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {plays.filter(play => {
                    const playDate = new Date(play.createdAt)
                    const now = new Date()
                    return playDate.getMonth() === now.getMonth() && playDate.getFullYear() === now.getFullYear()
                  }).length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Plays Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlays.map((play) => (
              <Card key={play.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {play.title}
                    <Button size="sm" variant="ghost">⋮</Button>
                  </CardTitle>
                  <CardDescription>{play.description || 'No description provided'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {play.tags?.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: (tag.color || '#3B82F6') + '20',
                            color: tag.color || '#3B82F6',
                          }}
                        >
                          {tag.name}
                        </span>
                      )) || (
                        <span className="text-xs text-gray-500 italic">No tags</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Created on {new Date(play.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/plays/${play.id}`)}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => router.push(`/designer?playId=${play.id}`)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && filteredPlays.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {plays.length === 0 ? 'No plays found. Create your first play!' : 'No plays found matching your search.'}
            </div>
            <Link href="/designer">
              <Button>Create Your First Play</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  )
}