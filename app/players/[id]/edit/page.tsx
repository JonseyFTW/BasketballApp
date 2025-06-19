'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlayerProfileWithRelations } from '@/modules/users/types'

interface PlayerEditPageProps {
  params: { id: string }
}

export default function PlayerEditPage({ params }: PlayerEditPageProps) {
  const [player, setPlayer] = useState<PlayerProfileWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Form state
  const [name, setName] = useState('')
  const [number, setNumber] = useState<number | ''>('')
  const [position, setPosition] = useState('')
  const [attributes, setAttributes] = useState({
    speed: 50,
    size: 50,
    shooting: 50,
    ballHandling: 50,
    defense: 50,
    rebounding: 50,
  })

  useEffect(() => {
    async function fetchPlayer() {
      try {
        const response = await fetch(`/api/players/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Player not found')
        }

        const data = await response.json()
        const playerData = data.data
        setPlayer(playerData)
        
        // Initialize form
        setName(playerData.name)
        setNumber(playerData.number || '')
        setPosition(playerData.position || '')
        setAttributes(playerData.attributes || attributes)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load player')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayer()
  }, [params.id])

  const handleSave = async () => {
    if (!name.trim()) return

    setSaving(true)
    try {
      const response = await fetch(`/api/players/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          number: number === '' ? null : number,
          position: position.trim() || null,
          attributes,
        }),
      })

      if (response.ok) {
        router.push(`/players/${params.id}`)
      } else {
        setError('Failed to update player')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update player')
    } finally {
      setSaving(false)
    }
  }

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
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/players')} className="w-full">
              Back to Players
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Player</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/players/${params.id}`)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Player Name *
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter player name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jersey Number
                </label>
                <Input
                  type="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="Jersey number"
                  min="0"
                  max="99"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select position</option>
                  <option value="PG">Point Guard (PG)</option>
                  <option value="SG">Shooting Guard (SG)</option>
                  <option value="SF">Small Forward (SF)</option>
                  <option value="PF">Power Forward (PF)</option>
                  <option value="C">Center (C)</option>
                  <option value="G">Guard (G)</option>
                  <option value="F">Forward (F)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Attributes */}
          <Card>
            <CardHeader>
              <CardTitle>Player Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(attributes).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()} ({value})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={value}
                    onChange={(e) => setAttributes(prev => ({
                      ...prev,
                      [key]: parseInt(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>100</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}