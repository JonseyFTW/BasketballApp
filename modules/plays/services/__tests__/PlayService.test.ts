import { PlayService } from '../PlayService'
import { CreatePlayDto } from '../../types'
import { PlayDiagram } from '../../../common/types'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    play: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    playTag: {
      findMany: jest.fn(),
    },
    playerProfile: {
      findMany: jest.fn(),
    },
  },
}))

describe('PlayService', () => {
  let playService: PlayService
  
  beforeEach(() => {
    playService = new PlayService()
    jest.clearAllMocks()
  })

  describe('createPlay', () => {
    it('should create a play with valid data', async () => {
      const mockPlay = {
        id: '1',
        title: 'Test Play',
        description: 'Test Description',
        diagramJSON: {
          players: [
            { id: '1', label: '1', x: 100, y: 100 }
          ],
          actions: []
        },
        authorId: 'user-1',
        tags: [],
        author: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
        relationsFrom: [],
        relationsTo: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const { prisma } = require('@/lib/db')
      prisma.play.create.mockResolvedValue(mockPlay)

      const createDto: CreatePlayDto = {
        title: 'Test Play',
        description: 'Test Description',
        diagramJSON: {
          players: [
            { id: '1', label: '1', x: 100, y: 100 }
          ],
          actions: []
        },
        tagIds: [],
      }

      const result = await playService.createPlay(createDto, 'user-1')

      expect(result).toEqual(mockPlay)
      expect(prisma.play.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Play',
          description: 'Test Description',
          diagramJSON: createDto.diagramJSON,
          authorId: 'user-1',
          tags: undefined,
        },
        include: expect.any(Object),
      })
    })

    it('should throw error for invalid title', async () => {
      const createDto: CreatePlayDto = {
        title: '', // Invalid empty title
        diagramJSON: {
          players: [],
          actions: []
        },
      }

      await expect(playService.createPlay(createDto, 'user-1'))
        .rejects.toThrow('Play title is required')
    })

    it('should throw error for invalid diagram', async () => {
      const createDto: CreatePlayDto = {
        title: 'Valid Title',
        diagramJSON: {
          players: [], // No players
          actions: []
        },
      }

      await expect(playService.createPlay(createDto, 'user-1'))
        .rejects.toThrow('Play must have at least one player')
    })
  })

  describe('getPlayById', () => {
    it('should return play when found', async () => {
      const mockPlay = {
        id: '1',
        title: 'Test Play',
        author: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
        tags: [],
        relationsFrom: [],
        relationsTo: [],
      }

      const { prisma } = require('@/lib/db')
      prisma.play.findUnique.mockResolvedValue(mockPlay)

      const result = await playService.getPlayById('1')

      expect(result).toEqual(mockPlay)
      expect(prisma.play.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      })
    })

    it('should return null when play not found', async () => {
      const { prisma } = require('@/lib/db')
      prisma.play.findUnique.mockResolvedValue(null)

      const result = await playService.getPlayById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('validatePlay', () => {
    it('should validate a correct play', async () => {
      const validPlay: CreatePlayDto = {
        title: 'Valid Play',
        description: 'Valid description',
        diagramJSON: {
          players: [
            { id: '1', label: '1', x: 100, y: 100 },
            { id: '2', label: '2', x: 200, y: 200 },
          ],
          actions: [
            { id: 'action1', type: 'pass', from: { playerId: '1' }, to: { playerId: '2' } }
          ]
        },
      }

      const result = await playService.validatePlay(validPlay)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return warnings for high complexity', async () => {
      const complexPlay: CreatePlayDto = {
        title: 'Complex Play',
        diagramJSON: {
          players: [
            { id: '1', label: '1', x: 100, y: 100 },
            { id: '2', label: '2', x: 200, y: 200 },
            { id: '3', label: '3', x: 300, y: 300 },
            { id: '4', label: '4', x: 400, y: 400 },
            { id: '5', label: '5', x: 500, y: 500 },
          ],
          actions: Array(15).fill(null).map((_, i) => ({
            id: `action${i}`,
            type: 'cut',
            from: { x: i * 10, y: i * 10 },
            to: { x: i * 20, y: i * 20 }
          }))
        },
      }

      const result = await playService.validatePlay(complexPlay)

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('This play has high complexity and may be difficult to execute')
    })
  })
})