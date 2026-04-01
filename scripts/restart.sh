#!/bin/bash

# Restart Script for Vimeo Scribe
# Stops and restarts all services

echo "🔄 Restarting Vimeo Scribe services..."

# Stop services
docker-compose down

# Start services
docker-compose up --build -d

echo "✅ Services restarted"
echo "🌐 API: http://localhost:8080"
echo "🌐 Web: http://localhost:3000"
