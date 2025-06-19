# Basketball Coach App

A comprehensive, enterprise-grade web application for basketball coaches to design plays, organize game plans, and manage their teams. Built with modern technologies and following clean architecture principles.

## 🏀 Features

### Core Functionality
- **Interactive Play Designer**: Drag-and-drop basketball court interface with react-konva
- **Play Management**: Create, edit, organize, and share basketball plays
- **Game Plan Builder**: Build comprehensive game plans with visual flowcharts
- **Play Intelligence**: Tag-based organization with play relationships and counters
- **Player Management**: Manage player profiles with attributes for adaptive play logic
- **Team Collaboration**: Multi-user support with role-based access control
- **Export & Sharing**: Generate shareable links and export plays as images/PDFs

### Advanced Features
- **Adaptive Play Logic**: Automatically adjust plays based on player attributes
- **Situational Filtering**: Filter plays by game situations (BLOB, SLOB, endgame, etc.)
- **Play Relationships**: Link plays as counters, continuations, or alternatives
- **Visual Flowcharts**: Create strategic sequences with React Flow
- **Real-time Collaboration**: Multiple coaches can work together
- **Comprehensive Analytics**: Track play usage and effectiveness

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Konva** - 2D canvas library for play designer
- **React Flow** - Node-based graph library for flowcharts
- **React Hook Form** - Form management
- **Zustand** - State management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Production database
- **NextAuth.js** - Authentication (credentials + OAuth)
- **bcryptjs** - Password hashing

### Development & Deployment
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Jest** - Unit testing
- **Cypress** - End-to-end testing
- **GitHub Actions** - CI/CD pipeline
- **Railway** - Deployment platform

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd basketball-coach-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/basketball_coach_app"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"
   
   # Optional OAuth providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Seed database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Login
After seeding, you can login with:
- **Email**: `coach@demo.com`
- **Password**: `password123`

## 📁 Project Structure

```
basketball-coach-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── plays/                # Play management APIs
│   │   ├── gameplans/            # Game plan APIs
│   │   ├── users/                # User management APIs
│   │   └── share/                # Sharing APIs
│   ├── designer/                 # Play designer page
│   ├── plays/                    # Play library page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── providers.tsx             # React providers
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── layout/                   # Layout components
│   ├── play-designer/            # Play designer components
│   └── forms/                    # Form components
├── modules/                      # Domain modules (DDD)
│   ├── common/                   # Shared utilities
│   ├── plays/                    # Play management domain
│   ├── gamePlans/                # Game plan domain
│   └── users/                    # User management domain
├── lib/                          # Utility libraries
│   ├── auth.ts                   # NextAuth configuration
│   ├── db.ts                     # Database client
│   └── utils.ts                  # Common utilities
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seeding
├── types/                        # TypeScript type definitions
└── public/                       # Static assets
```

## 🧩 Architecture

### Domain-Driven Design
The application follows DDD principles with clear separation of concerns:

- **Common Module**: Shared types, utilities, and validation logic
- **Plays Module**: Play creation, management, and relationships
- **Game Plans Module**: Game plan builder and organization
- **Users Module**: Authentication, authorization, and team management

### Layered Architecture
Each domain module follows a layered approach:
- **Controllers**: API route handlers (Next.js API routes)
- **Services**: Business logic and use cases
- **Repositories**: Data access layer (Prisma)
- **Types**: TypeScript interfaces and DTOs

### Database Design
- **Users & Teams**: Multi-tenant architecture with role-based access
- **Plays**: Core entity with JSONB diagram storage for flexibility
- **Tags & Relations**: Many-to-many relationships for organization
- **Game Plans**: Collections of plays with sequences and flowcharts
- **Player Profiles**: Attribute-based system for adaptive logic

## 🎨 Play Designer

The interactive play designer is built with React Konva and provides:

- **Basketball Court**: Accurately scaled half-court with proper dimensions
- **Draggable Players**: Position players anywhere on the court
- **Action Drawing**: Draw passes, cuts, screens, and dribbles
- **Property Editing**: Modify player labels, positions, and action types
- **Export Capabilities**: Save diagrams as images or share via links

### Usage
1. Select the "Add Player" tool and click on the court to place players
2. Choose action tools (pass, cut, screen, dribble) and drag to draw movements
3. Click on elements to select and edit their properties
4. Save plays with descriptive titles and tags
5. Export as images or generate shareable links

## 🗄 Database Schema

### Key Tables
- **users**: User accounts with roles and team associations
- **teams**: Team organization and management
- **plays**: Core play data with JSONB diagram storage
- **play_tags**: Categorized tags for play organization
- **play_relations**: Relationships between plays (counters, etc.)
- **game_plans**: Game plan containers
- **game_plan_items**: Plays within game plans
- **player_profiles**: Player attributes for adaptive logic

### Sample Data
The seed script creates:
- Demo coach account
- Sample team with 5 players
- Pre-defined play tags (Primary, Counter, BLOB, etc.)
- Two sample plays with relationships
- Example game plan

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm test             # Run Jest tests
npm run test:e2e     # Run Cypress E2E tests
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create and apply migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
```

### Adding New Features
1. Create types in the appropriate module
2. Implement service layer with business logic
3. Add API routes for data access
4. Build UI components
5. Add tests for all layers
6. Update documentation

### Code Style
- Use TypeScript for all new code
- Follow the existing module structure
- Write tests for business logic
- Use Prettier for consistent formatting
- Follow semantic commit messages

## 🧪 Testing

### Test Strategy
- **Unit Tests**: Business logic in services
- **Integration Tests**: API routes with test database
- **Component Tests**: React components with React Testing Library
- **E2E Tests**: Full user workflows with Cypress

### Running Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 🚢 Deployment

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway will automatically deploy on push to main branch

### Environment Variables
Required for production:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Production URL
- `NEXTAUTH_SECRET`: Random secret for NextAuth
- Optional OAuth provider credentials

### Database Migration
```bash
# Generate and apply migrations
npx prisma migrate deploy

# Seed production data if needed
npm run db:seed
```

## 📖 API Documentation

### Authentication
All API endpoints require authentication except shared content endpoints.

### Key Endpoints
- `GET /api/plays` - List plays with filtering
- `POST /api/plays` - Create new play
- `GET /api/plays/[id]` - Get specific play
- `PUT /api/plays/[id]` - Update play
- `DELETE /api/plays/[id]` - Delete play
- `POST /api/plays/[id]/share` - Generate share token
- `POST /api/plays/[id]/adapt` - Adapt play for players
- `GET /api/gameplans` - List game plans
- `POST /api/gameplans` - Create game plan
- `GET /api/share/play/[token]` - Access shared play

### Response Format
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or modifications
- `chore:` Build process or auxiliary tool changes

## 📋 Future Enhancements

See [enhancements.md](./enhancements.md) for a comprehensive list of potential improvements including:

- Real-time collaboration
- Advanced play animation
- AI-powered analytics
- Mobile applications
- VR/AR integration
- Advanced statistics and reporting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the CLAUDE.md file for development guidance

## 🙏 Acknowledgments

- Basketball coaching community for inspiration
- Open source libraries that made this possible
- React and Next.js teams for excellent frameworks
- Prisma team for the amazing ORM

---

Built with ❤️ for basketball coaches everywhere.