import type { PlayEffectiveness, DefenseType, GameSituation } from '@prisma/client'
import { PlayWithRelations } from '../../plays/types'

// Client-side enum definitions (duplicated from Prisma for browser compatibility)
export enum DefenseTypeEnum {
  MAN_TO_MAN = 'MAN_TO_MAN',
  SWITCHING_MAN = 'SWITCHING_MAN',
  HELP_AND_RECOVER = 'HELP_AND_RECOVER',
  DENIAL_DEFENSE = 'DENIAL_DEFENSE',
  ZONE_2_3 = 'ZONE_2_3',
  ZONE_3_2 = 'ZONE_3_2',
  ZONE_1_3_1 = 'ZONE_1_3_1',
  ZONE_1_2_2 = 'ZONE_1_2_2',
  MATCHUP_ZONE = 'MATCHUP_ZONE',
  FULL_COURT_PRESS = 'FULL_COURT_PRESS',
  HALF_COURT_PRESS = 'HALF_COURT_PRESS',
  DIAMOND_PRESS = 'DIAMOND_PRESS',
  PRESS_2_2_1 = 'PRESS_2_2_1',
  BOX_AND_ONE = 'BOX_AND_ONE',
  TRIANGLE_AND_TWO = 'TRIANGLE_AND_TWO',
  PACK_LINE = 'PACK_LINE',
  GET_BACK_DEFENSE = 'GET_BACK_DEFENSE',
  SLOW_BREAK_DEFENSE = 'SLOW_BREAK_DEFENSE'
}

export enum GameSituationEnum {
  GENERAL = 'GENERAL',
  BLOB = 'BLOB',
  SLOB = 'SLOB',
  END_GAME = 'END_GAME',
  LAST_SHOT = 'LAST_SHOT',
  PRESS_BREAK = 'PRESS_BREAK',
  QUICK_SCORE = 'QUICK_SCORE',
  FOUL_SITUATION = 'FOUL_SITUATION',
  TIMEOUT_PLAY = 'TIMEOUT_PLAY',
  AFTER_MADE_BASKET = 'AFTER_MADE_BASKET',
  AFTER_TURNOVER = 'AFTER_TURNOVER'
}

// Extended PlayEffectiveness with relations
export interface PlayEffectivenessWithPlay extends PlayEffectiveness {
  play: PlayWithRelations
}

// Live play recommendation types
export interface PlayRecommendation {
  play: PlayWithRelations
  effectiveness: PlayEffectiveness[]
  overallRating: number
  confidence: number // How confident we are in this recommendation
  reasoning: string[] // Why this play is recommended
}

export interface LiveRecommendationRequest {
  defenseType: DefenseType
  situation?: GameSituation
  timeLeft?: number // seconds remaining in quarter/game
  score?: {
    us: number
    them: number
  }
  quarter?: number
  timeouts?: {
    us: number
    them: number
  }
  playerPreferences?: string[] // Player IDs that are on court
  maxResults?: number
}

export interface LiveRecommendationResponse {
  defenseType: DefenseType
  situation?: GameSituation
  recommendations: PlayRecommendation[]
  totalPlaysConsidered: number
  generatedAt: Date
}

// Defense type metadata for UI display
export interface DefenseTypeInfo {
  type: DefenseTypeEnum
  name: string
  description: string
  category: 'man' | 'zone' | 'pressure' | 'specialty' | 'transition'
  commonCounters: string[]
  keyCharacteristics: string[]
}

// Game situation metadata
export interface GameSituationInfo {
  situation: GameSituationEnum
  name: string
  description: string
  timeContext?: string
  specialConsiderations: string[]
}

// Live dashboard state
export interface LiveDashboardState {
  selectedDefense?: DefenseType
  selectedSituation?: GameSituation
  gameContext?: {
    quarter: number
    timeLeft: number
    score: { us: number; them: number }
    timeouts: { us: number; them: number }
  }
  favoritePlayIds: string[]
  recentlyUsedPlayIds: string[]
  lastRecommendations?: LiveRecommendationResponse
}

