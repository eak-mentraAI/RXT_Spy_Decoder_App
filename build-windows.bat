@echo off
REM Windows batch script for building Docker images on Windows Server

echo Building Docker images for Windows Server deployment...

REM Build backend image for AMD64 architecture
echo Building backend image...
docker build -t spy-decoder-backend:latest ./backend

REM Build frontend image for AMD64 architecture  
echo Building frontend image...
docker build -t spy-decoder-frontend:latest .

echo Build complete!
echo.
echo To run the application, use:
echo   docker-compose -f docker-compose.windows.yml up -d
echo.
echo To stop the application, use:
echo   docker-compose -f docker-compose.windows.yml down