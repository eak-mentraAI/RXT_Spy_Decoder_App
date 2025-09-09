# Backend Dockerfile - Multi-platform support
FROM --platform=$TARGETPLATFORM node:18-alpine

# Install build dependencies and SQLite
RUN apk add --no-cache python3 make g++ sqlite

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies and rebuild sqlite3
RUN npm install --production && \
    npm rebuild sqlite3

# Copy app source
COPY . .

# Create directory for SQLite database
RUN mkdir -p /data

# Expose port
EXPOSE 3002

# Start the application
CMD ["node", "server.js"]