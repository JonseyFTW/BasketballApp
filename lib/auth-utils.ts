import bcrypt from 'bcryptjs'
import { prisma } from './db'
import { UserRole } from '@prisma/client'

export async function createUser(
  email: string,
  password: string,
  name: string,
  role: UserRole = UserRole.COACH
) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create the user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashedPassword,
      role,
    },
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}

export async function validatePassword(password: string): Promise<string | null> {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number'
  }
  
  return null
}

export async function verifyUserSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { team: true }
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}