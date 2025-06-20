import { PrismaClient, TagCategory, RelationType, UserRole, DefenseType, GameSituation } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create default play tags
  const playTags = [
    // Type tags
    { name: 'Primary', category: TagCategory.TYPE, description: 'Primary offensive option', color: '#10B981' },
    { name: 'Counter', category: TagCategory.TYPE, description: 'Counter play to primary', color: '#F59E0B' },
    { name: 'Decoy', category: TagCategory.TYPE, description: 'Decoy or misdirection play', color: '#8B5CF6' },
    { name: 'Quick Hitter', category: TagCategory.TYPE, description: 'Quick scoring option', color: '#EF4444' },
    
    // Situation tags
    { name: 'BLOB', category: TagCategory.SITUATION, description: 'Baseline Out of Bounds', color: '#3B82F6' },
    { name: 'SLOB', category: TagCategory.SITUATION, description: 'Sideline Out of Bounds', color: '#06B6D4' },
    { name: 'Under 5s', category: TagCategory.SITUATION, description: 'Less than 5 seconds on clock', color: '#DC2626' },
    { name: 'Under 10s', category: TagCategory.SITUATION, description: 'Less than 10 seconds on clock', color: '#F97316' },
    { name: 'End of Quarter', category: TagCategory.SITUATION, description: 'End of quarter situation', color: '#7C3AED' },
    { name: '2-for-1', category: TagCategory.SITUATION, description: '2-for-1 opportunity', color: '#059669' },
    { name: 'Need 3', category: TagCategory.SITUATION, description: 'Need 3-pointer', color: '#B91C1C' },
    
    // Defense tags
    { name: 'vs Zone', category: TagCategory.DEFENSE, description: 'Against zone defense', color: '#1F2937' },
    { name: 'vs Man', category: TagCategory.DEFENSE, description: 'Against man-to-man defense', color: '#374151' },
    { name: 'vs Press', category: TagCategory.DEFENSE, description: 'Against full-court press', color: '#4B5563' },
    
    // Tempo tags
    { name: 'Fast Break', category: TagCategory.TEMPO, description: 'Fast break situation', color: '#16A34A' },
    { name: 'Half Court', category: TagCategory.TEMPO, description: 'Half court set', color: '#2563EB' },
    { name: 'Delay', category: TagCategory.TEMPO, description: 'Delay or clock management', color: '#7C2D12' },
  ]

  for (const tag of playTags) {
    await prisma.playTag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    })
  }

  // Create demo team
  const demoTeam = await prisma.team.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'Demo Basketball Team',
      description: 'Demo team for testing the application',
    },
  })

  // Create additional demo team
  const demoTeam2 = await prisma.team.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      name: 'Demo Team Two',
      description: 'Second demo team for testing',
    },
  })

  // Create demo coach user
  const hashedPassword = await bcrypt.hash('password123', 12)
  const demoCoach = await prisma.user.upsert({
    where: { email: 'coach@demo.com' },
    update: {},
    create: {
      email: 'coach@demo.com',
      name: 'Demo Coach',
      passwordHash: hashedPassword,
      role: UserRole.COACH,
      teamId: demoTeam.id,
    },
  })

  // Create demo player profiles
  const demoPlayers = [
    {
      name: 'John Smith',
      number: 1,
      position: 'PG',
      attributes: {
        speed: 85,
        size: 70,
        shooting: 80,
        ballHandling: 90,
        defense: 75,
        rebounding: 60,
      }
    },
    {
      name: 'Mike Johnson',
      number: 2,
      position: 'SG',
      attributes: {
        speed: 80,
        size: 75,
        shooting: 90,
        ballHandling: 70,
        defense: 80,
        rebounding: 65,
      }
    },
    {
      name: 'David Wilson',
      number: 3,
      position: 'SF',
      attributes: {
        speed: 75,
        size: 85,
        shooting: 75,
        ballHandling: 65,
        defense: 85,
        rebounding: 80,
      }
    },
    {
      name: 'Chris Brown',
      number: 4,
      position: 'PF',
      attributes: {
        speed: 65,
        size: 90,
        shooting: 60,
        ballHandling: 50,
        defense: 90,
        rebounding: 95,
      }
    },
    {
      name: 'Alex Davis',
      number: 5,
      position: 'C',
      attributes: {
        speed: 50,
        size: 95,
        shooting: 55,
        ballHandling: 40,
        defense: 95,
        rebounding: 100,
      }
    },
  ]

  for (const player of demoPlayers) {
    await prisma.playerProfile.upsert({
      where: { id: `${player.number}` },
      update: {},
      create: {
        id: `${player.number}`,
        name: player.name,
        number: player.number,
        position: player.position,
        teamId: demoTeam.id,
        coachId: demoCoach.id,
        attributes: player.attributes,
      },
    })
  }

  // Create sample plays
  const samplePlays = [
    {
      id: 'play-horns',
      title: 'Horns Set',
      description: 'Basic horns formation with high post screens',
      diagramJSON: {
        players: [
          { id: '1', label: '1', position: 'PG', x: 400, y: 500 },
          { id: '2', label: '2', position: 'SG', x: 200, y: 300 },
          { id: '3', label: '3', position: 'SF', x: 600, y: 300 },
          { id: '4', label: '4', position: 'PF', x: 300, y: 200 },
          { id: '5', label: '5', position: 'C', x: 500, y: 200 },
        ],
        actions: [
          { id: 'action1', type: 'screen', from: { playerId: '4' }, to: { playerId: '1' } },
          { id: 'action2', type: 'cut', from: { playerId: '1' }, to: { x: 450, y: 150 } },
        ],
      },
      tags: ['Primary', 'Half Court'],
    },
    {
      id: 'play-box-out',
      title: 'Box BLOB',
      description: 'Baseline out of bounds play with box formation',
      diagramJSON: {
        players: [
          { id: '1', label: '1', position: 'PG', x: 100, y: 400 },
          { id: '2', label: '2', position: 'SG', x: 300, y: 480 },
          { id: '3', label: '3', position: 'SF', x: 500, y: 480 },
          { id: '4', label: '4', position: 'PF', x: 300, y: 420 },
          { id: '5', label: '5', position: 'C', x: 500, y: 420 },
        ],
        actions: [
          { id: 'action1', type: 'screen', from: { playerId: '5' }, to: { playerId: '2' } },
          { id: 'action2', type: 'cut', from: { playerId: '2' }, to: { x: 400, y: 350 } },
        ],
      },
      tags: ['BLOB', 'Primary'],
    },
  ]

  for (const play of samplePlays) {
    const createdPlay = await prisma.play.upsert({
      where: { id: play.id },
      update: {},
      create: {
        id: play.id,
        title: play.title,
        description: play.description,
        diagramJSON: play.diagramJSON,
        authorId: demoCoach.id,
      },
    })

    // Connect tags
    for (const tagName of play.tags) {
      const tag = await prisma.playTag.findUnique({ where: { name: tagName } })
      if (tag) {
        await prisma.play.update({
          where: { id: createdPlay.id },
          data: {
            tags: {
              connect: { id: tag.id },
            },
          },
        })
      }
    }
  }

  // Create play relations
  const hornsPlay = await prisma.play.findUnique({ where: { id: 'play-horns' } })
  const boxPlay = await prisma.play.findUnique({ where: { id: 'play-box-out' } })

  if (hornsPlay && boxPlay) {
    await prisma.playRelation.upsert({
      where: {
        playId_relatedPlayId_relationType: {
          playId: hornsPlay.id,
          relatedPlayId: boxPlay.id,
          relationType: RelationType.ALTERNATIVE,
        },
      },
      update: {},
      create: {
        playId: hornsPlay.id,
        relatedPlayId: boxPlay.id,
        relationType: RelationType.ALTERNATIVE,
        description: 'Alternative when primary is not available',
      },
    })
  }

  // Create sample game plan
  const sampleGamePlan = await prisma.gamePlan.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      title: 'vs Lakers Game Plan',
      description: 'Game plan for upcoming game against Lakers',
      opponent: 'Lakers',
      defenseType: 'Zone',
      createdById: demoCoach.id,
    },
  })

  // Add plays to game plan
  if (hornsPlay) {
    await prisma.gamePlanItem.upsert({
      where: {
        gamePlanId_playId: {
          gamePlanId: sampleGamePlan.id,
          playId: hornsPlay.id,
        },
      },
      update: {},
      create: {
        gamePlanId: sampleGamePlan.id,
        playId: hornsPlay.id,
        orderIndex: 1,
        section: 'Half Court Sets',
        notes: 'Use against their zone defense',
      },
    })
  }

  if (boxPlay) {
    await prisma.gamePlanItem.upsert({
      where: {
        gamePlanId_playId: {
          gamePlanId: sampleGamePlan.id,
          playId: boxPlay.id,
        },
      },
      update: {},
      create: {
        gamePlanId: sampleGamePlan.id,
        playId: boxPlay.id,
        orderIndex: 2,
        section: 'Special Situations',
        notes: 'Go-to BLOB play',
      },
    })
  }

  // Add effectiveness data for plays
  if (hornsPlay) {
    const hornsEffectiveness = [
      { defenseType: DefenseType.ZONE_2_3, rating: 8.5, difficulty: 6, situation: GameSituation.GENERAL },
      { defenseType: DefenseType.ZONE_3_2, rating: 7.0, difficulty: 6, situation: GameSituation.GENERAL },
      { defenseType: DefenseType.MAN_TO_MAN, rating: 7.5, difficulty: 5, situation: GameSituation.GENERAL },
      { defenseType: DefenseType.HELP_AND_RECOVER, rating: 6.5, difficulty: 7, situation: GameSituation.GENERAL },
    ]

    for (const eff of hornsEffectiveness) {
      await prisma.playEffectiveness.upsert({
        where: {
          playId_defenseType_situation: {
            playId: hornsPlay.id,
            defenseType: eff.defenseType,
            situation: eff.situation
          }
        },
        update: {},
        create: {
          playId: hornsPlay.id,
          defenseType: eff.defenseType,
          rating: eff.rating,
          difficulty: eff.difficulty,
          situation: eff.situation,
          notes: `Effectiveness rating for ${eff.defenseType} defense`,
          isVerified: true
        }
      })
    }
  }

  if (boxPlay) {
    const boxEffectiveness = [
      { defenseType: DefenseType.ZONE_2_3, rating: 9.0, difficulty: 4, situation: GameSituation.BLOB },
      { defenseType: DefenseType.MAN_TO_MAN, rating: 8.0, difficulty: 5, situation: GameSituation.BLOB },
      { defenseType: DefenseType.SWITCHING_MAN, rating: 7.5, difficulty: 6, situation: GameSituation.BLOB },
    ]

    for (const eff of boxEffectiveness) {
      await prisma.playEffectiveness.upsert({
        where: {
          playId_defenseType_situation: {
            playId: boxPlay.id,
            defenseType: eff.defenseType,
            situation: eff.situation
          }
        },
        update: {},
        create: {
          playId: boxPlay.id,
          defenseType: eff.defenseType,
          rating: eff.rating,
          difficulty: eff.difficulty,
          situation: eff.situation,
          notes: `BLOB effectiveness vs ${eff.defenseType}`,
          isVerified: true
        }
      })
    }
  }

  // Create second game plan
  const sampleGamePlan2 = await prisma.gamePlan.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      title: 'vs Warriors Game Plan',
      description: 'Game plan for upcoming game against Warriors',
      opponent: 'Warriors',
      defenseType: 'Man',
      createdById: demoCoach.id,
    },
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })