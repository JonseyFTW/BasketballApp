# PowerShell setup script for Windows
Write-Host "🏀 Basketball Coach App Setup Script" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "   Visit: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file. Please update it with your configuration." -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists." -ForegroundColor Green
}

# Start the database
Write-Host "🚀 Starting database..." -ForegroundColor Yellow
docker-compose up -d postgres redis

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if database is responsive
$dbReady = $false
$attempts = 0
while (!$dbReady -and $attempts -lt 30) {
    try {
        docker-compose exec postgres pg_isready -U postgres | Out-Null
        $dbReady = $true
        Write-Host "✅ Database is ready!" -ForegroundColor Green
    } catch {
        Write-Host "⏳ Waiting for database..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        $attempts++
    }
}

if (!$dbReady) {
    Write-Host "❌ Database failed to start. Please check Docker logs." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Run database migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
npx prisma db push

# Seed the database
Write-Host "🌱 Seeding database with sample data..." -ForegroundColor Yellow
npm run db:seed

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update your .env file with the correct configuration" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "3. Visit http://localhost:3000 to see the app" -ForegroundColor White
Write-Host ""
Write-Host "Demo login credentials:" -ForegroundColor Cyan
Write-Host "Email: coach@demo.com" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "To run with Docker:" -ForegroundColor Cyan
Write-Host "- Development: docker-compose --profile dev up" -ForegroundColor White
Write-Host "- Production: docker-compose up" -ForegroundColor White
Write-Host ""