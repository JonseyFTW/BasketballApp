// Common types used across modules
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// Play diagram types
export interface Position {
  x: number
  y: number
}

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

export interface ActionStyle {
  color?: string
  strokeWidth?: number
  dashArray?: number[]
  arrowType?: 'solid' | 'dashed' | 'dotted'
}

export interface PlayDiagram {
  players: Player[]
  actions: PlayAction[]
  courtDimensions?: {
    width: number
    height: number
  }
}

// Filter types
export interface PlayFilters {
  tags?: string[]
  authorId?: string
  search?: string
  category?: string
  defenseType?: string
}

export interface GamePlanFilters {
  createdById?: string
  opponent?: string
  defenseType?: string
  search?: string
}

// Validation result
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Share configuration
export interface ShareConfig {
  token: string
  expiresAt?: Date
  allowDownload?: boolean
  allowCopy?: boolean
}

// Player attributes for adaptive logic
export interface PlayerAttributes {
  speed: number        // 1-100
  size: number         // 1-100
  shooting: number     // 1-100
  ballHandling: number // 1-100
  defense: number      // 1-100
  rebounding: number   // 1-100
}