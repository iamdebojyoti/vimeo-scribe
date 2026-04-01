#!/bin/bash

# Stop Script for Vimeo Scribe
# Stops all Docker Compose services

echo "🛑 Stopping Vimeo Scribe services..."
docker-compose down
echo "✅ All services stopped"
