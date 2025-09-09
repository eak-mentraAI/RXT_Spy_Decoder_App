#!/bin/bash

# Multi-platform Docker build script for Spy Decoder
# Builds images for both ARM64 (Apple Silicon) and AMD64 (Windows/Intel)

echo "Building multi-platform Docker images for Spy Decoder..."

# Check if buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo "Docker buildx not found. Installing..."
    docker buildx create --name multiplatform-builder --use
    docker buildx inspect --bootstrap
fi

# Use the multiplatform builder
docker buildx use multiplatform-builder 2>/dev/null || docker buildx create --name multiplatform-builder --use

# Build backend image for multiple platforms
echo "Building backend image for linux/amd64 and linux/arm64..."
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t spy-decoder-backend:latest \
    --push=false \
    --load \
    ./backend

# Build frontend image for multiple platforms
echo "Building frontend image for linux/amd64 and linux/arm64..."
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t spy-decoder-frontend:latest \
    --push=false \
    --load \
    .

echo "Multi-platform build complete!"
echo "Images built for both ARM64 (Apple Silicon) and AMD64 (Windows/Intel)"