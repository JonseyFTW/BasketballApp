// Animation system types for play visualization

export interface AnimationFrame {
  timestamp: number // Time in milliseconds from start
  players: AnimatedPlayer[]
  actions: ActiveAction[]
}

export interface AnimatedPlayer {
  id: string
  label: string
  position: Position
  // Optional animation properties
  rotation?: number // Degrees (0-360)
  scale?: number // Scale factor (default 1.0)
  opacity?: number // 0-1 (default 1.0)
  highlight?: boolean // Visual emphasis
  velocity?: { x: number; y: number } // Player movement speed
}

export interface Position {
  x: number
  y: number
}

export interface ActiveAction {
  id: string
  type: 'pass' | 'cut' | 'screen' | 'dribble' | 'shot'
  fromPlayer: string
  toPlayer?: string
  toPosition?: Position
  progress: number // 0-1, how far along the action is
  style?: ActionStyle
}

export interface ActionStyle {
  color?: string
  strokeWidth?: number
  dashArray?: number[]
  arrowType?: 'solid' | 'dashed' | 'dotted'
}

// Animation sequence defines the complete play animation
export interface AnimationSequence {
  id: string
  playId: string
  name: string
  description?: string
  duration: number // Total duration in milliseconds
  frames: AnimationFrame[]
  keyframes: Keyframe[] // Important moments in the play
  settings: AnimationSettings
}

export interface Keyframe {
  id: string
  timestamp: number
  name: string
  description?: string
  type: 'movement' | 'action' | 'highlight' | 'pause'
}

// Animation study tools interfaces
export interface AnimationBookmark {
  id: string
  timestamp: number
  title: string
  description?: string
  category: 'key_moment' | 'mistake' | 'insight' | 'question'
}

export interface AnimationAnnotation {
  id: string
  timestamp: number
  text: string
  type: 'observation' | 'coaching_point' | 'question' | 'highlight'
  position?: Position
}

export interface AnimationSettings {
  fps: number // Frames per second (default 30)
  autoPlay: boolean
  loop: boolean
  showTrails: boolean // Show player movement trails
  trailLength: number // Number of previous positions to show
  highlightActivePlayer: boolean
  transitionDuration: number // MS for smooth transitions between frames
}

// Player movement path for smooth animations
export interface MovementPath {
  playerId: string
  startTime: number
  endTime: number
  startPosition: Position
  endPosition: Position
  type: 'linear' | 'curve' | 'sprint' | 'jog'
  waypoints?: Position[] // For curved movements
  speed?: number // Override default speed
}

// Action timeline for play events
export interface ActionTimeline {
  actions: TimedAction[]
  synchronizations: ActionSync[] // Actions that happen simultaneously
}

export interface TimedAction {
  id: string
  actionId: string // References PlayAction.id
  startTime: number
  duration: number
  delay?: number // Delay before starting
  priority: number // Higher priority actions are shown on top
}

export interface ActionSync {
  name: string
  timestamp: number
  actionIds: string[]
  description?: string
}

// Animation playback control
export interface AnimationPlayback {
  isPlaying: boolean
  currentTime: number
  playbackSpeed: number // 1.0 = normal speed
  direction: 'forward' | 'backward'
  loop: boolean
}

// Animation export options
export interface AnimationExportOptions {
  format: 'gif' | 'mp4' | 'webm'
  fps: number
  quality: 'low' | 'medium' | 'high'
  resolution: '720p' | '1080p' | '4k'
  includeAudio?: boolean
  watermark?: boolean
}

// Enhanced play diagram with animation data
export interface AnimatedPlayDiagram {
  // Existing diagram data
  players: Player[]
  actions: PlayAction[]
  courtDimensions?: {
    width: number
    height: number
  }
  
  // Animation-specific data
  animationSequence?: AnimationSequence
  movementPaths?: MovementPath[]
  actionTimeline?: ActionTimeline
  bookmarks?: PlayBookmark[]
}

export interface PlayBookmark {
  id: string
  timestamp: number
  name: string
  description?: string
  color?: string
  created: Date
  createdBy: string
}

// Animation creation and editing
export interface CreateAnimationDto {
  playId: string
  name: string
  description?: string
  duration: number
  settings?: Partial<AnimationSettings>
}

export interface UpdateAnimationDto {
  name?: string
  description?: string
  duration?: number
  frames?: AnimationFrame[]
  keyframes?: Keyframe[]
  settings?: Partial<AnimationSettings>
}

// Animation templates for common play types
export interface AnimationTemplate {
  id: string
  name: string
  description: string
  playType: string // 'pick-and-roll', 'motion', 'isolation', etc.
  defaultDuration: number
  movementPatterns: MovementPattern[]
  actionSequences: ActionSequence[]
}

export interface MovementPattern {
  role: string // 'ball-handler', 'screener', 'shooter', etc.
  path: MovementPath
  timing: {
    start: number
    end: number
  }
}

export interface ActionSequence {
  name: string
  actions: TimedAction[]
  conditions?: string[] // When this sequence should trigger
}

// Player references for animations
export interface Player {
  id: string
  label: string
  position?: string
  x: number
  y: number
}

export interface PlayAction {
  id: string
  type: 'pass' | 'cut' | 'screen' | 'dribble' | 'shot'
  from: EntityReference
  to: EntityReference
  style?: ActionStyle
  sequence?: number
}

export interface EntityReference {
  playerId?: string
  x?: number
  y?: number
}

// Animation constraints and validation
export const ANIMATION_CONSTRAINTS = {
  maxDuration: 30000, // 30 seconds
  minDuration: 1000,  // 1 second
  maxFrames: 900,     // 30 seconds at 30fps
  minFrames: 30,      // 1 second at 30fps
  maxKeyframes: 20,
  maxMovementPaths: 15, // 3 paths per player max
  maxBookmarks: 10,
} as const

export const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
  fps: 30,
  autoPlay: false,
  loop: false,
  showTrails: true,
  trailLength: 5,
  highlightActivePlayer: true,
  transitionDuration: 100,
} as const