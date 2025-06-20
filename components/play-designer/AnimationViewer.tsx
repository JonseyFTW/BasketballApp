'use client'

import React, { useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Box, 
  Monitor, 
  Camera, 
  RotateCcw,
  Loader2
} from 'lucide-react'
import { AnimationEngine } from './AnimationEngine'
import { Animation3D } from './Animation3D'
import {
  AnimationSequence,
  AnimationPlayback,
  AnimationFrame
} from '@/modules/plays/types/animation'

interface AnimationViewerProps {
  animationSequence: AnimationSequence
  playback: AnimationPlayback
  onPlaybackChange: (playback: AnimationPlayback) => void
  currentFrame?: AnimationFrame
  onFrameChange?: (frame: AnimationFrame | null) => void
  width?: number
  height?: number
  className?: string
}

type ViewMode = '2d' | '3d'
type CameraPreset = 'broadcast' | 'overhead' | 'courtside' | 'corner'

export function AnimationViewer({
  animationSequence,
  playback,
  onPlaybackChange,
  currentFrame,
  onFrameChange,
  width = 800,
  height = 600,
  className
}: AnimationViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('2d')
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('broadcast')

  const cameraPresets = [
    { id: 'broadcast', label: 'Broadcast', icon: Monitor },
    { id: 'overhead', label: 'Overhead', icon: Eye },
    { id: 'courtside', label: 'Courtside', icon: Camera },
    { id: 'corner', label: 'Corner', icon: Box }
  ] as const

  return (
    <div className={className}>
      {/* Compact View Controls */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === '2d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('2d')}
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  2D
                </Button>
                <Button
                  variant={viewMode === '3d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('3d')}
                >
                  <Box className="w-4 h-4 mr-1" />
                  3D
                </Button>
              </div>

              {/* Camera Presets (3D only) */}
              {viewMode === '3d' && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">Camera:</span>
                  {cameraPresets.map(preset => {
                    const Icon = preset.icon
                    return (
                      <Button
                        key={preset.id}
                        variant={cameraPreset === preset.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCameraPreset(preset.id)}
                        title={preset.label}
                        className="px-2"
                      >
                        <Icon className="w-3 h-3" />
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>

            <Badge variant="outline" className="text-xs">
              {viewMode === '2d' ? 'Top-down view' : `3D ${cameraPresets.find(p => p.id === cameraPreset)?.label}`}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Animation Display */}
      <Card>
        <CardContent className="p-4">
          <div className="w-full aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden">
            {viewMode === '2d' ? (
              <AnimationEngine
                animationSequence={animationSequence}
                width={width}
                height={height}
                playback={playback}
                onPlaybackChange={onPlaybackChange}
                onFrameChange={onFrameChange}
                className="w-full h-full"
              />
            ) : (
              <Suspense 
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Loading 3D view...</p>
                    </div>
                  </div>
                }
              >
                <Animation3D
                  animationSequence={animationSequence}
                  currentFrame={currentFrame}
                  cameraPreset={cameraPreset}
                  className="w-full h-full"
                />
              </Suspense>
            )}
          </div>

          {/* 3D Controls Info */}
          {viewMode === '3d' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">3D Navigation</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div><strong>Rotate:</strong> Left click + drag</div>
                <div><strong>Zoom:</strong> Mouse wheel or right click + drag</div>
                <div><strong>Pan:</strong> Middle click + drag</div>
                <div><strong>Reset:</strong> Use camera preset buttons above</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}