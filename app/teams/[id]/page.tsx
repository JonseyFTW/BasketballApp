'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TeamWithRelations } from '@/modules/users/types'

interface TeamDetailPageProps {
  params: { id: string }
}

export default function TeamDetailPage({ params }: TeamDetailPageProps) {
  const [team, setTeam] = useState<TeamWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchTeam() {
      try {
        const response = await fetch(`/api/teams/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Team not found')
        }

        const data = await response.json()
        setTeam(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team')
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [params.id])

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team...</p>
        </div>
      </Layout>
    )
  }

  if (error || !team) {
    return (
      <Layout>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Team Not Found</CardTitle>
            <CardDescription>
              {error || 'This team is no longer available.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              The team you're looking for might have been removed or you don't have access to it.
            </p>
            <Button onClick={() => router.back()} variant="outline" className="w-full mb-2">
              Go Back
            </Button>
            <Button onClick={() => router.push('/teams')} className="w-full">
              Browse All Teams
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
              <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                {team.users && (
                  <>
                    <span>•</span>
                    <span>{team.users.length} member{team.users.length !== 1 ? 's' : ''}</span>
                  </>
                )}
                {team.players && (
                  <>
                    <span>•</span>
                    <span>{team.players.length} player{team.players.length !== 1 ? 's' : ''}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push(`/teams/${team.id}/edit`)}
            >
              ✏️ Edit
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Team Name</label>
                  <p className="text-gray-900">{team.name}</p>
                </div>
                {team.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900">{team.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Members */}
            {team.users && team.users.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {team.users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{user.name || user.email}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {user.role.toLowerCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Players */}
            {team.players && team.players.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {team.players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {player.name} {player.number && `#${player.number}`}
                          </p>
                          {player.position && (
                            <p className="text-sm text-gray-600">{player.position}</p>
                          )}
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => router.push(`/players/${player.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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
                  <span className="text-gray-600">Members</span>
                  <span className="font-medium">{team.users?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Players</span>
                  <span className="font-medium">{team.players?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Coaches</span>
                  <span className="font-medium">
                    {team.users?.filter(u => u.role === 'COACH').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  👥 Invite Member
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  🏀 Add Player
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  📊 View Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}