# Windows Server Deployment Guide

## Prerequisites
- Windows Server 2019 or later
- Docker Desktop for Windows or Docker Engine
- Git (for cloning the repository)
- At least 4GB RAM available
- Port 80 and 3002 available

## Deployment Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd spy-decoder
```

### 2. Build Docker Images

#### Option A: Using Pre-built Images (Recommended)
Use the Windows-specific docker-compose file which references pre-built images:
```bash
docker-compose -f docker-compose.windows.yml up -d
```

#### Option B: Build Locally
If you need to build the images locally on Windows:
```bash
# Run the Windows build script
build-windows.bat

# Or manually build each image
docker build -t spy-decoder-backend:latest ./backend
docker build -t spy-decoder-frontend:latest .
```

### 3. Run the Application
```bash
# Start the application
docker-compose -f docker-compose.windows.yml up -d

# Verify containers are running
docker ps

# Check application health
curl http://localhost/
curl http://localhost:3002/api/health
```

### 4. Data Persistence
The SQLite database is stored in a Docker volume mounted at `./data/spy_decoder.db`. This ensures data persists across container restarts.

### 5. Accessing the Application
- Frontend: http://localhost/ or http://[server-ip]/
- Backend API: http://localhost:3002/api/ or http://[server-ip]:3002/api/
- Admin Panel: Triple-click or long-press the "Operation Trick-or-Quest" header

### 6. Admin Credentials
- Email: edward.kerr@rackspace.com
- Password: SPY2025Admin!

## Troubleshooting

### Port Conflicts
If ports 80 or 3002 are in use:
1. Stop conflicting services (IIS, other web servers)
2. Or modify ports in docker-compose.windows.yml

### Build Issues
If you encounter architecture-related errors:
- The application is built for linux/amd64 (x86_64) architecture
- Ensure Docker Desktop is set to use Linux containers, not Windows containers
- If building locally, ensure buildx is configured for the correct platform

### Database Access
If database errors occur:
1. Check the data directory exists: `mkdir data` (if not present)
2. Ensure proper permissions on the data folder
3. Check logs: `docker logs spy-decoder-backend`

## Stopping the Application
```bash
# Stop containers
docker-compose -f docker-compose.windows.yml down

# Stop and remove volumes (WARNING: Deletes database)
docker-compose -f docker-compose.windows.yml down -v
```

## Monitoring
```bash
# View logs
docker logs spy-decoder-frontend
docker logs spy-decoder-backend

# Follow logs in real-time
docker logs -f spy-decoder-backend
```

## Architecture Note
This application was originally developed on Apple Silicon (ARM64) but has been configured for cross-platform compatibility. The Windows deployment uses AMD64 (x86_64) architecture images which are fully compatible with Windows Server.