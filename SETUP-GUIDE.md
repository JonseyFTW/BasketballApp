# 🏀 Basketball Coach App - Complete Setup Guide

This guide will help you set up and run the Basketball Coach App locally on Windows with Docker Desktop, then deploy it to Railway.

## 📋 Prerequisites

### Required Software
1. **Docker Desktop for Windows** 
   - Download: https://www.docker.com/products/docker-desktop
   - Ensure WSL2 backend is enabled
   - Allocate at least 8GB RAM to Docker

2. **Node.js 18+**
   - Download: https://nodejs.org/
   - Choose LTS version

3. **Git**
   - Download: https://git-scm.com/

### Recommended Software
- **Visual Studio Code** with extensions:
  - TypeScript and JavaScript Language Features
  - Prisma
  - Tailwind CSS IntelliSense
  - Docker

## 🚀 Quick Start (Windows)

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd basketball-coach-app
```

### Step 2: Automated Setup
Open PowerShell as Administrator and run:
```powershell
.\scripts\dev-setup.ps1
```

This script will:
- ✅ Check Docker installation
- ✅ Create `.env` file from template
- ✅ Start PostgreSQL and Redis containers
- ✅ Install Node.js dependencies
- ✅ Generate Prisma client
- ✅ Set up database schema
- ✅ Seed database with sample data

### Step 3: Start Development
```bash
npm run dev
```

Visit http://localhost:3000 and login with:
- **Email**: coach@demo.com
- **Password**: password123

## 🐳 Docker Development Options

### Option 1: Local Development + Docker Database (Recommended)
```bash
# Start only database services
docker-compose up -d postgres redis

# Run app locally for hot reloading
npm run dev
```

### Option 2: Full Docker Development
```bash
# Start everything in Docker
docker-compose --profile dev up
```

### Option 3: Production-like Testing
```bash
# Build and run production containers
docker-compose up --build
```

## ⚙️ Manual Setup (Alternative)

If the automated script doesn't work, follow these manual steps:

### 1. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/basketball_coach_app?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters-long"
```

### 2. Start Database Services
```bash
docker-compose up -d postgres redis
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

## 🧪 Testing the Application

### Run Tests
```bash
# Unit tests
npm test

# Tests with coverage
npm run test:coverage

# E2E tests (requires Cypress)
npm run test:e2e
```

### Verify Features
1. **Authentication**: Try logging in/out
2. **Play Designer**: Create a new play with the canvas
3. **Play Library**: Browse existing plays
4. **Game Plans**: View game plan management
5. **Export**: Try exporting a play as PDF

## 🔧 Common Issues & Solutions

### Docker Issues

**Docker Desktop won't start:**
```bash
# Restart Docker Desktop as Administrator
# Enable WSL2 in Windows Features
# Restart your computer
```

**Port 3000 already in use:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

**Database connection failed:**
```bash
# Check if containers are running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Application Issues

**Prisma client not found:**
```bash
npx prisma generate
```

**Build errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Authentication not working:**
- Verify NEXTAUTH_SECRET is at least 32 characters
- Check NEXTAUTH_URL matches your domain
- Ensure database is accessible

## 🌐 Deployment to Railway

### Step 1: Prepare for Deployment
1. **Create Railway Account**: https://railway.app/
2. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

3. **Login to Railway**:
   ```bash
   railway login
   ```

### Step 2: Create Railway Project
```bash
# Initialize Railway project
railway init

# Link to existing project (if you have one)
railway link
```

### Step 3: Environment Variables
Set these variables in Railway dashboard:
```env
DATABASE_URL=<railway-will-provide-this>
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=<generate-a-secure-32+-character-secret>
NODE_ENV=production
```

### Step 4: Deploy
```bash
# Deploy to Railway
railway up

# Or use GitHub integration for automatic deployments
```

### Step 5: Database Setup on Railway
```bash
# Run migrations on Railway
railway run npx prisma db push

# Seed production database (optional)
railway run npm run db:seed
```

## 📊 Production Checklist

Before deploying to production:

- [ ] Update NEXTAUTH_SECRET with secure value
- [ ] Set correct NEXTAUTH_URL for your domain
- [ ] Configure OAuth providers (Google, GitHub) with production URLs
- [ ] Set up SSL certificate
- [ ] Configure domain name
- [ ] Set up monitoring and logging
- [ ] Test all features in production environment
- [ ] Set up backup strategy for database

## 🛠 Development Workflow

### Daily Development
1. **Start development environment**:
   ```bash
   docker-compose up -d postgres redis
   npm run dev
   ```

2. **Make changes**: Edit files and they'll auto-reload

3. **Test changes**:
   ```bash
   npm test
   npm run type-check
   ```

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push
   ```

### Database Changes
1. **Edit schema**: `prisma/schema.prisma`
2. **Apply changes**: `npx prisma db push`
3. **Generate client**: `npx prisma generate`
4. **Update seed**: `prisma/seed.ts` (if needed)

### Adding New Features
1. **Create types**: Define TypeScript interfaces
2. **Update database**: Add models to Prisma schema
3. **Create service**: Business logic in `modules/`
4. **Add API routes**: HTTP endpoints in `app/api/`
5. **Build UI**: React components in `components/`
6. **Write tests**: Unit and integration tests
7. **Update documentation**: README and comments

## 📚 Additional Resources

- **Project Documentation**: [README.md](./README.md)
- **Development Guide**: [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Architecture Guide**: [CLAUDE.md](./CLAUDE.md)
- **Enhancement Ideas**: [enhancements.md](./enhancements.md)

## 🆘 Getting Help

If you encounter issues:

1. **Check this guide** for common solutions
2. **Review logs**: `docker-compose logs` or `npm run dev` output
3. **Check GitHub Issues**: Search for similar problems
4. **Technology documentation**:
   - [Next.js Docs](https://nextjs.org/docs)
   - [Prisma Docs](https://www.prisma.io/docs)
   - [Docker Docs](https://docs.docker.com/)

## 🎉 Success!

If everything is working correctly, you should see:
- ✅ App running at http://localhost:3000
- ✅ Database accessible through Prisma Studio
- ✅ Authentication working with demo account
- ✅ Play designer canvas functional
- ✅ All tests passing

You're now ready to develop and enhance the Basketball Coach App! 🏀