// Play usage tracking for analytics
export interface PlayUsageEvent {
  playId: string
  defenseType: DefenseType
  situation?: GameSituation
  gameContext?: {
    quarter: number
    timeLeft: number
    scoreDeficit: number
  }
  outcome?: 'success' | 'failure' | 'partial'
  notes?: string
  timestamp: Date
}

// Coaching preferences for personalized recommendations
export interface CoachingPreferences {
  userId: string
  preferredPlayStyles: string[] // e.g., 'motion', 'set-plays', 'quick-hitters'
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  playerDependentPlays: boolean // Whether to factor in current players
  situationalAdjustments: {
    [key in GameSituation]?: {
      preferredDifficulty: number // 1-10
      preferredPlayTypes: string[]
    }
  }
  defenseSpecificSettings: {
    [key in DefenseType]?: {
      confidence: number // How confident coach is against this defense
      preferredApproaches: string[]
    }
  }
}

// Constants for live recommendations
export const DEFENSE_TYPE_INFO: Record<DefenseTypeEnum, DefenseTypeInfo> = {
  MAN_TO_MAN: {
    type: DefenseTypeEnum.MAN_TO_MAN,
    name: 'Man-to-Man',
    description: 'Standard man-to-man defense with individual matchups',
    category: 'man',
    commonCounters: ['Screens', 'Motion offense', 'Isolation plays'],
    keyCharacteristics: ['Individual matchups', 'Help defense', 'Communication']
  },
  SWITCHING_MAN: {
    type: DefenseTypeEnum.SWITCHING_MAN,
    name: 'Switching Man',
    description: 'Man defense that switches on all screens',
    category: 'man',
    commonCounters: ['Mismatches', 'Motion', 'Pick and roll'],
    keyCharacteristics: ['Switch all screens', 'Size mismatches', 'Communication']
  },
  HELP_AND_RECOVER: {
    type: DefenseTypeEnum.HELP_AND_RECOVER,
    name: 'Help & Recover',
    description: 'Man defense with aggressive help and recovery',
    category: 'man',
    commonCounters: ['Ball movement', 'Backdoor cuts', 'Kick-outs'],
    keyCharacteristics: ['Aggressive help', 'Quick recovery', 'Rim protection']
  },
  DENIAL_DEFENSE: {
    type: DefenseTypeEnum.DENIAL_DEFENSE,
    name: 'Denial Defense',
    description: 'Aggressive ball denial man defense',
    category: 'man',
    commonCounters: ['Backdoor cuts', 'Screens', 'Ball reversal'],
    keyCharacteristics: ['Ball denial', 'Pressure', 'Force turnovers']
  },
  ZONE_2_3: {
    type: DefenseTypeEnum.ZONE_2_3,
    name: '2-3 Zone',
    description: 'Two guards up top, three players in the paint',
    category: 'zone',
    commonCounters: ['Outside shooting', 'High-low', 'Ball movement'],
    keyCharacteristics: ['Protect paint', 'Rebound well', 'Vulnerable outside']
  },
  ZONE_3_2: {
    type: DefenseTypeEnum.ZONE_3_2,
    name: '3-2 Zone',
    description: 'Three players on perimeter, two in paint',
    category: 'zone',
    commonCounters: ['Inside scoring', 'Short corners', 'Flash to middle'],
    keyCharacteristics: ['Perimeter coverage', 'Contest shots', 'Help inside']
  },
  ZONE_1_3_1: {
    type: DefenseTypeEnum.ZONE_1_3_1,
    name: '1-3-1 Zone',
    description: 'One up top, three across, one in back',
    category: 'zone',
    commonCounters: ['Corners', 'High post', 'Ball reversal'],
    keyCharacteristics: ['Trapping', 'Force turnovers', 'Active hands']
  },
  ZONE_1_2_2: {
    type: DefenseTypeEnum.ZONE_1_2_2,
    name: '1-2-2 Zone',
    description: 'One guard, two wings, two posts',
    category: 'zone',
    commonCounters: ['Wing shooting', 'High-low', 'Overload'],
    keyCharacteristics: ['Balanced coverage', 'Help inside', 'Contest perimeter']
  },
  MATCHUP_ZONE: {
    type: DefenseTypeEnum.MATCHUP_ZONE,
    name: 'Matchup Zone',
    description: 'Zone principles with man-to-man matchups',
    category: 'zone',
    commonCounters: ['Motion offense', 'Overloads', 'Quick ball movement'],
    keyCharacteristics: ['Hybrid defense', 'Match personnel', 'Adaptable']
  },
  FULL_COURT_PRESS: {
    type: DefenseTypeEnum.FULL_COURT_PRESS,
    name: 'Full Court Press',
    description: 'Pressure defense from baseline to baseline',
    category: 'pressure',
    commonCounters: ['Long passes', 'Quick outlets', 'Dribble through'],
    keyCharacteristics: ['Constant pressure', 'Force turnovers', 'Tire offense']
  },
  HALF_COURT_PRESS: {
    type: DefenseTypeEnum.HALF_COURT_PRESS,
    name: 'Half Court Press',
    description: 'Pressure defense in half court',
    category: 'pressure',
    commonCounters: ['Patient offense', 'Screens', 'Ball reversal'],
    keyCharacteristics: ['Pressure ball', 'Deny passes', 'Force difficult shots']
  },
  DIAMOND_PRESS: {
    type: DefenseTypeEnum.DIAMOND_PRESS,
    name: 'Diamond Press',
    description: '1-2-1-1 diamond formation press',
    category: 'pressure',
    commonCounters: ['Middle passes', 'Long passes', 'Dribble baseline'],
    keyCharacteristics: ['Diamond shape', 'Trap corners', 'Force middle']
  },
  PRESS_2_2_1: {
    type: DefenseTypeEnum.PRESS_2_2_1,
    name: '2-2-1 Press',
    description: 'Two guards, two wings, one safety',
    category: 'pressure',
    commonCounters: ['Sideline breaks', 'Quick passes', 'Middle attack'],
    keyCharacteristics: ['Force sidelines', 'Double team', 'Recover quickly']
  },
  BOX_AND_ONE: {
    type: DefenseTypeEnum.BOX_AND_ONE,
    name: 'Box-and-One',
    description: 'Four in zone box, one chasing scorer',
    category: 'specialty',
    commonCounters: ['Move star player', 'Overload zones', 'Screen the chaser'],
    keyCharacteristics: ['Stop one player', 'Hybrid defense', 'Limit star scoring']
  },
  TRIANGLE_AND_TWO: {
    type: DefenseTypeEnum.TRIANGLE_AND_TWO,
    name: 'Triangle-and-Two',
    description: 'Three in triangle zone, two chasing scorers',
    category: 'specialty',
    commonCounters: ['Use other players', 'Overload triangle', 'Screen chasers'],
    keyCharacteristics: ['Stop two players', 'Triangle zone', 'Limit multiple scorers']
  },
  PACK_LINE: {
    type: DefenseTypeEnum.PACK_LINE,
    name: 'Pack Line',
    description: 'Defenders pack inside the three-point line',
    category: 'specialty',
    commonCounters: ['Three-point shooting', 'Drive and kick', 'Ball movement'],
    keyCharacteristics: ['Pack the paint', 'Help defense', 'Contest threes late']
  },
  GET_BACK_DEFENSE: {
    type: DefenseTypeEnum.GET_BACK_DEFENSE,
    name: 'Get Back Defense',
    description: 'Priority on stopping fast break',
    category: 'transition',
    commonCounters: ['Push tempo', 'Quick shots', 'Attack before set'],
    keyCharacteristics: ['Stop fast break', 'Get organized', 'Force half court']
  },
  SLOW_BREAK_DEFENSE: {
    type: DefenseTypeEnum.SLOW_BREAK_DEFENSE,
    name: 'Slow Break Defense',
    description: 'Organized transition defense',
    category: 'transition',
    commonCounters: ['Attack quickly', 'Overload sides', 'Find mismatches'],
    keyCharacteristics: ['Organized retreat', 'Match numbers', 'Force tough shots']
  }
}

