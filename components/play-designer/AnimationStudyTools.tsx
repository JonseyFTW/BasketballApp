'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { 
  BookmarkPlus,
  MessageSquare,
  Clock,
  Target,
  Users,
  Activity,
  Plus,
  Trash2,
  Eye,
  Save
} from 'lucide-react'
import {
  AnimationSequence,
  AnimationFrame,
  AnimationBookmark,
  AnimationAnnotation
} from '@/modules/plays/types/animation'

interface AnimationStudyToolsProps {
  animationSequence: AnimationSequence
  currentFrame?: AnimationFrame
  onBookmarkAdd?: (bookmark: Omit<AnimationBookmark, 'id'>) => void
  onAnnotationAdd?: (annotation: Omit<AnimationAnnotation, 'id'>) => void
  className?: string
}

export function AnimationStudyTools({
  animationSequence,
  currentFrame,
  onBookmarkAdd,
  onAnnotationAdd,
  className
}: AnimationStudyToolsProps) {
  const [bookmarks, setBookmarks] = useState<AnimationBookmark[]>([])
  const [annotations, setAnnotations] = useState<AnimationAnnotation[]>([])
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'annotations' | 'analysis'>('bookmarks')
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('')
  const [newAnnotationText, setNewAnnotationText] = useState('')

  const handleAddBookmark = useCallback(() => {
    if (!currentFrame || !newBookmarkTitle.trim()) return

    const bookmark: Omit<AnimationBookmark, 'id'> = {
      timestamp: currentFrame.timestamp,
      title: newBookmarkTitle.trim(),
      description: `Frame at ${Math.round(currentFrame.timestamp / 1000)}s`,
      category: 'key_moment'
    }

    setBookmarks(prev => [...prev, { ...bookmark, id: Date.now().toString() }])
    onBookmarkAdd?.(bookmark)
    setNewBookmarkTitle('')
  }, [currentFrame, newBookmarkTitle, onBookmarkAdd])

  const handleAddAnnotation = useCallback(() => {
    if (!currentFrame || !newAnnotationText.trim()) return

    const annotation: Omit<AnimationAnnotation, 'id'> = {
      timestamp: currentFrame.timestamp,
      text: newAnnotationText.trim(),
      type: 'observation',
      position: currentFrame.players[0]?.position // Default to first player position
    }

    setAnnotations(prev => [...prev, { ...annotation, id: Date.now().toString() }])
    onAnnotationAdd?.(annotation)
    setNewAnnotationText('')
  }, [currentFrame, newAnnotationText, onAnnotationAdd])

  const getCurrentTimestamp = () => {
    return currentFrame ? Math.round(currentFrame.timestamp / 1000) : 0
  }

  const getFrameAnalysis = () => {
    if (!currentFrame) return null

    const activeActions = currentFrame.actions.length
    const activePlayers = currentFrame.players.length
    const playerMovements = currentFrame.players.filter(p => p.velocity && (p.velocity.x !== 0 || p.velocity.y !== 0)).length

    return {
      activeActions,
      activePlayers,
      playerMovements,
      timestamp: currentFrame.timestamp
    }
  }

  const analysis = getFrameAnalysis()

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Animation Study Tools
          </CardTitle>
          
          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4">
            <Button
              variant={activeTab === 'bookmarks' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('bookmarks')}
            >
              <BookmarkPlus className="w-4 h-4 mr-2" />
              Bookmarks
            </Button>
            <Button
              variant={activeTab === 'annotations' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('annotations')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Annotations
            </Button>
            <Button
              variant={activeTab === 'analysis' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('analysis')}
            >
              <Target className="w-4 h-4 mr-2" />
              Analysis
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Frame Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Current Frame</span>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {getCurrentTimestamp()}s
              </Badge>
            </div>
            
            {analysis && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium">{analysis.activePlayers}</div>
                  <div className="text-gray-600">Players</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{analysis.activeActions}</div>
                  <div className="text-gray-600">Actions</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{analysis.playerMovements}</div>
                  <div className="text-gray-600">Moving</div>
                </div>
              </div>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-4">
              {/* Add Bookmark */}
              <div className="space-y-2">
                <Input
                  placeholder="Bookmark title..."
                  value={newBookmarkTitle}
                  onChange={(e) => setNewBookmarkTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddBookmark()}
                />
                <Button
                  onClick={handleAddBookmark}
                  disabled={!currentFrame || !newBookmarkTitle.trim()}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bookmark
                </Button>
              </div>

              {/* Bookmarks List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {bookmarks.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No bookmarks yet
                  </div>
                ) : (
                  bookmarks.map(bookmark => (
                    <div
                      key={bookmark.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{bookmark.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(bookmark.timestamp / 1000)}s
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{bookmark.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'annotations' && (
            <div className="space-y-4">
              {/* Add Annotation */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Add your observation or note..."
                  value={newAnnotationText}
                  onChange={(e) => setNewAnnotationText(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button
                  onClick={handleAddAnnotation}
                  disabled={!currentFrame || !newAnnotationText.trim()}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Annotation
                </Button>
              </div>

              {/* Annotations List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {annotations.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No annotations yet
                  </div>
                ) : (
                  annotations.map(annotation => (
                    <div
                      key={annotation.id}
                      className="p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(annotation.timestamp / 1000)}s
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {annotation.type}
                        </Badge>
                      </div>
                      <p className="text-sm">{annotation.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-4">
              {/* Frame Analysis */}
              {analysis && (
                <div className="space-y-3">
                  <h4 className="font-medium">Frame Analysis</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <div className="font-bold text-blue-800">{analysis.activePlayers}</div>
                      <div className="text-xs text-blue-600">Active Players</div>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <Activity className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <div className="font-bold text-green-800">{analysis.activeActions}</div>
                      <div className="text-xs text-green-600">Active Actions</div>
                    </div>
                    
                    <div className="p-3 bg-orange-50 rounded-lg text-center">
                      <Target className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                      <div className="font-bold text-orange-800">{analysis.playerMovements}</div>
                      <div className="text-xs text-orange-600">Players Moving</div>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <div className="font-bold text-purple-800">{getCurrentTimestamp()}s</div>
                      <div className="text-xs text-purple-600">Timestamp</div>
                    </div>
                  </div>

                  {/* Action Details */}
                  {currentFrame && currentFrame.actions.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Active Actions</h5>
                      <div className="space-y-2">
                        {currentFrame.actions.map(action => (
                          <div
                            key={action.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="capitalize text-sm">{action.type}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${action.progress * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600">
                                {Math.round(action.progress * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Play Statistics */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Animation Statistics</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span>Total Duration:</span>
                    <span>{Math.round(animationSequence.duration / 1000)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Frames:</span>
                    <span>{animationSequence.frames?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Keyframes:</span>
                    <span>{animationSequence.keyframes?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frame Rate:</span>
                    <span>{animationSequence.settings.fps}fps</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Study Tools Actions */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Study
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}