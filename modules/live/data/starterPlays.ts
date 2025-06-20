import { DefenseType, GameSituation } from '@prisma/client'
import { PlayDiagram } from '../../common/types'

export interface StarterPlayData {
  title: string
  description: string
  category: string
  tags: string[]
  diagramJSON: PlayDiagram
  effectiveness: {
    defenseType: DefenseType
    rating: number
    difficulty: number
    situation?: GameSituation
    notes?: string
  }[]
}

// Helper function to create a basic 5-out formation
const createFiveOutFormation = (variations: { [key: string]: { x: number; y: number } } = {}) => ({
  players: [
    { id: '1', label: '1', x: 400, y: 350, ...variations['1'] }, // Point guard
    { id: '2', label: '2', x: 200, y: 200, ...variations['2'] }, // Shooting guard
    { id: '3', label: '3', x: 600, y: 200, ...variations['3'] }, // Small forward
    { id: '4', label: '4', x: 200, y: 400, ...variations['4'] }, // Power forward
    { id: '5', label: '5', x: 600, y: 400, ...variations['5'] }  // Center
  ],
  actions: [],
  courtDimensions: { width: 800, height: 600, threePointLineRadius: 280, keyWidth: 160, keyHeight: 190, basketPosition: { x: 400, y: 50 } }
})

// Helper function to create horns formation
const createHornsFormation = (variations: { [key: string]: { x: number; y: number } } = {}) => ({
  players: [
    { id: '1', label: '1', x: 400, y: 400, ...variations['1'] }, // Point guard
    { id: '2', label: '2', x: 200, y: 350, ...variations['2'] }, // Shooting guard
    { id: '3', label: '3', x: 600, y: 350, ...variations['3'] }, // Small forward
    { id: '4', label: '4', x: 320, y: 250, ...variations['4'] }, // Power forward (left elbow)
    { id: '5', label: '5', x: 480, y: 250, ...variations['5'] }  // Center (right elbow)
  ],
  actions: [],
  courtDimensions: { width: 800, height: 600, threePointLineRadius: 280, keyWidth: 160, keyHeight: 190, basketPosition: { x: 400, y: 50 } }
})

