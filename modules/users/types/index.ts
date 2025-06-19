import { User, UserRole, Team, PlayerProfile } from '@prisma/client'
import { PlayerAttributes } from '../../common/types'

// Extended User type with relations
export interface UserWithRelations extends User {
  team?: Team | null
  plays?: Array<{
    id: string
    title: string
    createdAt: Date
  }>
  gamePlans?: Array<{
    id: string
    title: string
    createdAt: Date
  }>
  playersCoached?: PlayerProfile[]
  _count?: {
    plays: number
    gamePlans: number
    playersCoached: number
  }
}

// Team with relations
export interface TeamWithRelations extends Team {
  users: Array<{
    id: string
    name: string | null
    email: string
    role: UserRole
  }>
  players: PlayerProfile[]
  _count?: {
    users: number
    players: number
  }
}

// Player profile with relations
export interface PlayerProfileWithRelations extends PlayerProfile {
  team?: Team | null
  coach?: {
    id: string
    name: string | null
    email: string
  } | null
  adaptations?: Array<{
    id: string
    playId: string
    adaptedDiagram: any
    createdAt: Date
  }>
}

// User creation/update DTOs
export interface CreateUserDto {
  email: string
  password: string
  name: string
  role?: UserRole
  teamId?: string
}

export interface UpdateUserDto {
  name?: string
  email?: string
  role?: UserRole
  teamId?: string
  image?: string
}

export interface UpdateUserPasswordDto {
  currentPassword: string
  newPassword: string
}

export interface UpdateUserProfileDto {
  name?: string
  image?: string
}

// Team DTOs
export interface CreateTeamDto {
  name: string
  description?: string
}

export interface UpdateTeamDto {
  name?: string
  description?: string
}

export interface InviteUserToTeamDto {
  email: string
  role: UserRole
}

// Player profile DTOs
export interface CreatePlayerProfileDto {
  name: string
  number?: number
  position?: string
  attributes: PlayerAttributes
  teamId?: string
}

export interface UpdatePlayerProfileDto {
  name?: string
  number?: number
  position?: string
  attributes?: PlayerAttributes
  teamId?: string
}

// Query parameters
export interface UserQueryParams {
  role?: UserRole
  teamId?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'email' | 'createdAt' | 'role'
  sortOrder?: 'asc' | 'desc'
  includeStats?: boolean
}

export interface TeamQueryParams {
  search?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  includeMembers?: boolean
}

export interface PlayerQueryParams {
  teamId?: string
  coachId?: string
  position?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'number' | 'position' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// User statistics
export interface UserStats {
  totalUsers: number
  usersByRole: Record<UserRole, number>
  activeUsers: number // Users who have logged in within last 30 days
  newUsersThisMonth: number
  topCoaches: Array<{
    id: string
    name: string | null
    playsCreated: number
    gamePlansCreated: number
  }>
}

// Team statistics
export interface TeamStats {
  totalTeams: number
  averageTeamSize: number
  largestTeam: {
    id: string
    name: string
    memberCount: number
  }
  teamsWithoutCoaches: number
}

// Player statistics and analysis
export interface PlayerStats {
  totalPlayers: number
  playersByPosition: Record<string, number>
  averageAttributes: PlayerAttributes
  topPerformers: Array<{
    id: string
    name: string
    position: string | null
    overallRating: number
    strengths: string[]
  }>
}

// User activity tracking
export interface UserActivity {
  userId: string
  action: string
  entityType: 'play' | 'gameplan' | 'player' | 'team'
  entityId: string
  timestamp: Date
  metadata?: any
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    gameReminders: boolean
    playUpdates: boolean
    teamInvitations: boolean
  }
  playDesigner: {
    defaultCourtSize: 'half' | 'full'
    showGrid: boolean
    snapToGrid: boolean
    defaultPlayerColors: string[]
  }
  dashboard: {
    showRecentPlays: boolean
    showUpcomingGames: boolean
    showTeamStats: boolean
  }
}

// Team invitation system
export interface TeamInvitation {
  id: string
  teamId: string
  email: string
  role: UserRole
  invitedBy: string
  token: string
  expiresAt: Date
  acceptedAt?: Date
  createdAt: Date
}