export const GAME_SITUATION_INFO: Record<GameSituationEnum, GameSituationInfo> = {
  GENERAL: {
    situation: GameSituationEnum.GENERAL,
    name: 'General Offense',
    description: 'Standard half-court offensive possession',
    specialConsiderations: ['Read the defense', 'Execute fundamentals', 'Get good shot']
  },
  BLOB: {
    situation: GameSituationEnum.BLOB,
    name: 'Baseline Out of Bounds',
    description: 'Inbounding from under the basket',
    specialConsiderations: ['Quick decision', 'Screen action', 'Look for easy score']
  },
  SLOB: {
    situation: GameSituationEnum.SLOB,
    name: 'Sideline Out of Bounds',
    description: 'Inbounding from sideline',
    specialConsiderations: ['Limited space', 'Screen action', 'Ball movement']
  },
  END_GAME: {
    situation: GameSituationEnum.END_GAME,
    name: 'End Game',
    description: 'Final minutes of game',
    timeContext: 'Last 2 minutes',
    specialConsiderations: ['Clock management', 'High percentage shots', 'Foul situations']
  },
  LAST_SHOT: {
    situation: GameSituationEnum.LAST_SHOT,
    name: 'Last Shot',
    description: 'Final possession of quarter/game',
    timeContext: 'Under 24 seconds',
    specialConsiderations: ['Beat the buzzer', 'Best shooter', 'Backup options']
  },
  PRESS_BREAK: {
    situation: GameSituationEnum.PRESS_BREAK,
    name: 'Press Break',
    description: 'Breaking pressure defense',
    specialConsiderations: ['Stay calm', 'Quick decisions', 'Find open space']
  },
  QUICK_SCORE: {
    situation: GameSituationEnum.QUICK_SCORE,
    name: 'Quick Score',
    description: 'Need basket quickly',
    timeContext: 'Time pressure',
    specialConsiderations: ['Fast execution', 'High percentage', 'Minimal time use']
  },
  FOUL_SITUATION: {
    situation: GameSituationEnum.FOUL_SITUATION,
    name: 'Foul Situation',
    description: 'Fouling or bonus situation',
    specialConsiderations: ['Avoid fouls or get fouled', 'Bonus implications', 'Clock management']
  },
  TIMEOUT_PLAY: {
    situation: GameSituationEnum.TIMEOUT_PLAY,
    name: 'After Timeout',
    description: 'First possession after timeout',
    specialConsiderations: ['Set play', 'Take advantage', 'Get good look']
  },
  AFTER_MADE_BASKET: {
    situation: GameSituationEnum.AFTER_MADE_BASKET,
    name: 'After Made Basket',
    description: 'Inbounding after opponent scores',
    specialConsiderations: ['Quick transition', 'Look for advantage', 'Avoid pressure']
  },
  AFTER_TURNOVER: {
    situation: GameSituationEnum.AFTER_TURNOVER,
    name: 'After Turnover',
    description: 'Possession after creating turnover',
    specialConsiderations: ['Fast break opportunity', 'Numbers advantage', 'High energy']
  }
}

