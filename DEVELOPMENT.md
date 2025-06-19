# Development Guide

This guide provides detailed instructions for setting up and developing the Basketball Coach App locally.

## Prerequisites

### Required Software
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)
- **Git** - [Download here](https://git-scm.com/)

### Recommended Tools
- **Visual Studio Code** with extensions:
  - TypeScript and JavaScript Language Features
  - Prisma
  - Tailwind CSS IntelliSense
  - Docker
  - GitLens

## Quick Start (Windows with Docker Desktop)

### Option 1: Automated Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd basketball-coach-app
   ```

2. **Run the setup script**
   ```powershell
   .\scripts\dev-setup.ps1
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

### Option 2: Manual Setup

1. **Start Docker Desktop**
   - Make sure Docker Desktop is running
   - Enable Linux containers (default)

2. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd basketball-coach-app
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Start database services**
   ```bash
   docker-compose up -d postgres redis
   ```

5. **Setup database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## Docker Development Options

### Option A: Local Development with Docker Database
```bash
# Start only database services
docker-compose up -d postgres redis

# Run app locally
npm run dev
```

### Option B: Full Docker Development
```bash
# Start everything in Docker
docker-compose --profile dev up
```

### Option C: Production-like Environment
```bash
# Build and run production containers
docker-compose up --build
```

## Environment Configuration

### Required Environment Variables

Create a `.env` file with these variables:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/basketball_coach_app?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# Optional: OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Optional: Redis (for caching)
REDIS_URL="redis://localhost:6379"
```

### Docker Environment Variables

For Docker environments, the database URL changes:
```env
DATABASE_URL="postgresql://postgres:password@postgres:5432/basketball_coach_app?schema=public"
REDIS_URL="redis://redis:6379"
```

## Database Management

### Common Commands
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Create and apply migrations
npx prisma migrate dev --name migration_name

# Reset database (careful!)
npx prisma migrate reset

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Schema Changes
1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` for development
3. For production: create migration with `npx prisma migrate dev`

## Development Workflow

### 1. Starting Development
```bash
# Start database (if not using full Docker)
docker-compose up -d postgres redis

# Start development server
npm run dev

# In another terminal, open Prisma Studio
npx prisma studio
```

### 2. Making Changes
- **Frontend**: Edit files in `app/`, `components/`, changes auto-reload
- **Backend**: Edit API routes in `app/api/`, auto-reload on save
- **Database**: Edit schema in `prisma/schema.prisma`, run `npx prisma db push`

### 3. Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests (install Cypress first)
npm run test:e2e
```

## Project Structure Deep Dive

```
basketball-coach-app/
├── app/                          # Next.js 13+ App Router
│   ├── api/                      # API routes
│   ├── auth/                     # Authentication pages
│   ├── designer/                 # Play designer page
│   ├── plays/                    # Play management pages
│   ├── share/                    # Shared content pages
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   ├── layout/                   # Layout components
│   ├── play-designer/            # Play designer components
│   ├── game-plan-builder/        # Game plan builder components
│   └── forms/                    # Form components
├── modules/                      # Domain modules (Clean Architecture)
│   ├── common/                   # Shared utilities and types
│   ├── plays/                    # Play management domain
│   ├── gamePlans/                # Game plan domain
│   └── users/                    # User management domain
├── lib/                          # Utility libraries
│   ├── auth.ts                   # NextAuth configuration
│   ├── db.ts                     # Prisma client
│   ├── utils.ts                  # Common utilities
│   └── export/                   # Export utilities (PDF, etc.)
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Database seeding
│   └── migrations/               # Migration files
├── public/                       # Static assets
├── scripts/                      # Setup and utility scripts
├── types/                        # Global type definitions
└── __tests__/                    # Global test files
```

## Key Technologies

### Frontend Stack
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **React Konva** - Canvas library for play designer
- **React Flow** - Node-based diagrams for game plans
- **shadcn/ui** - Component library
- **React Hook Form** - Form management
- **Zustand** - State management

### Backend Stack
- **Next.js API Routes** - Backend API
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **NextAuth.js** - Authentication
- **bcryptjs** - Password hashing

### Development Tools
- **TypeScript** - Static typing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Cypress** - E2E testing

## Common Development Tasks

### Adding a New Feature

1. **Define Types** (if needed)
   ```typescript
   // types/new-feature.ts or in relevant module
   export interface NewFeature {
     id: string
     name: string
   }
   ```

2. **Update Database Schema** (if needed)
   ```prisma
   // prisma/schema.prisma
   model NewFeature {
     id   String @id @default(cuid())
     name String
   }
   ```

3. **Create Service Layer**
   ```typescript
   // modules/feature/services/FeatureService.ts
   export class FeatureService {
     async createFeature(data: CreateFeatureDto) {
       // Business logic here
     }
   }
   ```

4. **Add API Routes**
   ```typescript
   // app/api/features/route.ts
   export async function GET() {
     // Handle GET requests
   }
   ```

5. **Create UI Components**
   ```typescript
   // components/feature/FeatureComponent.tsx
   export function FeatureComponent() {
     // React component
   }
   ```

6. **Add Tests**
   ```typescript
   // components/__tests__/FeatureComponent.test.tsx
   // modules/feature/services/__tests__/FeatureService.test.ts
   ```

### Debugging

#### Database Issues
```bash
# Check database status
docker-compose ps

# View database logs
docker-compose logs postgres

# Connect to database directly
docker-compose exec postgres psql -U postgres -d basketball_coach_app

# Reset everything
docker-compose down -v
docker-compose up -d postgres redis
npx prisma db push
npm run db:seed
```

#### Application Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check logs
docker-compose logs app
```

#### Port Conflicts
```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F

# Use different port
PORT=3001 npm run dev
```

## Performance Optimization

### Development Performance
- Use `npm run dev` for hot reloading
- Keep Docker Desktop allocated enough resources (8GB+ RAM recommended)
- Use `.dockerignore` to exclude unnecessary files
- Use `next/bundle-analyzer` to analyze bundle size

### Database Performance
- Add indexes for frequently queried fields
- Use `select` to limit returned fields
- Use pagination for large datasets
- Monitor queries with Prisma query logging

## Deployment Preparation

### Building for Production
```bash
# Build the application
npm run build

# Test production build locally
npm run start

# Build Docker image
docker build -t basketball-coach-app .

# Test Docker image
docker run -p 3000:3000 basketball-coach-app
```

### Environment Setup
1. Set production environment variables
2. Configure database connection
3. Set up domain and SSL
4. Configure OAuth providers for production URLs

## Troubleshooting

### Common Issues

**Docker Desktop not starting**
- Restart Docker Desktop
- Check Windows features: Hyper-V, WSL2
- Run as administrator

**Database connection failed**
- Check if PostgreSQL container is running: `docker-compose ps`
- Verify DATABASE_URL in .env
- Check firewall settings

**Prisma client errors**
- Regenerate client: `npx prisma generate`
- Check schema syntax: `npx prisma validate`

**Authentication not working**
- Check NEXTAUTH_SECRET is set and long enough (32+ characters)
- Verify NEXTAUTH_URL matches your domain
- Check OAuth provider configuration

**Build failures**
- Clear .next folder: `rm -rf .next`
- Check TypeScript errors: `npm run type-check`
- Verify all imports are correct

### Getting Help

1. Check the README.md for basic setup
2. Look at existing tests for examples
3. Check the CLAUDE.md file for architectural guidance
4. Review the project's GitHub issues
5. Check Next.js, Prisma, and other technology documentation

## Best Practices

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Write tests for business logic
- Use proper error handling
- Add JSDoc comments for complex functions

### Database
- Always use migrations for schema changes in production
- Seed data should be idempotent
- Use proper indexes for performance
- Validate data at the service layer

### Security
- Never commit .env files
- Use proper authentication checks
- Validate all user inputs
- Use HTTPS in production
- Keep dependencies updated

### Performance
- Optimize images with Next.js Image component
- Use React.memo for expensive components
- Implement proper loading states
- Use database indexes appropriately
- Monitor bundle size