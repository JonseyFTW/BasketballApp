'use client'

import { useState, useEffect } from 'react'
import { DefenseType, GameSituation } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Target, Users, Zap, ChevronRight, Star, RotateCcw, Settings } from 'lucide-react'
import { DefenseTypeInfo, GameSituationInfo, LiveRecommendationResponse } from '@/modules/live/types'
import Link from 'next/link'

export default function LiveDashboard() {
  const [selectedDefense, setSelectedDefense] = useState<DefenseType | null>(null)
  const [selectedSituation, setSelectedSituation] = useState<GameSituation | null>(null)
  const [recommendations, setRecommendations] = useState<LiveRecommendationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [gameContext, setGameContext] = useState({
    quarter: 1,
    timeLeft: 720, // 12 minutes in seconds
    score: { us: 0, them: 0 },
    timeouts: { us: 4, them: 4 }
  })

  // Handle URL parameters for defense selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const defenseParam = urlParams.get('defense') as DefenseType
    if (defenseParam && Object.values(DefenseType).includes(defenseParam)) {
      setSelectedDefense(defenseParam)
    }
  }, [])

  const getRecommendations = async () => {
    if (!selectedDefense) return

    setLoading(true)
    try {
      const response = await fetch('/api/live/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defenseType: selectedDefense,
          situation: selectedSituation,
          timeLeft: gameContext.timeLeft,
          score: gameContext.score,
          quarter: gameContext.quarter,
          maxResults: 8
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setRecommendations(result.data)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedDefense) {
      getRecommendations()
    }
  }, [selectedDefense, selectedSituation])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDefenseCategoryColor = (category: string) => {
    const colors = {
      man: 'bg-blue-100 text-blue-800 border-blue-300',
      zone: 'bg-green-100 text-green-800 border-green-300',
      pressure: 'bg-red-100 text-red-800 border-red-300',
      specialty: 'bg-purple-100 text-purple-800 border-purple-300',
      transition: 'bg-orange-100 text-orange-800 border-orange-300'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getScoreStatus = () => {
    const diff = gameContext.score.us - gameContext.score.them
    if (diff > 10) return { text: `Leading by ${diff}`, color: 'text-green-600' }
    if (diff > 3) return { text: `Leading by ${diff}`, color: 'text-green-500' }
    if (diff < -10) return { text: `Down by ${Math.abs(diff)}`, color: 'text-red-600' }
    if (diff < -3) return { text: `Down by ${Math.abs(diff)}`, color: 'text-red-500' }
    return { text: diff === 0 ? 'Tied' : `${diff > 0 ? '+' : ''}${diff}`, color: 'text-yellow-600' }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Coaching</h1>
              <p className="text-gray-600 mt-1">Real-time play recommendations during games</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Game Context Bar */}
          <Card className="bg-white border-2">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Q{gameContext.quarter}</div>
                    <div className="font-semibold">{formatTime(gameContext.timeLeft)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-500">Score</div>
                    <div className="font-semibold">
                      {gameContext.score.us}-{gameContext.score.them}
                      <span className={`ml-2 text-sm ${getScoreStatus().color}`}>
                        {getScoreStatus().text}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-500">Timeouts</div>
                    <div className="font-semibold">{gameContext.timeouts.us} vs {gameContext.timeouts.them}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="font-semibold">
                      {gameContext.timeLeft < 120 ? 'End Game' : 
                       gameContext.timeLeft < 300 ? 'Crunch Time' : 'Regular'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Defense Selection */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Select Opponent Defense
                </CardTitle>
                <CardDescription>
                  Choose the defense type the opponent is playing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/live/defense-select">
                  <Button 
                    className="w-full h-16 text-lg"
                    variant={selectedDefense ? "default" : "outline"}
                  >
                    {selectedDefense ? (
                      <div className="text-center">
                        <div className="font-semibold">{selectedDefense.replace(/_/g, ' ')}</div>
                        <div className="text-sm opacity-80">Click to change</div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Target className="w-6 h-6" />
                        Choose Defense Type
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </Link>

                {selectedSituation && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-800">
                      Situation: {selectedSituation.replace(/_/g, ' ')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Situations */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Game Situations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: null, label: 'General' },
                    { key: GameSituation.BLOB, label: 'BLOB' },
                    { key: GameSituation.SLOB, label: 'SLOB' },
                    { key: GameSituation.END_GAME, label: 'End Game' },
                    { key: GameSituation.LAST_SHOT, label: 'Last Shot' },
                    { key: GameSituation.QUICK_SCORE, label: 'Quick Score' }
                  ].map((situation) => (
                    <Button
                      key={situation.key || 'general'}
                      variant={selectedSituation === situation.key ? "default" : "outline"}
                      size="sm"
                      className="h-10"
                      onClick={() => setSelectedSituation(situation.key)}
                    >
                      {situation.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Play Recommendations */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Recommended Plays
                  {recommendations && (
                    <Badge variant="secondary" className="ml-2">
                      {recommendations.recommendations.length} plays
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Plays optimized for the selected defense type
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedDefense ? (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select a Defense Type
                    </h3>
                    <p className="text-gray-600">
                      Choose the opponent's defense to get play recommendations
                    </p>
                  </div>
                ) : loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Getting recommendations...</p>
                  </div>
                ) : recommendations ? (
                  <div className="space-y-3">
                    {recommendations.recommendations.map((rec, index) => (
                      <Link key={rec.play.id} href={`/live/plays/${rec.play.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                    #{index + 1}
                                  </Badge>
                                  <h4 className="font-semibold text-lg">{rec.play.title}</h4>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-sm font-medium">{rec.overallRating.toFixed(1)}</span>
                                  </div>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-2">{rec.play.description}</p>
                                
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {rec.play.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag.id} variant="secondary" className="text-xs">
                                      {tag.name}
                                    </Badge>
                                  ))}
                                </div>

                                <div className="text-xs text-gray-500">
                                  <strong>Why:</strong> {rec.reasoning.slice(0, 2).join(', ')}
                                </div>
                              </div>
                              
                              <div className="text-right ml-4">
                                <div className="text-sm text-gray-500 mb-1">
                                  Confidence: {(rec.confidence * 100).toFixed(0)}%
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No recommendations available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}