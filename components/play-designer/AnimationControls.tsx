'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Settings,
  Clock,
  Users,
  Zap
} from 'lucide-react'
import {
  AnimationSequence,
  AnimationPlayback,
  AnimationFrame,
  Keyframe
} from '@/modules/plays/types/animation'

interface AnimationControlsProps {
  animationSequence: AnimationSequence
  playback: AnimationPlayback
  currentFrame?: AnimationFrame
  onPlaybackChange: (playback: AnimationPlayback) => void
  onSeek: (timestamp: number) => void
  className?: string
}

export function AnimationControls({
  animationSequence,
  playback,
  currentFrame,
  onPlaybackChange,
  onSeek,
  className
}: AnimationControlsProps) {
  const [showSettings, setShowSettings] = useState(false)

  /**
   * Format time in MM:SS format
   */
  const formatTime = useCallback((milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  /**
   * Get the current keyframe
   */
  const getCurrentKeyframe = useCallback((): Keyframe | null => {
    if (!animationSequence.keyframes || animationSequence.keyframes.length === 0) {
      return null
    }

    // Find the keyframe closest to current time
    let closestKeyframe = animationSequence.keyframes[0]
    let minDiff = Math.abs(closestKeyframe.timestamp - playback.currentTime)

    for (const keyframe of animationSequence.keyframes) {
      const diff = Math.abs(keyframe.timestamp - playback.currentTime)
      if (diff < minDiff) {
        minDiff = diff
        closestKeyframe = keyframe
      }
    }

    // Only return keyframe if we're very close to it (within 500ms)
    return minDiff <= 500 ? closestKeyframe : null
  }, [animationSequence.keyframes, playback.currentTime])

  /**
   * Handle play/pause toggle
   */
  const handlePlayPause = () => {
    onPlaybackChange({
      ...playback,
      isPlaying: !playback.isPlaying
    })
  }

  /**
   * Handle restart
   */
  const handleRestart = () => {
    onPlaybackChange({
      ...playback,
      currentTime: 0,
      isPlaying: false
    })
    onSeek(0)
  }

  /**
   * Handle speed change
   */
  const handleSpeedChange = (speed: number) => {
    onPlaybackChange({
      ...playback,
      playbackSpeed: speed
    })
  }

  /**
   * Handle loop toggle
   */
  const handleLoopToggle = () => {
    onPlaybackChange({
      ...playback,
      loop: !playback.loop
    })
  }

  /**
   * Skip to previous keyframe
   */
  const handlePreviousKeyframe = () => {
    if (!animationSequence.keyframes || animationSequence.keyframes.length === 0) {
      return
    }

    const currentTime = playback.currentTime
    const previousKeyframes = animationSequence.keyframes
      .filter(kf => kf.timestamp < currentTime)
      .sort((a, b) => b.timestamp - a.timestamp)

    if (previousKeyframes.length > 0) {
      const targetTime = previousKeyframes[0].timestamp
      onPlaybackChange({ ...playback, currentTime: targetTime })
      onSeek(targetTime)
    }
  }

  /**
   * Skip to next keyframe
   */
  const handleNextKeyframe = () => {
    if (!animationSequence.keyframes || animationSequence.keyframes.length === 0) {
      return
    }

    const currentTime = playback.currentTime
    const nextKeyframes = animationSequence.keyframes
      .filter(kf => kf.timestamp > currentTime)
      .sort((a, b) => a.timestamp - b.timestamp)

    if (nextKeyframes.length > 0) {
      const targetTime = nextKeyframes[0].timestamp
      onPlaybackChange({ ...playback, currentTime: targetTime })
      onSeek(targetTime)
    }
  }

  /**
   * Handle timeline scrubbing
   */
  const handleTimelineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const timestamp = parseInt(event.target.value)
    onPlaybackChange({ ...playback, currentTime: timestamp })
    onSeek(timestamp)
  }

  const currentKeyframe = getCurrentKeyframe()
  const progress = (playback.currentTime / animationSequence.duration) * 100

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Animation Controls
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(animationSequence.duration)}
            </Badge>
            {currentFrame && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {currentFrame.players.length} players
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Status */}
        {currentKeyframe && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-800">
              {currentKeyframe.name}
            </div>
            {currentKeyframe.description && (
              <div className="text-xs text-blue-600 mt-1">
                {currentKeyframe.description}
              </div>
            )}
          </div>
        )}

        {/* Timeline Scrubber */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{formatTime(playback.currentTime)}</span>
            <span>{formatTime(animationSequence.duration)}</span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min={0}
              max={animationSequence.duration}
              value={playback.currentTime}
              onChange={handleTimelineChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
              }}
            />
            
            {/* Keyframe markers */}
            {animationSequence.keyframes?.map(keyframe => {
              const position = (keyframe.timestamp / animationSequence.duration) * 100
              return (
                <div
                  key={keyframe.id}
                  className="absolute top-0 w-1 h-2 bg-yellow-500 rounded cursor-pointer"
                  style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                  title={keyframe.name}
                  onClick={() => onSeek(keyframe.timestamp)}
                />
              )
            })}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousKeyframe}
            title="Previous Keyframe"
            disabled={!animationSequence.keyframes || animationSequence.keyframes.length === 0}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handlePlayPause}
            className="w-12 h-12"
            title={playback.isPlaying ? 'Pause' : 'Play'}
          >
            {playback.isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextKeyframe}
            title="Next Keyframe"
            disabled={!animationSequence.keyframes || animationSequence.keyframes.length === 0}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">Speed:</span>
          {[0.25, 0.5, 1, 1.5, 2].map(speed => (
            <Button
              key={speed}
              variant={playback.playbackSpeed === speed ? "default" : "outline"}
              size="sm"
              onClick={() => handleSpeedChange(speed)}
              className="px-2 py-1 text-xs"
            >
              {speed}x
            </Button>
          ))}
        </div>

        {/* Loop Control */}
        <div className="flex items-center justify-center">
          <Button
            variant={playback.loop ? "default" : "outline"}
            size="sm"
            onClick={handleLoopToggle}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Loop
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium mb-3">Animation Settings</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Show Trails:</span>
                <Badge variant={animationSequence.settings.showTrails ? "default" : "secondary"}>
                  {animationSequence.settings.showTrails ? "On" : "Off"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Trail Length:</span>
                <Badge variant="outline">
                  {animationSequence.settings.trailLength}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>FPS:</span>
                <Badge variant="outline">
                  {animationSequence.settings.fps}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Highlight Active:</span>
                <Badge variant={animationSequence.settings.highlightActivePlayer ? "default" : "secondary"}>
                  {animationSequence.settings.highlightActivePlayer ? "On" : "Off"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {showSettings && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Debug Info</h4>
            <div className="space-y-1 text-xs bg-gray-50 p-2 rounded">
              <div>Total Frames: {animationSequence.frames?.length || 0}</div>
              <div>Total Keyframes: {animationSequence.keyframes?.length || 0}</div>
              {currentFrame && (
                <>
                  <div>Current Time: {currentFrame.timestamp.toFixed(1)}ms</div>
                  <div>Active Actions: {currentFrame.actions.length}</div>
                  <div>Players Moving: {currentFrame.players.filter(p => p.highlight).length}</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Keyframes List */}
        {animationSequence.keyframes && animationSequence.keyframes.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Keyframes</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {animationSequence.keyframes.map(keyframe => (
                <div
                  key={keyframe.id}
                  className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                    currentKeyframe?.id === keyframe.id
                      ? 'bg-blue-100 border border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => onSeek(keyframe.timestamp)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{keyframe.name}</span>
                    <span className="text-gray-500">
                      {formatTime(keyframe.timestamp)}
                    </span>
                  </div>
                  {keyframe.description && (
                    <div className="text-gray-600 mt-1">
                      {keyframe.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}