'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Play, AlertCircle, Loader2 } from 'lucide-react'
import { AnimationPlayer } from '@/components/play-designer/AnimationPlayer'
import { PlayWithRelations } from '@/modules/plays/types'

export default function PlayAnimationPage() {
  const router = useRouter()
  const params = useParams()
  const playId = params.id as string

  const [play, setPlay] = useState<PlayWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlay() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/plays/${playId}?includeRelations=true`)
        
        if (!response.ok) {
          throw new Error('Play not found')
        }

        const result = await response.json()
        if (result.success && result.data) {
          setPlay(result.data)
        } else {
          throw new Error(result.error || 'Invalid play data')
        }
      } catch (err) {
        console.error('Error fetching play:', err)
        setError(err instanceof Error ? err.message : 'Failed to load play')
      } finally {
        setLoading(false)
      }
    }

    if (playId) {
      fetchPlay()
    }
  }, [playId])

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading play...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  if (error || !play) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="py-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error || 'Play not found'}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.back()}
                    className="ml-2"
                  >
                    Go Back
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {play.title} - Animation
              </h1>
              {play.description && (
                <p className="text-gray-600 mt-1">{play.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/plays/${playId}`)}
            >
              View Play
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/plays/${playId}/edit`)}
            >
              Edit Play
            </Button>
          </div>
        </div>

        {/* Play Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Play Information
                </CardTitle>
                <CardDescription>
                  Basic information about this play
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Created by {play.author.name || play.author.email}
                </Badge>
                <Badge variant="outline">
                  {new Date(play.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {play.tags?.length > 0 ? (
                    play.tags.map(tag => (
                      <Badge key={tag.id} variant="secondary" style={{ backgroundColor: tag.color || undefined }}>
                        {tag.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No tags</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Related Plays</h4>
                <div className="text-sm text-gray-600">
                  {(play.relationsFrom?.length || 0) + (play.relationsTo?.length || 0)} relations
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
                <div className="text-sm text-gray-600">
                  {new Date(play.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Animation Player */}
        <AnimationPlayer
          playId={playId}
          width={800}
          height={600}
          showControls={true}
          onFrameChange={(frame) => {
            console.log('Frame changed:', frame)
          }}
          onExport={() => {
            console.log('Export animation')
          }}
          onShare={() => {
            console.log('Share animation')
          }}
        />

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Play Diagram Info */}
          <Card>
            <CardHeader>
              <CardTitle>Play Diagram</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {(() => {
                  const diagram = play.diagramJSON as any
                  return (
                    <>
                      <div className="flex justify-between">
                        <span>Players:</span>
                        <Badge variant="outline">
                          {diagram?.players?.length || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Actions:</span>
                        <Badge variant="outline">
                          {diagram?.actions?.length || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Court Dimensions:</span>
                        <Badge variant="outline">
                          {diagram?.courtDimensions?.width || 800} x {diagram?.courtDimensions?.height || 600}
                        </Badge>
                      </div>
                    </>
                  )
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Animation Features */}
          <Card>
            <CardHeader>
              <CardTitle>Animation Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Step-by-step player movement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Timing controls and scrubbing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Keyframe navigation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Variable playback speed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Player movement trails</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Video export (coming soon)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>3D visualization (coming soon)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}