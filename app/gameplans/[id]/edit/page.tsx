'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

interface GamePlanEditPageProps {
  params: { id: string }
}

export default function GamePlanEditPage({ params }: GamePlanEditPageProps) {
  const [gameplan, setGameplan] = useState<GamePlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    async function fetchGamePlan() {
      try {
        const response = await fetch(`/api/gameplans/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Game plan not found')
        }

        const data = await response.json()
        const gameplanData = data.data
        setGameplan(gameplanData)
        
        // Initialize form
        setTitle(gameplanData.title)
        setDescription(gameplanData.description || '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game plan')
      } finally {
        setLoading(false)
      }
    }

    fetchGamePlan()
  }, [params.id])

  const handleSave = async () => {
    if (!title.trim()) return

    setSaving(true)
    try {
      const response = await fetch(`/api/gameplans/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
        }),
      })

      if (response.ok) {
        router.push(`/gameplans/${params.id}`)
      } else {
        setError('Failed to update game plan')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game plan')
    } finally {
      setSaving(false)
    }
  }

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
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/gameplans')} className="w-full">
              Back to Game Plans
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Game Plan</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/gameplans/${params.id}`)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Game Plan Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Game Plan Title *
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter game plan title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Game plan description (optional)"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Plays Management */}
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
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => router.push(`/plays/${play.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement remove play functionality
                            console.log('Remove play:', play.id)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4">
                    + Add More Plays
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No plays added to this game plan yet.</p>
                  <Button variant="outline">
                    + Add Plays
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}