import { PrismaClient } from '@prisma/client'
import { STARTER_PLAYS } from '../modules/live/data/starterPlays'

const prisma = new PrismaClient()

async function seedStarterPlays() {
  console.log('🏀 Starting to seed basketball plays...')

  try {
    // First, create a system user for these plays if it doesn't exist
    let systemUser = await prisma.user.findUnique({
      where: { email: 'system@basketballcoach.app' }
    })

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: 'system@basketballcoach.app',
          name: 'Basketball Coach System',
          role: 'ADMIN'
        }
      })
      console.log('✅ Created system user')
    }

    // Create necessary tags if they don't exist
    const tagNames = [
      // Motion tags
      'Motion', 'Continuity', 'Ball Movement',
      // Formation tags
      'Horns', 'Box', 'Stack', 'Line', '5-Out', '1-4 High',
      // Action tags
      'Screens', 'Pick and Roll', 'Flare', 'Split', 'Drive',
      // Situation tags
      'BLOB', 'SLOB', 'Press Break', 'End Game', 'Transition',
      'Fast Break', 'Zone', 'Three-Point', 'Two-Man Game',
      // Strategy tags
      'Overload', 'Misdirection', 'Quick', 'Multiple Screens',
      'Elevator', 'Chicago', 'Lanes'
    ]

    const createdTags = await Promise.all(
      tagNames.map(async (tagName) => {
        return await prisma.playTag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            category: getTagCategory(tagName),
            color: getTagColor(tagName)
          }
        })
      })
    )

    console.log(`✅ Created/verified ${createdTags.length} tags`)

    let playsCreated = 0
    let effectivenessCreated = 0

    // Create each play with its effectiveness ratings
    for (const starterPlay of STARTER_PLAYS) {
      // Find the tags for this play
      const playTags = await prisma.playTag.findMany({
        where: {
          name: { in: starterPlay.tags }
        }
      })

      // Create the play
      const play = await prisma.play.create({
        data: {
          title: starterPlay.title,
          description: starterPlay.description,
          diagramJSON: starterPlay.diagramJSON as any,
          authorId: systemUser.id,
          tags: {
            connect: playTags.map(tag => ({ id: tag.id }))
          }
        }
      })

      playsCreated++

      // Create effectiveness ratings for this play
      for (const effectiveness of starterPlay.effectiveness) {
        await prisma.playEffectiveness.create({
          data: {
            playId: play.id,
            defenseType: effectiveness.defenseType,
            rating: effectiveness.rating,
            difficulty: effectiveness.difficulty,
            situation: effectiveness.situation,
            notes: effectiveness.notes,
            isVerified: true // Mark system plays as verified
          }
        })
        effectivenessCreated++
      }

      console.log(`✅ Created play: ${starterPlay.title} with ${starterPlay.effectiveness.length} effectiveness ratings`)
    }

    console.log(`\n🎉 Seeding completed successfully!`)
    console.log(`📊 Summary:`)
    console.log(`   - Created ${playsCreated} plays`)
    console.log(`   - Created ${effectivenessCreated} effectiveness ratings`)
    console.log(`   - Created/verified ${createdTags.length} tags`)

  } catch (error) {
    console.error('❌ Error seeding starter plays:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

function getTagCategory(tagName: string) {
  // Categorize tags based on their name
  const situationTags = ['BLOB', 'SLOB', 'End Game', 'Press Break', 'Transition', 'Fast Break']
  const defenseTags = ['Zone', 'Press Break']
  const tempoTags = ['Quick', 'Fast Break', 'Transition']
  
  if (situationTags.includes(tagName)) return 'SITUATION'
  if (defenseTags.includes(tagName)) return 'DEFENSE'
  if (tempoTags.includes(tagName)) return 'TEMPO'
  return 'TYPE' // Default to TYPE for most tags
}

function getTagColor(tagName: string): string {
  // Assign colors based on tag type
  const colorMap: { [key: string]: string } = {
    // Motion/Continuity - Blue shades
    'Motion': '#3B82F6',
    'Continuity': '#1D4ED8',
    'Ball Movement': '#60A5FA',
    
    // Formations - Green shades
    'Horns': '#10B981',
    'Box': '#059669',
    'Stack': '#047857',
    'Line': '#065F46',
    '5-Out': '#34D399',
    '1-4 High': '#6EE7B7',
    
    // Actions - Purple shades
    'Screens': '#8B5CF6',
    'Pick and Roll': '#7C3AED',
    'Flare': '#A78BFA',
    'Split': '#9333EA',
    'Drive': '#C084FC',
    
    // Situations - Orange shades
    'BLOB': '#F97316',
    'SLOB': '#EA580C',
    'End Game': '#DC2626',
    'Press Break': '#EF4444',
    'Quick': '#F59E0B',
    
    // Strategy - Red/Pink shades
    'Overload': '#EC4899',
    'Misdirection': '#DB2777',
    'Multiple Screens': '#BE185D',
    'Elevator': '#9D174D',
    'Chicago': '#831843',
    
    // Zone/Defense - Teal shades
    'Zone': '#14B8A6',
    'Three-Point': '#0D9488',
    'Two-Man Game': '#0F766E'
  }

  return colorMap[tagName] || '#6B7280' // Default gray
}

// Run the seeding function
if (require.main === module) {
  seedStarterPlays()
    .then(() => {
      console.log('✅ Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}

export { seedStarterPlays }