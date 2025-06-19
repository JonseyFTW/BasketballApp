'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/layout'
import { PlayDesigner } from '@/components/play-designer/PlayDesigner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlayWithRelations } from '@/modules/plays/types'
import { ExportMenu } from '@/components/ui/export-menu'

interface PlayDetailPageProps {
  params: { id: string }
}

export default function PlayDetailPage({ params }: PlayDetailPageProps) {
  const [play, setPlay] = useState<PlayWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchPlay() {
      try {
        const response = await fetch(`/api/plays/${params.id}?includeRelations=true`)
        
        if (!response.ok) {
          throw new Error('Play not found')
        }

        const data = await response.json()
        setPlay(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load play')
      } finally {
        setLoading(false)
      }
    }

    fetchPlay()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading play...</p>
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
              {error || 'This play is no longer available.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              The play you're looking for might have been removed or you don't have access to it.
            </p>
            <Button onClick={() => router.back()} variant="outline" className="w-full mb-2">
              Go Back
            </Button>
            <Button onClick={() => router.push('/plays')} className="w-full">
              Browse All Plays
            </Button>
          </CardContent>
        </Card>
      </div>
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
              <h1 className="text-2xl font-bold text-gray-900">{play.title}</h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span>Created by {play.author.name || play.author.email}</span>
                <span>•</span>
                <span>{new Date(play.createdAt).toLocaleDateString()}</span>
                {play.updatedAt !== play.createdAt && (
                  <>
                    <span>•</span>
                    <span>Updated {new Date(play.updatedAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push(`/designer?playId=${play.id}`)}
            >
              ✏️ Edit
            </Button>
            <ExportMenu play={play} />
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              🖨️ Print
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-6">
          {/* Play Info Sidebar */}
          <div className="w-80 bg-white rounded-lg border border-gray-200 p-6">
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

              {/* Play Statistics */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Statistics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-semibold text-gray-900">{play.views || 0}</div>
                    <div className="text-xs text-gray-600">Views</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-semibold text-gray-900">{play.shares || 0}</div>
                    <div className="text-xs text-gray-600">Shares</div>
                  </div>
                </div>
              </div>

              {/* Related Plays */}
              {play.relationsFrom.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Related Plays</h3>
                  <div className="space-y-2">
                    {play.relationsFrom.map((relation) => (
                      <div key={relation.id} className="text-sm">
                        <span className="font-medium">{relation.relationType}:</span>{' '}
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-gray-600 hover:text-blue-600"
                          onClick={() => router.push(`/plays/${relation.relatedPlay.id}`)}
                        >
                          {relation.relatedPlay.title}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      // Could add toast notification here
                    }}
                  >
                    📋 Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/share/create?playId=${play.id}`)}
                  >
                    🔗 Create Share Link
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Play Designer */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <PlayDesigner
              initialDiagram={play.diagramJSON as any}
              readOnly={true}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}