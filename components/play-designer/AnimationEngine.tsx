'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Circle, Line, Arrow, Text } from 'react-konva'
import { 
  AnimationSequence, 
  AnimationFrame, 
  AnimatedPlayer, 
  ActiveAction,
  AnimationPlayback,
  Position
} from '@/modules/plays/types/animation'
import Konva from 'konva'

interface AnimationEngineProps {
  animationSequence: AnimationSequence
  width: number
  height: number
  playback: AnimationPlayback
  onPlaybackChange: (playback: AnimationPlayback) => void
  onFrameChange?: (frame: AnimationFrame) => void
  className?: string
}

export function AnimationEngine({
  animationSequence,
  width,
  height,
  playback,
  onPlaybackChange,
  onFrameChange,
  className
}: AnimationEngineProps) {
  const animationRef = useRef<number>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentFrame, setCurrentFrame] = useState<AnimationFrame | null>(null)
  const [playerTrails, setPlayerTrails] = useState<Map<string, Position[]>>(new Map())
  const [canvasSize, setCanvasSize] = useState({ width, height })
  
  // Court dimensions
  const courtWidth = 800
  const courtHeight = 600
  const scaleX = canvasSize.width / courtWidth
  const scaleY = canvasSize.height / courtHeight

  // Handle responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const aspectRatio = courtWidth / courtHeight
        let newWidth = rect.width
        let newHeight = newWidth / aspectRatio
        
        // Ensure height doesn't exceed container
        if (newHeight > rect.height) {
          newHeight = rect.height
          newWidth = newHeight * aspectRatio
        }
        
        setCanvasSize({ width: newWidth, height: newHeight })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    
    // Also handle when container size changes
    const resizeObserver = new ResizeObserver(handleResize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    
    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
    }
  }, [])

  /**
   * Get the frame at a specific timestamp
   */
  const getFrameAtTime = useCallback((timestamp: number): AnimationFrame | null => {
    if (!animationSequence.frames || animationSequence.frames.length === 0) {
      return null
    }

    // Find the closest frame
    let closestFrame = animationSequence.frames[0]
    let minDiff = Math.abs(closestFrame.timestamp - timestamp)

    for (const frame of animationSequence.frames) {
      const diff = Math.abs(frame.timestamp - timestamp)
      if (diff < minDiff) {
        minDiff = diff
        closestFrame = frame
      }
    }

    return closestFrame
  }, [animationSequence.frames])

  /**
   * Update animation frame based on current time
   */
  const updateFrame = useCallback(() => {
    const frame = getFrameAtTime(playback.currentTime)
    if (frame) {
      setCurrentFrame(frame)
      onFrameChange?.(frame)

      // Update player trails if enabled
      if (animationSequence.settings.showTrails) {
        setPlayerTrails(prevTrails => {
          const newTrails = new Map(prevTrails)
          
          frame.players.forEach(player => {
            const trail = newTrails.get(player.id) || []
            const maxTrailLength = animationSequence.settings.trailLength || 5
            
            // Add current position to trail
            const newTrail = [...trail, player.position].slice(-maxTrailLength)
            newTrails.set(player.id, newTrail)
          })
          
          return newTrails
        })
      }
    }
  }, [playback.currentTime, getFrameAtTime, onFrameChange, animationSequence.settings])

  /**
   * Animation loop
   */
  const animate = useCallback(() => {
    if (!playback.isPlaying) return

    const deltaTime = 1000 / 60 // 60 FPS for smooth playback
    const timeStep = deltaTime * playback.playbackSpeed * (playback.direction === 'forward' ? 1 : -1)
    
    let newTime = playback.currentTime + timeStep

    // Handle looping
    if (playback.loop) {
      if (newTime >= animationSequence.duration) {
        newTime = 0
      } else if (newTime < 0) {
        newTime = animationSequence.duration
      }
    } else {
      // Clamp time and stop playback at boundaries
      if (newTime >= animationSequence.duration) {
        newTime = animationSequence.duration
        onPlaybackChange({ ...playback, isPlaying: false })
      } else if (newTime < 0) {
        newTime = 0
        onPlaybackChange({ ...playback, isPlaying: false })
      }
    }

    onPlaybackChange({ ...playback, currentTime: newTime })
    animationRef.current = requestAnimationFrame(animate)
  }, [playback, animationSequence.duration, onPlaybackChange])

  // Start/stop animation based on playback state
  useEffect(() => {
    if (playback.isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [playback.isPlaying, animate])

  // Update frame when time changes
  useEffect(() => {
    updateFrame()
  }, [updateFrame])

  /**
   * Render player trails
   */
  const renderPlayerTrails = () => {
    if (!animationSequence.settings.showTrails || !currentFrame) {
      return null
    }

    return Array.from(playerTrails.entries()).map(([playerId, trail]) => {
      if (trail.length < 2) return null

      const points = trail.flatMap(pos => [pos.x * scaleX, pos.y * scaleY])
      
      return (
        <Line
          key={`trail-${playerId}`}
          points={points}
          stroke="rgba(100, 100, 255, 0.5)"
          strokeWidth={2}
          lineCap="round"
          lineJoin="round"
        />
      )
    })
  }

  /**
   * Render players
   */
  const renderPlayers = () => {
    if (!currentFrame) return null

    return currentFrame.players.map(player => (
      <React.Fragment key={player.id}>
        {/* Player circle */}
        <Circle
          x={player.position.x * scaleX}
          y={player.position.y * scaleY}
          radius={20 * Math.min(scaleX, scaleY)}
          fill={player.highlight ? '#ff6b6b' : '#4dabf7'}
          stroke={player.highlight ? '#e03131' : '#339af0'}
          strokeWidth={2}
          opacity={player.opacity || 1}
          scaleX={(player.scale || 1)}
          scaleY={(player.scale || 1)}
        />
        
        {/* Player label */}
        <Text
          x={player.position.x * scaleX}
          y={player.position.y * scaleY}
          text={player.label}
          fontSize={14 * Math.min(scaleX, scaleY)}
          fill="white"
          fontStyle="bold"
          align="center"
          verticalAlign="middle"
          offsetX={7 * Math.min(scaleX, scaleY)}
          offsetY={7 * Math.min(scaleX, scaleY)}
        />
      </React.Fragment>
    ))
  }

  /**
   * Render active actions (passes, cuts, etc.)
   */
  const renderActions = () => {
    if (!currentFrame) return null

    return currentFrame.actions.map(action => {
      const fromPlayer = currentFrame.players.find(p => p.id === action.fromPlayer)
      if (!fromPlayer) return null

      let toPosition: Position
      if (action.toPlayer) {
        const toPlayer = currentFrame.players.find(p => p.id === action.toPlayer)
        if (!toPlayer) return null
        toPosition = toPlayer.position
      } else if (action.toPosition) {
        toPosition = action.toPosition
      } else {
        return null
      }

      // Calculate arrow position based on progress
      const startX = fromPlayer.position.x * scaleX
      const startY = fromPlayer.position.y * scaleY
      const endX = toPosition.x * scaleX
      const endY = toPosition.y * scaleY
      
      const currentX = startX + (endX - startX) * action.progress
      const currentY = startY + (endY - startY) * action.progress

      const color = action.style?.color || '#ff6b6b'
      const strokeWidth = (action.style?.strokeWidth || 3) * Math.min(scaleX, scaleY)

      return (
        <Arrow
          key={action.id}
          points={[startX, startY, currentX, currentY]}
          stroke={color}
          strokeWidth={strokeWidth}
          fill={color}
          pointerLength={10 * Math.min(scaleX, scaleY)}
          pointerWidth={8 * Math.min(scaleX, scaleY)}
          dash={action.style?.dashArray}
        />
      )
    })
  }

  /**
   * Render court background
   */
  const renderCourt = () => {
    const courtColor = '#f8f9fa'
    const lineColor = '#495057'
    const lineWidth = 2

    return (
      <>
        {/* Court background */}
        <Circle
          x={width / 2}
          y={height / 2}
          radius={Math.min(width, height) / 2}
          fill={courtColor}
          stroke={lineColor}
          strokeWidth={lineWidth}
        />
        
        {/* Center circle */}
        <Circle
          x={width / 2}
          y={height / 2}
          radius={50 * Math.min(scaleX, scaleY)}
          stroke={lineColor}
          strokeWidth={lineWidth}
        />
        
        {/* Three-point line (simplified) */}
        <Circle
          x={width / 2}
          y={height * 0.1}
          radius={140 * Math.min(scaleX, scaleY)}
          stroke={lineColor}
          strokeWidth={lineWidth}
        />
        
        {/* Key area */}
        <Line
          points={[
            (width / 2) - (80 * scaleX), height * 0.1,
            (width / 2) - (80 * scaleX), height * 0.4,
            (width / 2) + (80 * scaleX), height * 0.4,
            (width / 2) + (80 * scaleX), height * 0.1
          ]}
          stroke={lineColor}
          strokeWidth={lineWidth}
          closed={false}
        />
      </>
    )
  }

  return (
    <div ref={containerRef} className={`${className} w-full h-full flex items-center justify-center`}>
      <Stage width={canvasSize.width} height={canvasSize.height}>
        <Layer>
          {renderCourt()}
          {renderPlayerTrails()}
          {renderActions()}
          {renderPlayers()}
        </Layer>
      </Stage>
    </div>
  )
}