export const STARTER_PLAYS: StarterPlayData[] = [
  // MOTION OFFENSE PLAYS
  {
    title: '5-Out Motion',
    description: 'Basic 5-out motion offense with screen and cut action',
    category: 'Motion Offense',
    tags: ['Motion', 'Continuity', 'Ball Movement'],
    diagramJSON: createFiveOutFormation(),
    effectiveness: [
      { defenseType: DefenseType.MAN_TO_MAN, rating: 8.5, difficulty: 6, situation: GameSituation.GENERAL, notes: 'Excellent against man with good spacing' },
      { defenseType: DefenseType.SWITCHING_MAN, rating: 7.0, difficulty: 6, notes: 'Good but requires reading switches' },
      { defenseType: DefenseType.ZONE_2_3, rating: 6.0, difficulty: 7, notes: 'Struggles against packed zone' },
      { defenseType: DefenseType.HELP_AND_RECOVER, rating: 8.0, difficulty: 6, notes: 'Creates overloads against help defense' }
    ]
  },
  
  {
    title: 'Horns Motion',
    description: 'Motion offense starting from horns formation',
    category: 'Motion Offense',
    tags: ['Horns', 'Motion', 'Screens'],
    diagramJSON: createHornsFormation(),
    effectiveness: [
      { defenseType: DefenseType.MAN_TO_MAN, rating: 8.0, difficulty: 5, situation: GameSituation.GENERAL },
      { defenseType: DefenseType.ZONE_2_3, rating: 7.5, difficulty: 6, notes: 'High post creates problems for zone' },
      { defenseType: DefenseType.SWITCHING_MAN, rating: 7.0, difficulty: 6 },
      { defenseType: DefenseType.PACK_LINE, rating: 8.5, difficulty: 6, notes: 'Forces pack line to extend' }
    ]
  },

  // HORNS SET PLAYS
  {
    title: 'Horns Flare',
    description: 'Point guard passes to elbow and gets flare screen for three',
    category: 'Horns Sets',
    tags: ['Horns', 'Flare', 'Three-Point'],
    diagramJSON: createHornsFormation({
      '1': { x: 350, y: 450 }, // PG lower for pass angle
    }),
    effectiveness: [
      { defenseType: DefenseType.MAN_TO_MAN, rating: 8.5, difficulty: 4, notes: 'Classic action, hard to defend' },
      { defenseType: DefenseType.HELP_AND_RECOVER, rating: 9.0, difficulty: 4, notes: 'Help defense struggles with flare' },
      { defenseType: DefenseType.ZONE_2_3, rating: 6.5, difficulty: 5, notes: 'Zone can help on flare screen' },
      { defenseType: DefenseType.SWITCHING_MAN, rating: 7.0, difficulty: 5, notes: 'Switch creates mismatch' }
    ]
  },

  {
    title: 'Horns Split',
    description: 'Point guard drives through split action by bigs',
    category: 'Horns Sets',
    tags: ['Horns', 'Split', 'Drive'],
    diagramJSON: createHornsFormation(),
    effectiveness: [
      { defenseType: DefenseType.MAN_TO_MAN, rating: 8.0, difficulty: 5 },
      { defenseType: DefenseType.HELP_AND_RECOVER, rating: 7.0, difficulty: 6, notes: 'Help defense can recover' },
      { defenseType: DefenseType.ZONE_1_3_1, rating: 8.5, difficulty: 5, notes: 'Puts pressure on point of zone' },
      { defenseType: DefenseType.PACK_LINE, rating: 9.0, difficulty: 5, notes: 'Great against packed defense' }
    ]
  },

  // PICK AND ROLL PLAYS
  {
    title: 'Side Pick and Roll',
    description: 'Basic side pick and roll with spacing',
    category: 'Pick and Roll',
    tags: ['Pick and Roll', 'Side', 'Two-Man Game'],
    diagramJSON: {
      players: [
        { id: '1', label: '1', x: 200, y: 300 }, // Point guard on wing
        { id: '2', label: '2', x: 600, y: 350 }, // Shooting guard corner
        { id: '3', label: '3', x: 500, y: 450 }, // Small forward opposite
        { id: '4', label: '4', x: 350, y: 200 }, // Power forward high
        { id: '5', label: '5', x: 220, y: 250 }  // Center setting screen
      ],
      actions: [],
      courtDimensions: { width: 800, height: 600, threePointLineRadius: 280, keyWidth: 160, keyHeight: 190, basketPosition: { x: 400, y: 50 } }
    },
    effectiveness: [
      { defenseType: DefenseType.MAN_TO_MAN, rating: 9.0, difficulty: 4, notes: 'Fundamental action' },
      { defenseType: DefenseType.SWITCHING_MAN, rating: 8.0, difficulty: 5, notes: 'Creates mismatches' },
      { defenseType: DefenseType.HELP_AND_RECOVER, rating: 7.5, difficulty: 5 },
      { defenseType: DefenseType.ZONE_2_3, rating: 6.0, difficulty: 6, notes: 'Zone limits effectiveness' },
      { defenseType: DefenseType.PACK_LINE, rating: 8.5, difficulty: 4, notes: 'Forces pack line to help' }
    ]
  },

  {
    title: 'Top Pick and Roll',
    description: 'Center sets screen at top of key for point guard',
    category: 'Pick and Roll',
    tags: ['Pick and Roll', 'Top', 'Center Screen'],
    diagramJSON: {
      players: [
        { id: '1', label: '1', x: 400, y: 350 }, // Point guard at top
        { id: '2', label: '2', x: 150, y: 400 }, // Shooting guard corner
        { id: '3', label: '3', x: 650, y: 400 }, // Small forward corner
        { id: '4', label: '4', x: 320, y: 500 }, // Power forward low
        { id: '5', label: '5', x: 400, y: 300 }  // Center at screen position
      ],
      actions: [],
      courtDimensions: { width: 800, height: 600, threePointLineRadius: 280, keyWidth: 160, keyHeight: 190, basketPosition: { x: 400, y: 50 } }
    },
    effectiveness: [
      { defenseType: DefenseType.MAN_TO_MAN, rating: 8.5, difficulty: 4 },
      { defenseType: DefenseType.HELP_AND_RECOVER, rating: 7.0, difficulty: 5, notes: 'Help comes from weak side' },
      { defenseType: DefenseType.ZONE_1_3_1, rating: 5.5, difficulty: 7, notes: 'Zone designed to stop this' },
      { defenseType: DefenseType.SWITCHING_MAN, rating: 8.5, difficulty: 4, notes: 'Switch creates mismatch' }
    ]
  },

  // BASELINE OUT OF BOUNDS (BLOB)
  {
    title: 'Box BLOB',
    description: 'Four players in box formation for baseline inbound',
    category: 'BLOB',
    tags: ['BLOB', 'Box', 'Screen'],
    diagramJSON: {
      players: [
        { id: '1', label: '1', x: 400, y: 55 }, // Inbounder under basket
        { id: '2', label: '2', x: 320, y: 150 }, // Left block
        { id: '3', label: '3', x: 480, y: 150 }, // Right block
        { id: '4', label: '4', x: 320, y: 120 }, // Left elbow
        { id: '5', label: '5', x: 480, y: 120 }  // Right elbow
      ],
      actions: [],
      courtDimensions: { width: 800, height: 600, threePointLineRadius: 280, keyWidth: 160, keyHeight: 190, basketPosition: { x: 400, y: 50 } }
    },
    effectiveness: [
      { defenseType: DefenseType.MAN_TO_MAN, rating: 8.0, difficulty: 5, situation: GameSituation.BLOB },
      { defenseType: DefenseType.ZONE_2_3, rating: 7.0, difficulty: 6, situation: GameSituation.BLOB },
      { defenseType: DefenseType.SWITCHING_MAN, rating: 7.5, difficulty: 5, situation: GameSituation.BLOB },
      { defenseType: DefenseType.HELP_AND_RECOVER, rating: 8.5, difficulty: 5, situation: GameSituation.BLOB }
    ]
  },

  {
    title: 'Stack BLOB',
    description: 'Players stacked on one side for misdirection',
    category: 'BLOB',
    tags: ['BLOB', 'Stack', 'Misdirection'],
    diagramJSON: {
      players: [
        { id: '1', label: '1', x: 400, y: 55 }, // Inbounder
        { id: '2', label: '2', x: 350, y: 130 }, // Bottom of stack
        { id: '3', label: '3', x: 350, y: 150 }, // Second in stack
        { id: '4', label: '4', x: 350, y: 170 }, // Third in stack
        { id: '5', label: '5', x: 500, y: 200 }  // Opposite side
      ],
      actions: [],
      courtDimensions: { width: 800, height: 600, threePointLineRadius: 280, keyWidth: 160, keyHeight: 190, basketPosition: { x: 400, y: 50 } }
    },
    effectiveness: [
      { defenseType: DefenseType.MAN_TO_MAN, rating: 8.5, difficulty: 6, situation: GameSituation.BLOB },
      { defenseType: DefenseType.ZONE_2_3, rating: 6.5, difficulty: 7, situation: GameSituation.BLOB },
      { defenseType: DefenseType.SWITCHING_MAN, rating: 8.0, difficulty: 6, situation: GameSituation.BLOB }
    ]
  },

  // SIDELINE OUT OF BOUNDS (SLOB)
  {
    title: 'Line SLOB',
    description: 'Players in line formation for quick inbound',
    category: 'SLOB',
    tags: ['SLOB', 'Line', 'Quick'],
    diagramJSON: {
      players: [
        { id: '1', label: '1', x: 5, y: 300 }, // Inbounder on sideline
        { id: '2', label: '2', x: 100, y: 250 }, // First in line
        { id: '3', label: '3', x: 150, y: 250 }, // Second in line
        { id: '4', label: '4', x: 200, y: 250 }, // Third in line
        { id: '5', label: '5', x: 400, y: 200 }  // Center high post
      ],
      actions: [],
      courtDimensions: { width: 800, height: 600, threePointLineRadius: 280, keyWidth: 160, keyHeight: 190, basketPosition: { x: 400, y: 50 } }
    },
    effectiveness: [
      { defenseType: DefenseType.MAN_TO_MAN, rating: 7.5, difficulty: 4, situation: GameSituation.SLOB },
      { defenseType: DefenseType.ZONE_1_3_1, rating: 6.0, difficulty: 6, situation: GameSituation.SLOB },
      { defenseType: DefenseType.HELP_AND_RECOVER, rating: 8.0, difficulty: 4, situation: GameSituation.SLOB }
    ]
  },

  // ZONE OFFENSE
  {
    title: '1-4 High vs Zone',
    description: 'One guard with four across the free throw line',
    category: 'Zone Offense',
    tags: ['Zone', '1-4 High', 'Overload'],
    diagramJSON: {
      players: [
        { id: '1', label: '1', x: 400, y: 400 }, // Point guard
        { id: '2', label: '2', x: 200, y: 250 }, // Left wing
        { id: '3', label: '3', x: 350, y: 220 }, // Left post
        { id: '4', label: '4', x: 450, y: 220 }, // Right post
        { id: '5', label: '5', x: 600, y: 250 }  // Right wing
      ],
      actions: [],
      courtDimensions: { width: 800, height: 600, threePointLineRadius: 280, keyWidth: 160, keyHeight: 190, basketPosition: { x: 400, y: 50 } }
    },
    effectiveness: [
      { defenseType: DefenseType.ZONE_2_3, rating: 9.0, difficulty: 5, notes: 'Perfect alignment vs 2-3' },
      { defenseType: DefenseType.ZONE_3_2, rating: 7.5, difficulty: 6, notes: 'Overloads the middle' },
      { defenseType: DefenseType.ZONE_1_3_1, rating: 8.0, difficulty: 6 },
      { defenseType: DefenseType.MAN_TO_MAN, rating: 6.0, difficulty: 5, notes: 'Less effective vs man' }
    ]
  },

  {
    title: '2-3 Overload',
    description: 'Overload one side against zone defense',
    category: 'Zone Offense',
    tags: ['Zone', 'Overload', '2-3'],
    diagramJSON: {
      players: [
        { id: '1', label: '1', x: 400, y: 400 }, // Point guard
        { id: '2', label: '2', x: 180, y: 300 }, // Left wing
        { id: '3', label: '3', x: 200, y: 180 }, // Left corner
        { id: '4', label: '4', x: 280, y: 150 }, // Left post
        { id: '5', label: '5', x: 600, y: 350 }  // Right side alone
      ],
      actions: [],
      courtDimensions: { width: 800, height: 600, threePointLineRadius: 280, keyWidth: 160, keyHeight: 190, basketPosition: { x: 400, y: 50 } }
    },
    effectiveness: [
      { defenseType: DefenseType.ZONE_2_3, rating: 8.5, difficulty: 6, notes: 'Overloads weak side' },
      { defenseType: DefenseType.ZONE_3_2, rating: 8.0, difficulty: 6 },
      { defenseType: DefenseType.MATCHUP_ZONE, rating: 7.0, difficulty: 7, notes: 'Matchup can adjust' }
    ]
  },

  // PRESS BREAK
  {
    title: '1-4 Press Break',
    description: 'Four across formation to break full court press',
    category: 'Press Break',
    tags: ['Press Break', '1-4', 'Full Court'],
    diagramJSON: {
      players: [
        { id: '1', label: '1', x: 400, y: 580 }, // Point guard back court
        { id: '2', label: '2', x: 150, y: 500 }, // Left wing
        { id: '3', label: '3', x: 300, y: 480 }, // Left inside
        { id: '4', label: '4', x: 500, y: 480 }, // Right inside
        { id: '5', label: '5', x: 650, y: 500 }  // Right wing
      ],
      actions: [],
      courtDimensions: { width: 800, height: 600, threePointLineRadius: 280, keyWidth: 160, keyHeight: 190, basketPosition: { x: 400, y: 50 } }
    },
    effectiveness: [
      { defenseType: DefenseType.FULL_COURT_PRESS, rating: 9.0, difficulty: 5, situation: GameSituation.PRESS_BREAK },
      { defenseType: DefenseType.DIAMOND_PRESS, rating: 8.5, difficulty: 6, situation: GameSituation.PRESS_BREAK },
      { defenseType: DefenseType.PRESS_2_2_1, rating: 8.0, difficulty: 6, situation: GameSituation.PRESS_BREAK }
    ]
  },

  {
    title: 'Fast Break Lanes',
    description: 'Organized fast break with proper lane spacing',
    category: 'Transition',
    tags: ['Fast Break', 'Transition', 'Lanes'],
    diagramJSON: {
      players: [
        { id: '1', label: '1', x: 400, y: 500 }, // Point guard middle
        { id: '2', label: '2', x: 150, y: 450 }, // Left wing runner
        { id: '3', label: '3', x: 650, y: 450 }, // Right wing runner
        { id: '4', label: '4', x: 350, y: 400 }, // Left trailer
        { id: '5', label: '5', x: 450, y: 380 }  // Right trailer
      ],
      actions: [],
      courtDimensions: { width: 800, height: 600, threePointLineRadius: 280, keyWidth: 160, keyHeight: 190, basketPosition: { x: 400, y: 50 } }
    },
    effectiveness: [
      { defenseType: DefenseType.GET_BACK_DEFENSE, rating: 8.5, difficulty: 4, situation: GameSituation.AFTER_TURNOVER },
      { defenseType: DefenseType.SLOW_BREAK_DEFENSE, rating: 7.0, difficulty: 5, situation: GameSituation.AFTER_TURNOVER },
      { defenseType: DefenseType.FULL_COURT_PRESS, rating: 9.0, difficulty: 3, situation: GameSituation.AFTER_TURNOVER }
    ]
  },

  // END GAME PLAYS
  {
    title: 'Elevator Screen',
    description: 'Two players form elevator doors for shooter',
    category: 'End Game',
    tags: ['End Game', 'Elevator', 'Three-Point'],
    diagramJSON: {
      players: [
        { id: '1', label: '1', x: 100, y: 400 }, // Point guard with ball
        { id: '2', label: '2', x: 500, y: 500 }, // Shooter starting low
        { id: '3', label: '3', x: 350, y: 300 }, // Left elevator
        { id: '4', label: '4', x: 450, y: 300 }, // Right elevator
        { id: '5', label: '5', x: 400, y: 150 }  // Center high
      ],
      actions: [],
      courtDimensions: { width: 800, height: 600, threePointLineRadius: 280, keyWidth: 160, keyHeight: 190, basketPosition: { x: 400, y: 50 } }
    },
    effectiveness: [
      { defenseType: DefenseType.MAN_TO_MAN, rating: 9.0, difficulty: 7, situation: GameSituation.LAST_SHOT },
      { defenseType: DefenseType.SWITCHING_MAN, rating: 8.0, difficulty: 7, situation: GameSituation.LAST_SHOT },
      { defenseType: DefenseType.HELP_AND_RECOVER, rating: 8.5, difficulty: 7, situation: GameSituation.LAST_SHOT },
      { defenseType: DefenseType.ZONE_2_3, rating: 6.0, difficulty: 8, situation: GameSituation.LAST_SHOT }
    ]
  },

  {
    title: 'Chicago',
    description: 'Multiple screen action for end game three',
    category: 'End Game',
    tags: ['End Game', 'Chicago', 'Multiple Screens'],
    diagramJSON: {
      players: [
        { id: '1', label: '1', x: 200, y: 400 }, // Point guard
        { id: '2', label: '2', x: 600, y: 500 }, // Shooter in corner
        { id: '3', label: '3', x: 400, y: 200 }, // High post
        { id: '4', label: '4', x: 300, y: 350 }, // Screen setter
        { id: '5', label: '5', x: 500, y: 150 }  // Second screener
      ],
      actions: [
        { id: 'screen1', type: 'screen', from: { playerId: '4' }, to: { playerId: '2' } },
        { id: 'cut1', type: 'cut', from: { playerId: '2' }, to: { x: 400, y: 300 } },
        { id: 'screen2', type: 'screen', from: { playerId: '5' }, to: { playerId: '2' } },
        { id: 'cut2', type: 'cut', from: { playerId: '2' }, to: { x: 300, y: 200 } }
      ],
      courtDimensions: { width: 800, height: 600, threePointLineRadius: 280, keyWidth: 160, keyHeight: 190, basketPosition: { x: 400, y: 50 } }
    },
    effectiveness: [
      { defenseType: DefenseType.MAN_TO_MAN, rating: 8.5, difficulty: 8, situation: GameSituation.LAST_SHOT },
      { defenseType: DefenseType.SWITCHING_MAN, rating: 7.5, difficulty: 8, situation: GameSituation.LAST_SHOT },
      { defenseType: DefenseType.HELP_AND_RECOVER, rating: 8.0, difficulty: 8, situation: GameSituation.LAST_SHOT }
    ]
  }
]