# Spy Decoder App - Docker Deployment

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Clone the repository
git clone https://github.com/eak-mentraAI/RXT_Spy_Decoder_App.git
cd RXT_Spy_Decoder_App

# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f
```

The application will be available at:
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:3002

### 2. Stop the Application

```bash
docker-compose down
```

### 3. Clean Everything (including database)

```bash
docker-compose down -v
rm -rf data/
```

## Architecture

### Two-Tier Container Setup:

1. **Frontend Container (Nginx)**
   - Serves static HTML/CSS/JS files
   - Handles client requests
   - Automatically configured to connect to backend

2. **Backend Container (Node.js + SQLite)**
   - Express API server
   - SQLite database (persisted in volume)
   - Handles authentication and data storage

## Data Persistence

- Database is stored in `./data/` directory
- This directory is mounted as a volume
- Data persists between container restarts
- To reset database, delete the `data/` folder

## Admin Access

1. Triple-click the header (or long-press on mobile)
2. Login with:
   - Email: `edward.kerr@rackspace.com`
   - Password: `rxtproduct25`

## Environment Variables

Copy `.env.example` to `.env` to customize:

```bash
cp .env.example .env
```

## Production Deployment

For production, update in `docker-compose.yml`:

1. Change ports if needed
2. Add SSL/TLS termination (use reverse proxy like Traefik)
3. Set proper environment variables
4. Use Docker secrets for sensitive data

## Monitoring

Health checks are configured for both containers:
- Frontend: http://localhost/
- Backend: http://localhost:3002/api/health

## Troubleshooting

### Check container status:
```bash
docker-compose ps
```

### View logs:
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Rebuild after changes:
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Access container shell:
```bash
docker exec -it spy-decoder-backend sh
docker exec -it spy-decoder-frontend sh
```

## Security Notes

- Admin credentials should be changed for production
- Use HTTPS in production
- Consider adding rate limiting
- Implement proper CORS policies for production
- Use Docker secrets for sensitive data