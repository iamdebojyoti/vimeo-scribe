#!/bin/bash

# Quick Start Script for Vimeo Scribe
# Simple script to build and start services

set -e

echo "🚀 Starting Vimeo Scribe..."

# Build and start with docker-compose
echo "📦 Building and starting services..."
docker-compose up --build

echo "✅ Services stopped"