// Helper functions
export function getDefenseTypesByCategory() {
  const categories = {
    man: [] as DefenseTypeInfo[],
    zone: [] as DefenseTypeInfo[],
    pressure: [] as DefenseTypeInfo[],
    specialty: [] as DefenseTypeInfo[],
    transition: [] as DefenseTypeInfo[]
  }

  Object.values(DEFENSE_TYPE_INFO).forEach(info => {
    categories[info.category].push(info)
  })

  return categories
}

export function getGameSituationsByContext() {
  const contexts = {
    general: [] as GameSituationInfo[],
    outOfBounds: [] as GameSituationInfo[],
    timeSpecific: [] as GameSituationInfo[],
    pressure: [] as GameSituationInfo[],
    tactical: [] as GameSituationInfo[]
  }

  Object.values(GAME_SITUATION_INFO).forEach(info => {
    if (['BLOB', 'SLOB'].includes(info.situation)) {
      contexts.outOfBounds.push(info)
    } else if (['END_GAME', 'LAST_SHOT', 'QUICK_SCORE'].includes(info.situation)) {
      contexts.timeSpecific.push(info)
    } else if (['PRESS_BREAK', 'FOUL_SITUATION'].includes(info.situation)) {
      contexts.pressure.push(info)
    } else if (['TIMEOUT_PLAY', 'AFTER_MADE_BASKET', 'AFTER_TURNOVER'].includes(info.situation)) {
      contexts.tactical.push(info)
    } else {
      contexts.general.push(info)
    }
  })

  return contexts
}