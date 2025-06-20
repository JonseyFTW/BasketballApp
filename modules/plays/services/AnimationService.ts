import { prisma } from '@/lib/db'
import {
  AnimationSequence,
  AnimationFrame,
  MovementPath,
  AnimatedPlayer,
  Position,
  CreateAnimationDto,
  UpdateAnimationDto,
  DEFAULT_ANIMATION_SETTINGS,
  ANIMATION_CONSTRAINTS,
  ActionTimeline,
  TimedAction,
  Keyframe,
  AnimationSettings,
  ActiveAction
} from '../types/animation'
import { PlayDiagram, Player, PlayAction } from '../../common/types'
import { AppError, handleServiceError } from '../../common/utils'

export class AnimationService {
  
  /**
   * Create a new animation sequence for a play
   */
  async createAnimation(dto: CreateAnimationDto): Promise<AnimationSequence> {
    try {
      // Validate play exists
      const play = await prisma.play.findUnique({
        where: { id: dto.playId },
        select: { id: true, diagramJSON: true }
      })

      if (!play) {
        throw new AppError('Play not found', 404)
      }

      // Validate duration
      if (dto.duration < ANIMATION_CONSTRAINTS.minDuration || 
          dto.duration > ANIMATION_CONSTRAINTS.maxDuration) {
        throw new AppError(
          `Duration must be between ${ANIMATION_CONSTRAINTS.minDuration} and ${ANIMATION_CONSTRAINTS.maxDuration} milliseconds`,
          400
        )
      }

      // Generate default animation from play diagram
      const defaultAnimation = this.generateDefaultAnimation(
        play.diagramJSON as PlayDiagram,
        dto.duration
      )

      const animationSequence: AnimationSequence = {
        id: `anim_${Date.now()}`,
        playId: dto.playId,
        name: dto.name,
        description: dto.description,
        duration: dto.duration,
        frames: defaultAnimation.frames,
        keyframes: defaultAnimation.keyframes,
        settings: { ...DEFAULT_ANIMATION_SETTINGS, ...dto.settings }
      }

      // Save to database
      await prisma.playAnimation.create({
        data: {
          playId: dto.playId,
          name: dto.name,
          description: dto.description,
          duration: dto.duration,
          sequenceData: {
            frames: animationSequence.frames,
            keyframes: animationSequence.keyframes,
            movementPaths: defaultAnimation.movementPaths
          },
          settings: animationSequence.settings,
          isDefault: true
        }
      })

      return animationSequence
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  /**
   * Get animation sequence for a play
   */
  async getPlayAnimation(playId: string, animationId?: string): Promise<AnimationSequence | null> {
    try {
      const animation = await prisma.playAnimation.findFirst({
        where: {
          playId,
          ...(animationId ? { id: animationId } : { isDefault: true })
        }
      })

      if (!animation) {
        return null
      }

      const sequenceData = animation.sequenceData as any
      
      return {
        id: animation.id,
        playId: animation.playId,
        name: animation.name,
        description: animation.description || undefined,
        duration: animation.duration,
        frames: sequenceData.frames || [],
        keyframes: sequenceData.keyframes || [],
        settings: animation.settings as AnimationSettings
      }
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  /**
   * Generate default animation from a play diagram
   */
  private generateDefaultAnimation(diagram: PlayDiagram, duration: number) {
    const fps = DEFAULT_ANIMATION_SETTINGS.fps
    const totalFrames = Math.floor((duration / 1000) * fps)
    const frameInterval = 1000 / fps

    // Generate movement paths for each player
    const movementPaths = this.generateMovementPaths(diagram, duration)
    
    // Generate keyframes based on actions
    const keyframes = this.generateKeyframes(diagram, duration)
    
    // Generate frames
    const frames: AnimationFrame[] = []
    
    for (let i = 0; i <= totalFrames; i++) {
      const timestamp = i * frameInterval
      const frame = this.generateFrame(diagram, timestamp, movementPaths, duration)
      frames.push(frame)
    }

    return {
      frames,
      keyframes,
      movementPaths
    }
  }

  /**
   * Generate movement paths for players based on play actions
   */
  private generateMovementPaths(diagram: PlayDiagram, duration: number): MovementPath[] {
    const paths: MovementPath[] = []
    const actionDuration = duration * 0.8 // Actions take 80% of total time
    const setupTime = duration * 0.1 // 10% setup time
    
    // Process explicit actions first
    diagram.actions.forEach((action, index) => {
      const startTime = setupTime + (index * (actionDuration / diagram.actions.length))
      const endTime = startTime + (actionDuration / diagram.actions.length)

      if (action.type === 'cut' && action.from.playerId && action.to.x && action.to.y) {
        const player = diagram.players.find(p => p.id === action.from.playerId)
        if (player) {
          paths.push({
            playerId: action.from.playerId,
            startTime,
            endTime,
            startPosition: { x: player.x, y: player.y },
            endPosition: { x: action.to.x, y: action.to.y },
            type: 'linear',
            speed: 1.0
          })
        }
      }
    })

    // If no actions or very few movements, create default movements for demonstration
    if (paths.length === 0 && diagram.players.length > 0) {
      const demoMovements = this.generateDemoMovements(diagram.players, duration)
      paths.push(...demoMovements)
    }

    return paths
  }

  /**
   * Generate demo movements when no explicit actions exist
   */
  private generateDemoMovements(players: Player[], duration: number): MovementPath[] {
    const movements: MovementPath[] = []
    const startTime = duration * 0.2 // Start at 20% of animation
    const endTime = duration * 0.8   // End at 80% of animation
    
    players.forEach((player, index) => {
      // Create subtle movements for each player based on their position
      let endPosition: Position
      
      if (player.label === '1') {
        // Point guard - move towards the basket
        endPosition = { x: player.x, y: Math.max(player.y - 100, 100) }
      } else if (player.label === '2') {
        // Shooting guard - move to corner or wing
        endPosition = { x: player.x + 50, y: player.y + 30 }
      } else if (player.label === '3') {
        // Small forward - move to opposite wing
        endPosition = { x: player.x - 40, y: player.y + 50 }
      } else if (player.label === '4') {
        // Power forward - move closer to basket
        endPosition = { x: player.x + 30, y: Math.max(player.y - 50, 120) }
      } else if (player.label === '5') {
        // Center - move along the lane
        endPosition = { x: player.x - 20, y: Math.max(player.y - 40, 100) }
      } else {
        // Default movement - slight shift
        endPosition = { 
          x: player.x + (Math.random() - 0.5) * 60, 
          y: player.y + (Math.random() - 0.5) * 60 
        }
      }

      // Ensure positions stay within court bounds
      endPosition.x = Math.max(50, Math.min(750, endPosition.x))
      endPosition.y = Math.max(50, Math.min(550, endPosition.y))

      // Add staggered timing so players don't all move at once
      const playerStartTime = startTime + (index * 500) // 500ms delay between players
      const playerEndTime = Math.min(endTime, playerStartTime + 2000) // 2 second movement duration

      movements.push({
        playerId: player.id,
        startTime: playerStartTime,
        endTime: playerEndTime,
        startPosition: { x: player.x, y: player.y },
        endPosition,
        type: 'linear',
        speed: 1.0
      })
    })

    return movements
  }

  /**
   * Generate keyframes based on play actions
   */
  private generateKeyframes(diagram: PlayDiagram, duration: number): Keyframe[] {
    const keyframes: Keyframe[] = []
    
    // Start keyframe
    keyframes.push({
      id: 'start',
      timestamp: 0,
      name: 'Play Start',
      description: 'Initial setup',
      type: 'movement'
    })

    // Action keyframes
    const actionDuration = duration * 0.8
    const setupTime = duration * 0.1
    
    diagram.actions.forEach((action, index) => {
      const timestamp = setupTime + (index * (actionDuration / diagram.actions.length))
      
      keyframes.push({
        id: `action_${action.id}`,
        timestamp,
        name: `${action.type.charAt(0).toUpperCase() + action.type.slice(1)} Action`,
        description: `Player executes ${action.type}`,
        type: 'action'
      })
    })

    // End keyframe
    keyframes.push({
      id: 'end',
      timestamp: duration,
      name: 'Play Complete',
      description: 'Final positions',
      type: 'movement'
    })

    return keyframes
  }

  /**
   * Generate a single animation frame
   */
  private generateFrame(
    diagram: PlayDiagram,
    timestamp: number,
    movementPaths: MovementPath[],
    totalDuration: number
  ): AnimationFrame {
    const animatedPlayers: AnimatedPlayer[] = []
    const activeActions: ActiveAction[] = []

    // Calculate player positions based on movement paths
    diagram.players.forEach(player => {
      const activePath = movementPaths.find(
        path => path.playerId === player.id && 
        timestamp >= path.startTime && 
        timestamp <= path.endTime
      )

      let position: Position
      if (activePath) {
        // Interpolate position along the path
        const progress = (timestamp - activePath.startTime) / (activePath.endTime - activePath.startTime)
        position = this.interpolatePosition(activePath.startPosition, activePath.endPosition, progress)
      } else {
        // Use original position
        position = { x: player.x, y: player.y }
      }

      animatedPlayers.push({
        id: player.id,
        label: player.label,
        position,
        rotation: 0,
        scale: 1.0,
        opacity: 1.0,
        highlight: false
      })
    })

    // Calculate active actions
    const setupTime = totalDuration * 0.1
    const actionDuration = totalDuration * 0.8
    
    diagram.actions.forEach((action, index) => {
      const actionStartTime = setupTime + (index * (actionDuration / diagram.actions.length))
      const actionEndTime = actionStartTime + (actionDuration / diagram.actions.length)
      
      if (timestamp >= actionStartTime && timestamp <= actionEndTime) {
        const progress = (timestamp - actionStartTime) / (actionEndTime - actionStartTime)
        
        activeActions.push({
          id: action.id,
          type: action.type,
          fromPlayer: action.from.playerId || '',
          toPlayer: action.to.playerId,
          toPosition: action.to.x && action.to.y ? { x: action.to.x, y: action.to.y } : undefined,
          progress,
          style: action.style
        })
      }
    })

    return {
      timestamp,
      players: animatedPlayers,
      actions: activeActions
    }
  }

  /**
   * Interpolate between two positions
   */
  private interpolatePosition(start: Position, end: Position, progress: number): Position {
    // Clamp progress between 0 and 1
    progress = Math.max(0, Math.min(1, progress))
    
    return {
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress
    }
  }

  /**
   * Update an existing animation
   */
  async updateAnimation(animationId: string, dto: UpdateAnimationDto): Promise<AnimationSequence> {
    try {
      const existingAnimation = await prisma.playAnimation.findUnique({
        where: { id: animationId }
      })

      if (!existingAnimation) {
        throw new AppError('Animation not found', 404)
      }

      // Validate duration if provided
      if (dto.duration && (dto.duration < ANIMATION_CONSTRAINTS.minDuration || 
          dto.duration > ANIMATION_CONSTRAINTS.maxDuration)) {
        throw new AppError(
          `Duration must be between ${ANIMATION_CONSTRAINTS.minDuration} and ${ANIMATION_CONSTRAINTS.maxDuration} milliseconds`,
          400
        )
      }

      const updatedAnimation = await prisma.playAnimation.update({
        where: { id: animationId },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.duration && { duration: dto.duration }),
          ...(dto.frames && {
            sequenceData: {
              ...existingAnimation.sequenceData as any,
              frames: dto.frames
            }
          }),
          ...(dto.keyframes && {
            sequenceData: {
              ...existingAnimation.sequenceData as any,
              keyframes: dto.keyframes
            }
          }),
          ...(dto.settings && { settings: { ...existingAnimation.settings as any, ...dto.settings } })
        }
      })

      const sequenceData = updatedAnimation.sequenceData as any
      
      return {
        id: updatedAnimation.id,
        playId: updatedAnimation.playId,
        name: updatedAnimation.name,
        description: updatedAnimation.description || undefined,
        duration: updatedAnimation.duration,
        frames: sequenceData.frames || [],
        keyframes: sequenceData.keyframes || [],
        settings: updatedAnimation.settings as AnimationSettings
      }
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  /**
   * Delete an animation
   */
  async deleteAnimation(animationId: string): Promise<void> {
    try {
      const animation = await prisma.playAnimation.findUnique({
        where: { id: animationId }
      })

      if (!animation) {
        throw new AppError('Animation not found', 404)
      }

      await prisma.playAnimation.delete({
        where: { id: animationId }
      })
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  /**
   * Get all animations for a play
   */
  async getPlayAnimations(playId: string): Promise<AnimationSequence[]> {
    try {
      const animations = await prisma.playAnimation.findMany({
        where: { playId },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'asc' }
        ]
      })

      return animations.map(animation => {
        const sequenceData = animation.sequenceData as any
        
        return {
          id: animation.id,
          playId: animation.playId,
          name: animation.name,
          description: animation.description || undefined,
          duration: animation.duration,
          frames: sequenceData.frames || [],
          keyframes: sequenceData.keyframes || [],
          settings: animation.settings as AnimationSettings
        }
      })
    } catch (error) {
      throw handleServiceError(error)
    }
  }
}