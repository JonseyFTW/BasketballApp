import { ValidationResult, PlayDiagram, PlayerAttributes } from '../types'
import { v4 as uuidv4 } from 'uuid'

// API Response utilities
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
  }
}

export function createErrorResponse(error: string, statusCode = 400) {
  return {
    success: false,
    error,
  }
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePlayTitle(title: string): ValidationResult {
  const errors: string[] = []
  
  if (!title || title.trim().length === 0) {
    errors.push('Play title is required')
  }
  
  if (title.length > 100) {
    errors.push('Play title must be less than 100 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validatePlayDiagram(diagram: PlayDiagram): ValidationResult {
  const errors: string[] = []
  
  if (!diagram.players || diagram.players.length === 0) {
    errors.push('Play must have at least one player')
  }
  
  if (diagram.players && diagram.players.length > 5) {
    errors.push('Play cannot have more than 5 players')
  }
  
  // Validate player positions are within court bounds
  const courtWidth = diagram.courtDimensions?.width || 800
  const courtHeight = diagram.courtDimensions?.height || 600
  
  diagram.players?.forEach((player, index) => {
    if (player.x < 0 || player.x > courtWidth) {
      errors.push(`Player ${index + 1} x position is out of bounds`)
    }
    if (player.y < 0 || player.y > courtHeight) {
      errors.push(`Player ${index + 1} y position is out of bounds`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// String utilities
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function generateShareToken(): string {
  return uuidv4().replace(/-/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// Date utilities
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Basketball specific utilities
export function calculateDistance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function adjustSpacingForSpeed(
  originalDistance: number,
  playerSpeed: number,
  referenceSpeed: number = 75
): number {
  // Adjust spacing based on player speed
  // Slower players get shorter distances, faster players can handle longer distances
  const speedRatio = playerSpeed / referenceSpeed
  return originalDistance * speedRatio
}

export function getPlayerAttributeColor(value: number): string {
  // Return color based on attribute value (1-100)
  if (value >= 80) return '#10B981' // Green - Excellent
  if (value >= 60) return '#F59E0B' // Yellow - Good
  if (value >= 40) return '#EF4444' // Red - Average
  return '#6B7280' // Gray - Poor
}

export function calculatePlayComplexity(diagram: PlayDiagram): number {
  // Simple algorithm to calculate play complexity
  const playerCount = diagram.players.length
  const actionCount = diagram.actions.length
  
  // Base complexity from number of players and actions
  let complexity = playerCount * 10 + actionCount * 15
  
  // Add complexity for different action types
  diagram.actions.forEach(action => {
    switch (action.type) {
      case 'screen':
        complexity += 20 // Screens are complex
        break
      case 'cut':
        complexity += 15
        break
      case 'pass':
        complexity += 10
        break
      case 'dribble':
        complexity += 5
        break
      default:
        complexity += 10
    }
  })
  
  // Normalize to 1-100 scale
  return Math.min(100, Math.max(1, Math.round(complexity / 3)))
}

// Pagination utilities
export function getPaginationInfo(
  page: number = 1,
  limit: number = 10,
  total: number
) {
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  
  return {
    page,
    limit,
    total,
    totalPages,
    offset,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

// Error handling utilities
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 400) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export function handleServiceError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 500)
  }
  
  return new AppError('An unexpected error occurred', 500)
}