// User session and authentication
export interface UserSession {
  id: string
  userId: string
  sessionToken: string
  expires: Date
  lastActivity: Date
  ipAddress?: string
  userAgent?: string
}

// Role permissions
export interface RolePermissions {
  role: UserRole
  permissions: {
    plays: {
      create: boolean
      read: boolean
      update: boolean
      delete: boolean
      share: boolean
    }
    gamePlans: {
      create: boolean
      read: boolean
      update: boolean
      delete: boolean
      share: boolean
    }
    players: {
      create: boolean
      read: boolean
      update: boolean
      delete: boolean
    }
    team: {
      manage: boolean
      invite: boolean
      remove: boolean
    }
  }
}

// Default role permissions
export const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions['permissions']> = {
  [UserRole.ADMIN]: {
    plays: { create: true, read: true, update: true, delete: true, share: true },
    gamePlans: { create: true, read: true, update: true, delete: true, share: true },
    players: { create: true, read: true, update: true, delete: true },
    team: { manage: true, invite: true, remove: true },
  },
  [UserRole.COACH]: {
    plays: { create: true, read: true, update: true, delete: true, share: true },
    gamePlans: { create: true, read: true, update: true, delete: true, share: true },
    players: { create: true, read: true, update: true, delete: false },
    team: { manage: false, invite: true, remove: false },
  },
  [UserRole.PLAYER]: {
    plays: { create: false, read: true, update: false, delete: false, share: false },
    gamePlans: { create: false, read: true, update: false, delete: false, share: false },
    players: { create: false, read: true, update: false, delete: false },
    team: { manage: false, invite: false, remove: false },
  },
}

// User onboarding
export interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  order: number
}

export interface UserOnboarding {
  userId: string
  currentStep: number
  completedSteps: string[]
  completedAt?: Date
  steps: OnboardingStep[]
}

// Authentication types
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
  role?: UserRole
  teamInvitationToken?: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordReset {
  token: string
  newPassword: string
}

// User validation
export interface UserValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Bulk operations
export interface BulkUserOperation {
  userIds: string[]
  operation: 'updateRole' | 'addToTeam' | 'removeFromTeam' | 'deactivate'
  data?: any
}

// Basketball positions
export const BASKETBALL_POSITIONS = [
  'PG', // Point Guard
  'SG', // Shooting Guard
  'SF', // Small Forward
  'PF', // Power Forward
  'C',  // Center
  'G',  // Guard (generic)
  'F',  // Forward (generic)
] as const

export type BasketballPosition = typeof BASKETBALL_POSITIONS[number]

// Player attribute ranges and descriptions
export const ATTRIBUTE_DESCRIPTIONS = {
  speed: {
    min: 1,
    max: 100,
    description: 'How fast the player moves on the court',
    ranges: {
      excellent: [85, 100],
      good: [70, 84],
      average: [50, 69],
      below: [30, 49],
      poor: [1, 29],
    }
  },
  size: {
    min: 1,
    max: 100,
    description: 'Player height and physical presence',
    ranges: {
      excellent: [85, 100],
      good: [70, 84],
      average: [50, 69],
      below: [30, 49],
      poor: [1, 29],
    }
  },
  shooting: {
    min: 1,
    max: 100,
    description: 'Ability to make shots from various distances',
    ranges: {
      excellent: [85, 100],
      good: [70, 84],
      average: [50, 69],
      below: [30, 49],
      poor: [1, 29],
    }
  },
  ballHandling: {
    min: 1,
    max: 100,
    description: 'Dribbling skills and ball control',
    ranges: {
      excellent: [85, 100],
      good: [70, 84],
      average: [50, 69],
      below: [30, 49],
      poor: [1, 29],
    }
  },
  defense: {
    min: 1,
    max: 100,
    description: 'Defensive skills and awareness',
    ranges: {
      excellent: [85, 100],
      good: [70, 84],
      average: [50, 69],
      below: [30, 49],
      poor: [1, 29],
    }
  },
  rebounding: {
    min: 1,
    max: 100,
    description: 'Ability to grab rebounds on both ends',
    ranges: {
      excellent: [85, 100],
      good: [70, 84],
      average: [50, 69],
      below: [30, 49],
      poor: [1, 29],
    }
  },
} as const