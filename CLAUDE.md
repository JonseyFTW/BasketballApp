# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an enterprise-grade basketball coaching web application built with Next.js, TypeScript, PostgreSQL, and Prisma. The app enables coaches to design plays, organize game plans, and share strategies with their teams through a drag-and-drop play designer, intelligent play tagging system, and comprehensive game plan builder.

## Tech Stack

- **Frontend**: Next.js 13+ with React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Canvas**: react-konva (Konva.js) for interactive play designer
- **Authentication**: NextAuth.js with email/password and OAuth
- **Testing**: Jest, React Testing Library, Cypress/Playwright
- **Deployment**: Railway with GitHub Actions CI/CD

## Common Commands

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
npm run type-check         # Run TypeScript checks

# Database
npx prisma generate        # Generate Prisma client
npx prisma db push         # Push schema changes to DB
npx prisma migrate dev     # Create and apply migration
npx prisma studio          # Open Prisma Studio
npx prisma db seed         # Seed database with sample data

# Testing
npm test                   # Run Jest unit tests
npm run test:watch         # Run tests in watch mode
npm run test:e2e           # Run Cypress E2E tests
npm run test:coverage      # Generate test coverage report
```

## Architecture

### Modular Domain Structure
The application follows Domain-Driven Design with modules organized by feature:

```
/modules/
  /plays/           # Play design & management
  /gamePlans/       # Game plan builder
  /users/           # User management & auth
  /common/          # Shared utilities
```

### Layered Architecture
Each module follows a layered approach:
- **Controllers**: Next.js API route handlers (`/pages/api/` or `/app/api/`)
- **Services**: Business logic classes (e.g., `PlayService`, `GamePlanService`)
- **Repositories**: Data access layer using Prisma client
- **Models**: TypeScript interfaces and Prisma schema definitions

### Key Data Models
- **Play**: Core play entity with diagramJSON (JSONB) for canvas data
- **PlayTag**: Tags like "Primary", "Counter", "BLOB", "Zone"
- **PlayRelation**: Links between plays (counter, continuation, etc.)
- **GamePlan**: Collections of plays for specific opponents/situations
- **PlayerProfile**: Player attributes for adaptive play logic
- **User**: Coaches and players with role-based access

## Key Features Implementation

### 1. Play Designer (react-konva)
- Interactive canvas with draggable players and drawable paths
- State managed via React Context or Zustand
- Canvas exports to base64 for PDF generation
- Diagram data serialized as JSON in PostgreSQL JSONB field

### 2. Play Intelligence
- Multi-tag system for categorization and situational filtering
- Relationship system linking plays as counters/continuations
- Query patterns: `getCountersForPlay()`, `getPlaysByTags()`

### 3. Adaptive Logic
- Player attribute system (speed, size, shooting, etc.)
- Auto-adjustment of play spacing based on player characteristics
- Implemented in `PlayService.adjustDiagramForPlayers()`

### 4. Game Plan Builder
- Visual flowchart using React Flow library
- Plays organized by situation (vs Zone, BLOB, endgame, etc.)
- Export capabilities for comprehensive game planning

## Development Guidelines

### Database Patterns
- Use Prisma's type-safe query API throughout
- Leverage JSONB for flexible play diagram storage
- Implement proper foreign key relationships and cascading deletes
- Use database migrations for schema changes

### State Management
- React Context for play designer canvas state
- Server state via React Query/SWR for API data
- Keep business logic in service layer, not components

### Testing Strategy
- Unit tests for service layer business logic
- Integration tests for API routes with test database
- Component tests for UI interactions
- E2E tests for complete user workflows (play creation, sharing, etc.)

### Security Considerations
- NextAuth handles authentication with secure session management
- Share tokens for public play links (random UUID, expirable)
- Role-based access control (coaches vs players)
- Input validation on all API endpoints

### Canvas Development
- Use Konva's `stage.toDataURL()` for exports
- Implement snapping logic for drawing tools
- Store coordinates relative to canvas dimensions
- Handle responsive canvas sizing

### Performance Optimization
- Implement database indexing on frequently queried fields (tags, relations)
- Use Next.js Image optimization for assets
- Consider React.memo for expensive canvas re-renders
- Implement proper loading states for async operations

## File Structure Conventions

- API routes in `/pages/api/` or `/app/api/` (depending on Next.js version)
- Reusable components in `/components/`
- Domain modules in `/modules/[domain]/`
- Shared utilities in `/modules/common/`
- Database schema in `/prisma/schema.prisma`
- Tests co-located with source files or in `__tests__/` directories

## Environment Setup

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: NextAuth encryption key
- `NEXTAUTH_URL`: Application URL for callbacks

## Deployment Notes

- Railway deployment supports automatic builds from GitHub
- Database migrations run automatically on deploy
- Environment secrets configured in Railway dashboard
- Preview deployments available for pull requests