import { Play, PlayTag, PlayRelation, RelationType, TagCategory } from '@prisma/client'
import { PlayDiagram, BaseEntity, PlayerAttributes } from '../../common/types'

// Extended Play type with relations
export interface PlayWithRelations extends Play {
  author: {
    id: string
    name: string | null
    email: string
  }
  tags: PlayTag[]
  relationsFrom: PlayRelationWithPlay[]
  relationsTo: PlayRelationWithPlay[]
  _count?: {
    relationsFrom: number
    relationsTo: number
  }
}

export interface PlayRelationWithPlay extends PlayRelation {
  relatedPlay: {
    id: string
    title: string
  }
}

// Play creation/update DTOs
export interface CreatePlayDto {
  title: string
  description?: string
  diagramJSON: PlayDiagram
  tagIds?: string[]
}

export interface UpdatePlayDto {
  title?: string
  description?: string
  diagramJSON?: PlayDiagram
  tagIds?: string[]
}

// Play query parameters
export interface PlayQueryParams {
  authorId?: string
  tags?: string[]
  search?: string
  category?: TagCategory
  page?: number
  limit?: number
  sortBy?: 'title' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  includeRelations?: boolean
}

// Play adaptation types
export interface AdaptPlayRequest {
  playId: string
  playerMappings: PlayerMapping[]
}

export interface PlayerMapping {
  diagramPlayerId: string // Player ID in the diagram
  actualPlayerId: string  // Actual player profile ID
}

export interface AdaptedPlay {
  originalDiagram: PlayDiagram
  adaptedDiagram: PlayDiagram
  adaptationNotes: string[]
  playerMappings: PlayerMapping[]
}

// Play relation types
export interface CreatePlayRelationDto {
  playId: string
  relatedPlayId: string
  relationType: RelationType
  description?: string
}

export interface PlayRelationTree {
  play: PlayWithRelations
  children: PlayRelationTree[]
  relationType?: RelationType
  depth: number
}

// Play statistics
export interface PlayStats {
  totalPlays: number
  playsByTag: Record<string, number>
  playsByAuthor: Record<string, number>
  averageComplexity: number
  mostUsedTags: Array<{
    tag: PlayTag
    count: number
  }>
}

// Play export types
export interface PlayExportOptions {
  includeMetadata?: boolean
  includeTags?: boolean
  includeRelations?: boolean
  format?: 'json' | 'pdf'
}

export interface BulkPlayOperation {
  playIds: string[]
  operation: 'delete' | 'addTag' | 'removeTag' | 'updateAuthor'
  data?: any
}

// Play validation types
export interface PlayValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Play search types  
export interface PlaySearchResult {
  plays: PlayWithRelations[]
  total: number
  filters: {
    availableTags: PlayTag[]
    authors: Array<{
      id: string
      name: string
      count: number
    }>
  }
}

// Court dimensions and constraints
export const COURT_DIMENSIONS = {
  width: 800,
  height: 600,
  threePointLineRadius: 280,
  keyWidth: 160,
  keyHeight: 190,
  basketPosition: { x: 400, y: 50 },
} as const

export const PLAY_CONSTRAINTS = {
  maxPlayers: 5,
  minPlayers: 1,
  maxActions: 20,
  maxTitleLength: 100,
  maxDescriptionLength: 500,
} as const