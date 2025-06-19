'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Placeholder interface - should be imported from actual types
interface GamePlan {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
  plays?: Array<{
    id: string
    title: string
  }>
}

interface GamePlanDetailPageProps {
  params: { id: string }
}

export default function GamePlanDetailPage({ params }: GamePlanDetailPageProps) {
  const [gameplan, setGameplan] = useState<GamePlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchGamePlan() {
      try {
        const response = await fetch(`/api/gameplans/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Game plan not found')
        }

        const data = await response.json()
        setGameplan(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game plan')
      } finally {
        setLoading(false)
      }
    }

    fetchGamePlan()
  }, [params.id])

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading game plan...</p>
        </div>
      </Layout>
    )
  }

  if (error || !gameplan) {
    return (
      <Layout>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Game Plan Not Found</CardTitle>
            <CardDescription>
              {error || 'This game plan is no longer available.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              The game plan you're looking for might have been removed or you don't have access to it.
            </p>
            <Button onClick={() => router.back()} variant="outline" className="w-full mb-2">
              Go Back
            </Button>
            <Button onClick={() => router.push('/gameplans')} className="w-full">
              Browse All Game Plans
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
              <h1 className="text-2xl font-bold text-gray-900">{gameplan.title}</h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span>Created by {gameplan.author.name || gameplan.author.email}</span>
                <span>•</span>
                <span>{new Date(gameplan.createdAt).toLocaleDateString()}</span>
                {gameplan.updatedAt !== gameplan.createdAt && (
                  <>
                    <span>•</span>
                    <span>Updated {new Date(gameplan.updatedAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push(`/gameplans/${gameplan.id}/edit`)}
            >
              ✏️ Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              🖨️ Print
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Plan Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {gameplan.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900">{gameplan.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Plays */}
            <Card>
              <CardHeader>
                <CardTitle>Plays in Game Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {gameplan.plays && gameplan.plays.length > 0 ? (
                  <div className="space-y-3">
                    {gameplan.plays.map((play, index) => (
                      <div key={play.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">#{index + 1}</span>
                          <span className="font-medium">{play.title}</span>
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => router.push(`/plays/${play.id}`)}
                        >
                          View Play
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No plays added to this game plan yet.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => router.push(`/gameplans/${gameplan.id}/edit`)}
                    >
                      Add Plays
                    </Button>
                  </div>
                )}
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
                  <span className="text-gray-600">Total Plays</span>
                  <span className="font-medium">{gameplan.plays?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">
                    {new Date(gameplan.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {gameplan.updatedAt !== gameplan.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">
                      {new Date(gameplan.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                  }}
                >
                  📋 Copy Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/share/create?gameplanId=${gameplan.id}`)}
                >
                  🔗 Create Share Link
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  📊 Export Report
                </Button>
              </CardContent>
            </Card>

            {/* Author Info */}
            <Card>
              <CardHeader>
                <CardTitle>Created By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{gameplan.author.name || gameplan.author.email}</p>
                  <p className="text-sm text-gray-600">{gameplan.author.email}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}