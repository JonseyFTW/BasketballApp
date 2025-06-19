'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlayerProfileWithRelations } from '@/modules/users/types'

interface PlayerDetailPageProps {
  params: { id: string }
}

export default function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const [player, setPlayer] = useState<PlayerProfileWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchPlayer() {
      try {
        const response = await fetch(`/api/players/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Player not found')
        }

        const data = await response.json()
        setPlayer(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load player')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayer()
  }, [params.id])

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading player...</p>
        </div>
      </Layout>
    )
  }

  if (error || !player) {
    return (
      <Layout>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Player Not Found</CardTitle>
            <CardDescription>
              {error || 'This player is no longer available.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              The player you're looking for might have been removed or you don't have access to them.
            </p>
            <Button onClick={() => router.back()} variant="outline" className="w-full mb-2">
              Go Back
            </Button>
            <Button onClick={() => router.push('/players')} className="w-full">
              Browse All Players
            </Button>
          </CardContent>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {player.name} {player.number && `#${player.number}`}
              </h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                {player.position && <span>Position: {player.position}</span>}
                {player.team && (
                  <>
                    <span>•</span>
                    <span>Team: {player.team.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push(`/players/${player.id}/edit`)}
            >
              ✏️ Edit
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Player Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{player.name}</p>
                  </div>
                  {player.number && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Jersey Number</label>
                      <p className="text-gray-900">#{player.number}</p>
                    </div>
                  )}
                  {player.position && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Position</label>
                      <p className="text-gray-900">{player.position}</p>
                    </div>
                  )}
                  {player.team && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Team</label>
                      <p className="text-gray-900">{player.team.name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Attributes */}
            <Card>
              <CardHeader>
                <CardTitle>Player Attributes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {player.attributes && Object.entries(player.attributes as any).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{value as number}</div>
                      <div className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Adaptations</span>
                  <span className="font-medium">{player.adaptations?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Joined</span>
                  <span className="font-medium">
                    {new Date(player.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Coach Info */}
            {player.coach && (
              <Card>
                <CardHeader>
                  <CardTitle>Coach</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{player.coach.name || player.coach.email}</p>
                    <p className="text-sm text-gray-600">{player.coach.email}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}