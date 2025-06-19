'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Play, PlayTag, PlayEffectiveness, DefenseType } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Star, Clock, Target, Users, Heart, Share2, Download, RotateCcw } from 'lucide-react'
import { Court } from '@/components/play-designer/Court'
import Link from 'next/link'

interface PlayWithRelations extends Play {
  tags: PlayTag[]
  effectiveness: PlayEffectiveness[]
  author: {
    name: string | null
  }
}

export default function LivePlayView() {
  const params = useParams()
  const router = useRouter()
  const [play, setPlay] = useState<PlayWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [courtSize, setCourtSize] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const fetchPlay = async () => {
      try {
        const response = await fetch(`/api/plays/${params.id}`)
        const result = await response.json()
        
        if (result.success) {
          setPlay(result.data)
        }
      } catch (error) {
        console.error('Error fetching play:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPlay()
    }
  }, [params.id])

  useEffect(() => {
    // Responsive court sizing for tablet optimization
    const updateCourtSize = () => {
      const container = document.getElementById('court-container')
      if (container) {
        const containerWidth = container.clientWidth
        const aspectRatio = 600 / 800 // height / width
        const maxWidth = Math.min(containerWidth - 32, 800)
        setCourtSize({
          width: maxWidth,
          height: maxWidth * aspectRatio
        })
      }
    }

    updateCourtSize()
    window.addEventListener('resize', updateCourtSize)
    return () => window.removeEventListener('resize', updateCourtSize)
  }, [])

  const getEffectivenessColor = (rating: number) => {
    if (rating >= 8.5) return 'text-green-600 bg-green-50 border-green-200'
    if (rating >= 7.0) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (rating >= 6.0) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 3) return 'Easy'
    if (difficulty <= 5) return 'Moderate'
    if (difficulty <= 7) return 'Hard'
    return 'Very Hard'
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-600'
    if (difficulty <= 5) return 'text-yellow-600'
    if (difficulty <= 7) return 'text-orange-600'
    return 'text-red-600'
  }

  const handleFavorite = () => {
    // Toggle favorite status
    setIsFavorited(!isFavorited)
    // TODO: Implement API call to save favorite
  }

  const handleShare = async () => {
    if (navigator.share && play) {
      try {
        await navigator.share({
          title: play.title,
          text: play.description || '',
          url: window.location.href
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading play...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!play) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Play not found</h3>
            <p className="text-gray-600 mb-4">The requested play could not be found.</p>
            <Link href="/live">
              <Button>Return to Live Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.back()}
                className="shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{play.title}</h1>
                <p className="text-sm text-gray-600">by {play.author.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFavorite}
                className={isFavorited ? 'text-red-600 border-red-300' : ''}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Court Diagram - Large for tablet viewing */}
          <div className="xl:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Play Diagram
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div id="court-container" className="w-full">
                  <div className="bg-gray-100 rounded-lg p-4" style={{ minHeight: '400px' }}>
                    <Court
                      width={courtSize.width}
                      height={courtSize.height}
                      players={(play.diagramJSON as any)?.players || []}
                      actions={(play.diagramJSON as any)?.actions || []}
                      readonly={true}
                      showGrid={false}
                    />
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Replay Animation
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Play Details */}
          <div className="xl:col-span-1 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{play.description}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {play.tags.map((tag) => (
                    <Badge 
                      key={tag.id} 
                      variant="secondary"
                      style={{ backgroundColor: tag.color + '20', color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Effectiveness Ratings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Effectiveness</CardTitle>
                <CardDescription>How well this play works against different defenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {play.effectiveness.map((eff) => (
                    <div key={eff.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="font-medium text-sm">
                          {eff.defenseType.replace(/_/g, ' ')}
                        </div>
                        {eff.notes && (
                          <div className="text-xs text-gray-500 mt-1">{eff.notes}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium border ${getEffectivenessColor(eff.rating)}`}>
                          <Star className="w-3 h-3 fill-current" />
                          {eff.rating.toFixed(1)}
                        </div>
                        <div className={`text-xs mt-1 ${getDifficultyColor(eff.difficulty)}`}>
                          {getDifficultyText(eff.difficulty)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Situations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Situations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {play.effectiveness
                    .filter(eff => eff.situation)
                    .map((eff) => (
                      <div key={eff.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">
                          {eff.situation?.replace(/_/g, ' ')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {eff.rating.toFixed(1)} rating
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(play.effectiveness.reduce((sum, eff) => sum + eff.rating, 0) / play.effectiveness.length).toFixed(1)}
                    </div>
                    <div className="text-xs text-blue-600">Avg Rating</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(play.effectiveness.reduce((sum, eff) => sum + eff.difficulty, 0) / play.effectiveness.length)}
                    </div>
                    <div className="text-xs text-green-600">Avg Difficulty</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}