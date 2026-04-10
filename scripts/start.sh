#!/bin/bash

# Vimeo Scribe - Build and Start Script
# This script builds both API and Web modules, then starts the services with Docker Compose

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker is running
is_docker_running() {
    docker info >/dev/null 2>&1
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    if [ "$CLEANUP_DOCKER" = true ]; then
        docker-compose down --remove-orphans 2>/dev/null || true
    fi
}

# Set up cleanup on script exit
trap cleanup EXIT

# Default values
SKIP_BUILD=false
SKIP_DOCKER=false
REBUILD=false
CLEANUP_DOCKER=true
DETACHED=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-docker)
            SKIP_DOCKER=true
            CLEANUP_DOCKER=false
            shift
            ;;
        --rebuild)
            REBUILD=true
            shift
            ;;
        --no-cleanup)
            CLEANUP_DOCKER=false
            shift
            ;;
        -d|--detached)
            DETACHED=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-build    Skip building modules"
            echo "  --skip-docker   Skip Docker Compose startup"
            echo "  --rebuild       Force rebuild Docker images"
            echo "  --no-cleanup    Don't cleanup Docker on exit"
            echo "  -d, --detached  Run Docker Compose in detached mode"
            echo "  -h, --help      Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

print_status "Starting Vimeo Scribe build and deployment process..."

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists docker; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! command_exists docker-compose; then
    print_error "Docker Compose is not installed or not in PATH"
    exit 1
fi

if ! is_docker_running; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

if ! command_exists java; then
    print_warning "Java is not installed or not in PATH. Required for building API module."
fi

if ! command_exists node; then
    print_warning "Node.js is not installed or not in PATH. Required for building Web module."
fi

print_success "Prerequisites check completed"

# Build API module
if [ "$SKIP_BUILD" = false ]; then
    print_status "Building API module..."
    
    if [ -f "./gradlew" ]; then
        cd api
        chmod +x ../gradlew
        if ../gradlew clean build; then
            print_success "API module built successfully"
        else
            print_error "Failed to build API module"
            exit 1
        fi
        cd ..
    else
        print_error "Gradle wrapper not found in api directory"
        exit 1
    fi
else
    print_warning "Skipping API module build"
fi

# Build Web module
if [ "$SKIP_BUILD" = false ]; then
    print_status "Building Web module..."
    
    if [ -f "web/package.json" ]; then
        cd web
        if npm install && npm run build; then
            print_success "Web module built successfully"
        else
            print_error "Failed to build Web module"
            exit 1
        fi
        cd ..
    else
        print_error "package.json not found in web directory"
        exit 1
    fi
else
    print_warning "Skipping Web module build"
fi

# Docker Compose operations
if [ "$SKIP_DOCKER" = false ]; then
    print_status "Starting Docker services..."
    
    # Stop existing services if running
    if docker-compose ps | grep -q "Up"; then
        print_status "Stopping existing services..."
        docker-compose down
    fi
    
    # Build and start services
    if [ "$REBUILD" = true ]; then
        print_status "Rebuilding Docker images..."
        docker-compose build --no-cache
    fi
    
    if [ "$DETACHED" = true ]; then
        print_status "Starting services in detached mode..."
        if docker-compose up -d; then
            print_success "Services started successfully in detached mode"
            print_status "Services are running in the background"
            print_status "API: http://localhost:8080"
            print_status "Web: http://localhost:3000"
            print_status "Use 'docker-compose logs -f' to view logs"
            print_status "Use 'docker-compose down' to stop services"
        else
            print_error "Failed to start services"
            exit 1
        fi
    else
        print_status "Starting services..."
        print_status "Press Ctrl+C to stop the services"
        echo ""
        if docker-compose up; then
            print_success "Services started successfully"
        else
            print_error "Failed to start services"
            exit 1
        fi
    fi
else
    print_warning "Skipping Docker Compose startup"
fi

print_success "Vimeo Scribe deployment completed successfully!"
print_status "API service: http://localhost:8080"
print_status "Web service: http://localhost:3000"
