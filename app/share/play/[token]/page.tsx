'use client'

import { useEffect, useState } from 'react'
import { PlayDesigner } from '@/components/play-designer/PlayDesigner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlayWithRelations } from '@/modules/plays/types'
import { ExportMenu } from '@/components/ui/export-menu'

interface SharedPlayPageProps {
  params: { token: string }
}

export default function SharedPlayPage({ params }: SharedPlayPageProps) {
  const [play, setPlay] = useState<PlayWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSharedPlay() {
      try {
        const response = await fetch(`/api/share/play/${params.token}`)
        
        if (!response.ok) {
          throw new Error('Play not found or link has expired')
        }

        const data = await response.json()
        setPlay(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shared play')
      } finally {
        setLoading(false)
      }
    }

    fetchSharedPlay()
  }, [params.token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shared play...</p>
        </div>
      </div>
    )
  }

  if (error || !play) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Play Not Found</CardTitle>
            <CardDescription>
              {error || 'This shared play is no longer available.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              The play you're looking for might have been removed or the share link has expired.
            </p>
            <Button onClick={() => window.close()} variant="outline" className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{play.title}</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span>Shared by {play.author.name || play.author.email}</span>
              <span>•</span>
              <span>Created {new Date(play.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ExportMenu play={play} />
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              🖨️ Print
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex">
        {/* Play Info Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <div className="space-y-6">
            {/* Description */}
            {play.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-600">{play.description}</p>
              </div>
            )}

            {/* Tags */}
            {play.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {play.tags.map((tag) => (
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
                  ))}
                </div>
              </div>
            )}

            {/* Related Plays */}
            {play.relationsFrom.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Related Plays</h3>
                <div className="space-y-2">
                  {play.relationsFrom.map((relation) => (
                    <div key={relation.id} className="text-sm">
                      <span className="font-medium">{relation.relationType}:</span>{' '}
                      <span className="text-gray-600">{relation.relatedPlay.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Watermark */}
            <div className="pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl mb-2">🏀</div>
                <p className="text-xs text-gray-500">
                  Created with Basketball Coach App
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Play Designer */}
        <div className="flex-1">
          <PlayDesigner
            initialDiagram={play.diagramJSON as any}
            readOnly={true}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 text-center">
        <p className="text-sm text-gray-600">
          This is a shared basketball play. Visit{' '}
          <a href="/" className="text-blue-600 hover:text-blue-500 font-medium">
            Basketball Coach App
          </a>{' '}
          to create your own plays.
        </p>
      </div>
    </div>
  )
}