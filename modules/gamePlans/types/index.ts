import { GamePlan, GamePlanItem, GamePlanSequence } from '@prisma/client'
import { PlayWithRelations } from '../../plays/types'

// Extended GamePlan type with relations
export interface GamePlanWithRelations extends GamePlan {
  createdBy: {
    id: string
    name: string | null
    email: string
  }
  items: GamePlanItemWithPlay[]
  sequences: GamePlanSequenceWithDetails[]
  _count?: {
    items: number
    sequences: number
  }
}

export interface GamePlanItemWithPlay extends GamePlanItem {
  play: {
    id: string
    title: string
    description: string | null
    diagramJSON: any
    tags: Array<{
      id: string
      name: string
      category: string
      color: string | null
    }>
  }
}

export interface GamePlanSequenceWithDetails extends GamePlanSequence {
  fromPlay?: {
    id: string
    title: string
  }
  toPlay?: {
    id: string
    title: string
  }
}

// GamePlan creation/update DTOs
export interface CreateGamePlanDto {
  title: string
  description?: string
  opponent?: string
  gameDate?: Date
  defenseType?: string
}

export interface UpdateGamePlanDto {
  title?: string
  description?: string
  opponent?: string
  gameDate?: Date
  defenseType?: string
}

// GamePlan query parameters
export interface GamePlanQueryParams {
  createdById?: string
  opponent?: string
  defenseType?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'gameDate'
  sortOrder?: 'asc' | 'desc'
  includeItems?: boolean
  includeSequences?: boolean
}

// GamePlan item operations
export interface AddPlayToGamePlanDto {
  playId: string
  section?: string
  notes?: string
  orderIndex?: number
}

export interface UpdateGamePlanItemDto {
  section?: string
  notes?: string
  orderIndex?: number
}

export interface ReorderGamePlanItemsDto {
  items: Array<{
    id: string
    orderIndex: number
  }>
}

// GamePlan sequence operations
export interface CreateGamePlanSequenceDto {
  fromPlayId: string
  toPlayId: string
  condition?: string
  label?: string
}

export interface UpdateGamePlanSequenceDto {
  condition?: string
  label?: string
}

// Visual flowchart types for React Flow
export interface FlowNode {
  id: string
  type: 'play' | 'decision'
  position: { x: number; y: number }
  data: {
    playId: string
    title: string
    section?: string
    tags: string[]
    notes?: string
  }
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  type?: 'default' | 'conditional'
  label?: string
  data?: {
    condition?: string
    sequenceId?: string
  }
}

export interface GamePlanFlowChart {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

// GamePlan sections and organization
export interface GamePlanSection {
  name: string
  plays: GamePlanItemWithPlay[]
  order: number
}

export interface OrganizedGamePlan {
  id: string
  title: string
  sections: GamePlanSection[]
  unorganizedPlays: GamePlanItemWithPlay[]
}

// GamePlan statistics
export interface GamePlanStats {
  totalGamePlans: number
  averagePlaysPerPlan: number
  mostUsedPlays: Array<{
    playId: string
    playTitle: string
    usageCount: number
  }>
  plansByDefenseType: Record<string, number>
  recentActivity: Array<{
    id: string
    title: string
    action: 'created' | 'updated'
    date: Date
  }>
}

// Export options
export interface GamePlanExportOptions {
  includePlayDiagrams?: boolean
  includeSequences?: boolean
  includeTags?: boolean
  format?: 'pdf' | 'json'
  sections?: string[]
}

// Bulk operations
export interface BulkGamePlanOperation {
  gamePlanIds: string[]
  operation: 'delete' | 'duplicate' | 'updateDefenseType'
  data?: any
}

// GamePlan templates
export interface GamePlanTemplate {
  id: string
  name: string
  description: string
  defaultSections: string[]
  recommendedTags: string[]
  defenseType?: string
}

// Sharing and collaboration
export interface GamePlanShareConfig {
  token: string
  allowEdit?: boolean
  allowCopy?: boolean
  expiresAt?: Date
  sharedWith?: string[] // User IDs
}

// Analysis types
export interface GamePlanAnalysis {
  playComplexity: {
    average: number
    distribution: Record<string, number>
  }
  tagDistribution: Record<string, number>
  sequenceComplexity: number
  recommendations: string[]
  gaps: Array<{
    situation: string
    severity: 'low' | 'medium' | 'high'
    suggestion: string
  }>
}

// Validation
export interface GamePlanValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  completionScore: number // 0-100
}

// Common sections used in game plans
export const COMMON_GAME_PLAN_SECTIONS = [
  'Half Court Sets',
  'Quick Hitters',
  'BLOB (Baseline Out)',
  'SLOB (Sideline Out)',
  'Press Break',
  'vs Zone Defense',
  'vs Man Defense',
  'End Game',
  'Special Situations',
  'Transition',
] as const

export type GamePlanSectionType = typeof COMMON_GAME_PLAN_SECTIONS[number]

// Defense types
export const DEFENSE_TYPES = [
  'Man-to-Man',
  '2-3 Zone',
  '3-2 Zone',
  '1-3-1 Zone',
  'Full Court Press',
  'Half Court Trap',
  'Box and One',
  'Triangle and Two',
  'Switching',
  'Mixed'
] as const

export type DefenseType = typeof DEFENSE_TYPES[number]

// Game situations
export const GAME_SITUATIONS = [
  'Opening',
  'First Quarter',
  'Second Quarter',
  'Halftime Adjustments',
  'Third Quarter',
  'Fourth Quarter',
  'Overtime',
  'Final Minute',
  'Final Possession',
  'Need Quick Score',
  'Need 3-Pointer',
  'Kill Clock',
  'After Timeout',
  'After Made Shot',
  'After Missed Shot',
] as const

export type GameSituation = typeof GAME_SITUATIONS[number]