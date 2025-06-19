import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import {
  UserWithRelations,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
  UserQueryParams,
  UserStats,
  CreatePlayerProfileDto,
  UpdatePlayerProfileDto,
  PlayerQueryParams,
  CreateTeamDto,
  UpdateTeamDto,
  TeamQueryParams,
  DEFAULT_PERMISSIONS
} from '../types'
import {
  createSuccessResponse,
  createErrorResponse,
  handleServiceError,
  validateEmail,
  AppError
} from '../../common/utils'
import { validatePassword } from '@/lib/auth-utils'
import { UserRole, Prisma } from '@prisma/client'

export class UserService {

  async createUser(dto: CreateUserDto): Promise<UserWithRelations> {
    try {
      // Validate input
      if (!validateEmail(dto.email)) {
        throw new AppError('Invalid email address', 400)
      }

      const passwordError = await validatePassword(dto.password)
      if (passwordError) {
        throw new AppError(passwordError, 400)
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: dto.email }
      })

      if (existingUser) {
        throw new AppError('User with this email already exists', 400)
      }

      // Validate team if provided
      if (dto.teamId) {
        const team = await prisma.team.findUnique({
          where: { id: dto.teamId }
        })
        if (!team) {
          throw new AppError('Team not found', 404)
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(dto.password, 12)

      // Create user
      const user = await prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          passwordHash: hashedPassword,
          role: dto.role || UserRole.COACH,
          teamId: dto.teamId,
        },
        include: {
          team: true,
          _count: {
            select: {
              plays: true,
              gamePlans: true,
              playersCoached: true,
            }
          }
        },
      })

      return user as UserWithRelations
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getUserById(id: string, includeStats = false): Promise<UserWithRelations | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          team: true,
          ...(includeStats && {
            plays: {
              select: { id: true, title: true, createdAt: true },
              orderBy: { createdAt: 'desc' },
              take: 5
            },
            gamePlans: {
              select: { id: true, title: true, createdAt: true },
              orderBy: { createdAt: 'desc' },
              take: 5
            },
            playersCoached: true,
          }),
          _count: {
            select: {
              plays: true,
              gamePlans: true,
              playersCoached: true,
            }
          }
        },
      })

      return user as UserWithRelations | null
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getUserByEmail(email: string): Promise<UserWithRelations | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          team: true,
          _count: {
            select: {
              plays: true,
              gamePlans: true,
              playersCoached: true,
            }
          }
        },
      })

      return user as UserWithRelations | null
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getUsers(params: UserQueryParams = {}) {
    try {
      const {
        role,
        teamId,
        search,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        includeStats = false
      } = params

      // Build where clause
      const where: Prisma.UserWhereInput = {
        ...(role && { role }),
        ...(teamId && { teamId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }),
      }

      // Get total count
      const total = await prisma.user.count({ where })

      // Get users
      const users = await prisma.user.findMany({
        where,
        include: {
          team: {
            select: { id: true, name: true }
          },
          ...(includeStats && {
            plays: {
              select: { id: true, title: true, createdAt: true },
              orderBy: { createdAt: 'desc' },
              take: 3
            },
            gamePlans: {
              select: { id: true, title: true, createdAt: true },
              orderBy: { createdAt: 'desc' },
              take: 3
            },
          }),
          _count: {
            select: {
              plays: true,
              gamePlans: true,
              playersCoached: true,
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      })

      return {
        users: users as UserWithRelations[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserWithRelations> {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      })

      if (!existingUser) {
        throw new AppError('User not found', 404)
      }

      // Validate email if being updated
      if (dto.email && dto.email !== existingUser.email) {
        if (!validateEmail(dto.email)) {
          throw new AppError('Invalid email address', 400)
        }

        // Check if email is already taken
        const emailTaken = await prisma.user.findUnique({
          where: { email: dto.email }
        })

        if (emailTaken) {
          throw new AppError('Email already in use', 400)
        }
      }

      // Validate team if provided
      if (dto.teamId) {
        const team = await prisma.team.findUnique({
          where: { id: dto.teamId }
        })
        if (!team) {
          throw new AppError('Team not found', 404)
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.email && { email: dto.email }),
          ...(dto.role && { role: dto.role }),
          ...(dto.teamId !== undefined && { teamId: dto.teamId }),
          ...(dto.image !== undefined && { image: dto.image }),
        },
        include: {
          team: true,
          _count: {
            select: {
              plays: true,
              gamePlans: true,
              playersCoached: true,
            }
          }
        },
      })

      return updatedUser as UserWithRelations
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async updateUserPassword(id: string, dto: UpdateUserPasswordDto): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { passwordHash: true }
      })

      if (!user || !user.passwordHash) {
        throw new AppError('User not found or no password set', 404)
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash)
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400)
      }

      // Validate new password
      const passwordError = await validatePassword(dto.newPassword)
      if (passwordError) {
        throw new AppError(passwordError, 400)
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(dto.newPassword, 12)

      // Update password
      await prisma.user.update({
        where: { id },
        data: { passwordHash: hashedPassword }
      })
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      })

      if (!user) {
        throw new AppError('User not found', 404)
      }

      await prisma.user.delete({
        where: { id }
      })
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  // Player Profile Management
  async createPlayerProfile(dto: CreatePlayerProfileDto, coachId: string) {
    try {
      // Validate team if provided
      if (dto.teamId) {
        const team = await prisma.team.findUnique({
          where: { id: dto.teamId }
        })
        if (!team) {
          throw new AppError('Team not found', 404)
        }
      }

      // Check if player number is already taken in the team
      if (dto.number && dto.teamId) {
        const existingPlayer = await prisma.playerProfile.findFirst({
          where: {
            teamId: dto.teamId,
            number: dto.number
          }
        })

        if (existingPlayer) {
          throw new AppError(`Player number ${dto.number} is already taken in this team`, 400)
        }
      }

      const player = await prisma.playerProfile.create({
        data: {
          name: dto.name,
          number: dto.number,
          position: dto.position,
          attributes: dto.attributes as Prisma.JsonObject,
          teamId: dto.teamId,
          coachId,
        },
        include: {
          team: true,
          coach: {
            select: { id: true, name: true, email: true }
          }
        },
      })

      return player
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getPlayerProfiles(params: PlayerQueryParams = {}) {
    try {
      const {
        teamId,
        coachId,
        position,
        search,
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc'
      } = params

      const where: Prisma.PlayerProfileWhereInput = {
        ...(teamId && { teamId }),
        ...(coachId && { coachId }),
        ...(position && { position }),
        ...(search && {
          name: { contains: search, mode: 'insensitive' }
        }),
      }

      const [players, total] = await Promise.all([
        prisma.playerProfile.findMany({
          where,
          include: {
            team: {
              select: { id: true, name: true }
            },
            coach: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.playerProfile.count({ where })
      ])

      return {
        players,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async updatePlayerProfile(id: string, dto: UpdatePlayerProfileDto, coachId: string) {
    try {
      const existingPlayer = await prisma.playerProfile.findUnique({
        where: { id },
        select: { coachId: true, teamId: true, number: true }
      })

      if (!existingPlayer) {
        throw new AppError('Player not found', 404)
      }

      if (existingPlayer.coachId !== coachId) {
        throw new AppError('Not authorized to update this player', 403)
      }

      // Check if new number conflicts
      if (dto.number && dto.number !== existingPlayer.number && dto.teamId) {
        const conflictingPlayer = await prisma.playerProfile.findFirst({
          where: {
            teamId: dto.teamId,
            number: dto.number,
            id: { not: id }
          }
        })

        if (conflictingPlayer) {
          throw new AppError(`Player number ${dto.number} is already taken in this team`, 400)
        }
      }

      const updatedPlayer = await prisma.playerProfile.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.number !== undefined && { number: dto.number }),
          ...(dto.position !== undefined && { position: dto.position }),
          ...(dto.attributes && { attributes: dto.attributes as Prisma.JsonObject }),
          ...(dto.teamId !== undefined && { teamId: dto.teamId }),
        },
        include: {
          team: true,
          coach: {
            select: { id: true, name: true, email: true }
          }
        },
      })

      return updatedPlayer
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  // Team Management
  async createTeam(dto: CreateTeamDto) {
    try {
      if (!dto.name || dto.name.trim().length === 0) {
        throw new AppError('Team name is required', 400)
      }

      const team = await prisma.team.create({
        data: {
          name: dto.name,
          description: dto.description,
        },
        include: {
          users: {
            select: { id: true, name: true, email: true, role: true }
          },
          players: true,
          _count: {
            select: { users: true, players: true }
          }
        },
      })

      return team
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getTeams(params: TeamQueryParams = {}) {
    try {
      const {
        search,
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc',
        includeMembers = false
      } = params

      const where: Prisma.TeamWhereInput = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }),
      }

      const [teams, total] = await Promise.all([
        prisma.team.findMany({
          where,
          include: {
            ...(includeMembers && {
              users: {
                select: { id: true, name: true, email: true, role: true }
              },
              players: true,
            }),
            _count: {
              select: { users: true, players: true }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.team.count({ where })
      ])

      return {
        teams,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const [
        totalUsers,
        usersByRole,
        recentUsers,
        topCoaches
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.groupBy({
          by: ['role'],
          _count: { id: true }
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        prisma.user.findMany({
          where: { role: UserRole.COACH },
          include: {
            _count: {
              select: { plays: true, gamePlans: true }
            }
          },
          orderBy: [
            { plays: { _count: 'desc' } },
            { gamePlans: { _count: 'desc' } }
          ],
          take: 5
        })
      ])

      const usersByRoleMap = usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.id
        return acc
      }, {} as Record<UserRole, number>)

      // Fill in missing roles with 0
      Object.values(UserRole).forEach(role => {
        if (!(role in usersByRoleMap)) {
          usersByRoleMap[role] = 0
        }
      })

      return {
        totalUsers,
        usersByRole: usersByRoleMap,
        activeUsers: totalUsers, // Simplified - in real app would check session activity
        newUsersThisMonth: recentUsers,
        topCoaches: topCoaches.map(coach => ({
          id: coach.id,
          name: coach.name,
          playsCreated: coach._count.plays,
          gamePlansCreated: coach._count.gamePlans,
        }))
      }
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getUserPermissions(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      })

      if (!user) {
        throw new AppError('User not found', 404)
      }

      return DEFAULT_PERMISSIONS[user.role]
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async searchUsers(query: string, limit = 5) {
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true
        },
        take: limit,
      })

      return users
    } catch (error) {
      throw handleServiceError(error)
    }
  }
}