'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  AlertCircle, 
  Download, 
  Share2, 
  Settings2,
  Loader2 
} from 'lucide-react'
import { AnimationEngine } from './AnimationEngine'
import { AnimationControls } from './AnimationControls'
import { AnimationViewer } from './AnimationViewer'
import { VideoExporter } from './VideoExporter'
import { AnimationStudyTools } from './AnimationStudyTools'
import {
  AnimationSequence,
  AnimationPlayback,
  AnimationFrame,
  DEFAULT_ANIMATION_SETTINGS
} from '@/modules/plays/types/animation'

interface AnimationPlayerProps {
  playId: string
  animationSequence?: AnimationSequence
  width?: number
  height?: number
  showControls?: boolean
  className?: string
  onFrameChange?: (frame: AnimationFrame | null) => void
  onExport?: () => void
  onShare?: () => void
}

export function AnimationPlayer({
  playId,
  animationSequence: initialAnimation,
  width = 800,
  height = 600,
  showControls = true,
  className,
  onFrameChange,
  onExport,
  onShare
}: AnimationPlayerProps) {
  const [animationSequence, setAnimationSequence] = useState<AnimationSequence | null>(initialAnimation || null)
  const [loading, setLoading] = useState(!initialAnimation)
  const [error, setError] = useState<string | null>(null)
  const [currentFrame, setCurrentFrame] = useState<AnimationFrame | null>(null)
  const [playback, setPlayback] = useState<AnimationPlayback>({
    isPlaying: false,
    currentTime: 0,
    playbackSpeed: 1.0,
    direction: 'forward',
    loop: false
  })

  /**
   * Load animation sequence from API
   */
  const loadAnimation = useCallback(async () => {
    if (initialAnimation) {
      setAnimationSequence(initialAnimation)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/plays/${playId}/animation`)
      
      if (!response.ok) {
        if (response.status === 404) {
          // No animation exists yet - create a default one
          await createDefaultAnimation()
          return
        }
        throw new Error('Failed to load animation')
      }

      const result = await response.json()
      if (result.success && result.data) {
        setAnimationSequence(result.data)
      } else {
        throw new Error(result.error || 'Invalid animation data')
      }
    } catch (err) {
      console.error('Error loading animation:', err)
      setError(err instanceof Error ? err.message : 'Failed to load animation')
    } finally {
      setLoading(false)
    }
  }, [playId, initialAnimation])

  /**
   * Create default animation for the play
   */
  const createDefaultAnimation = useCallback(async () => {
    try {
      const response = await fetch(`/api/plays/${playId}/animation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Default Animation',
          description: 'Auto-generated animation sequence',
          duration: 10000, // 10 seconds default
          settings: DEFAULT_ANIMATION_SETTINGS
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create default animation')
      }

      const result = await response.json()
      if (result.success && result.data) {
        setAnimationSequence(result.data)
      } else {
        throw new Error(result.error || 'Failed to create animation')
      }
    } catch (err) {
      console.error('Error creating default animation:', err)
      setError(err instanceof Error ? err.message : 'Failed to create animation')
    }
  }, [playId])

  /**
   * Handle playback changes
   */
  const handlePlaybackChange = useCallback((newPlayback: AnimationPlayback) => {
    setPlayback(newPlayback)
  }, [])

  /**
   * Handle seeking to specific timestamp
   */
  const handleSeek = useCallback((timestamp: number) => {
    setPlayback(prev => ({
      ...prev,
      currentTime: Math.max(0, Math.min(timestamp, animationSequence?.duration || 0))
    }))
  }, [animationSequence?.duration])

  /**
   * Handle frame changes from animation engine
   */
  const handleFrameChange = useCallback((frame: AnimationFrame) => {
    setCurrentFrame(frame)
    onFrameChange?.(frame)
  }, [onFrameChange])

  /**
   * Handle animation export
   */
  const handleExport = useCallback(async (options?: any) => {
    if (!animationSequence) return
    
    try {
      // Export video using the VideoExporter component functionality
      console.log('Exporting animation:', animationSequence.id, 'with options:', options)
      onExport?.()
    } catch (err) {
      console.error('Export failed:', err)
    }
  }, [animationSequence, onExport])

  /**
   * Handle animation sharing
   */
  const handleShare = useCallback(async () => {
    if (!animationSequence) return
    
    // TODO: Implement animation sharing
    console.log('Sharing animation:', animationSequence.id)
    onShare?.()
  }, [animationSequence, onShare])

  // Load animation on mount
  useEffect(() => {
    loadAnimation()
  }, [loadAnimation])

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading animation...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadAnimation}
                className="ml-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // No animation state
  if (!animationSequence) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Animation Available
            </h3>
            <p className="text-gray-600 mb-4">
              This play doesn't have an animation sequence yet.
            </p>
            <Button onClick={createDefaultAnimation}>
              Create Animation
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Animation Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                {animationSequence.name}
              </CardTitle>
              {animationSequence.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {animationSequence.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {Math.round(animationSequence.duration / 1000)}s
              </Badge>
              <Badge variant="outline">
                {animationSequence.frames?.length || 0} frames
              </Badge>
              <Badge variant="outline">
                {animationSequence.keyframes?.length || 0} keyframes
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Animation Player */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Animation Viewer */}
        <div className="lg:col-span-2">
          <AnimationViewer
            animationSequence={animationSequence}
            playback={playback}
            onPlaybackChange={handlePlaybackChange}
            currentFrame={currentFrame || undefined}
            onFrameChange={(frame) => handleFrameChange(frame || null)}
            width={width}
            height={height}
          />
        </div>

        {/* Right Sidebar - Controls */}
        <div className="space-y-4 max-h-screen overflow-y-auto">
          {/* Animation Controls */}
          {showControls && (
            <AnimationControls
              animationSequence={animationSequence}
              playback={playback}
              currentFrame={currentFrame || undefined}
              onPlaybackChange={handlePlaybackChange}
              onSeek={handleSeek}
            />
          )}

          {/* Current Frame Info - Compact */}
          {currentFrame && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Frame Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-medium text-blue-800">{currentFrame.players.length}</div>
                    <div className="text-xs text-blue-600">Players</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-medium text-green-800">{currentFrame.actions.length}</div>
                    <div className="text-xs text-green-600">Actions</div>
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {Math.round(currentFrame.timestamp / 1000)}s
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons - Compact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleShare}
                disabled={!animationSequence}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {/* TODO: Open animation editor */}}
                disabled={!animationSequence}
              >
                <Settings2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section - Study Tools and Export */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Video Export */}
        {animationSequence && (
          <VideoExporter
            animationSequence={animationSequence}
            onExport={handleExport}
          />
        )}

        {/* Study Tools */}
        <AnimationStudyTools
          animationSequence={animationSequence}
          currentFrame={currentFrame || undefined}
          onBookmarkAdd={(bookmark) => console.log('Bookmark added:', bookmark)}
          onAnnotationAdd={(annotation) => console.log('Annotation added:', annotation)}
        />
      </div>
    </div>
  )
}