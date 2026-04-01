# Docker Scripts for Vimeo Scribe

This directory contains shell scripts to help you build and manage the Vimeo Scribe application.

## Available Scripts

### 🚀 `start.sh` (Main Script)
Comprehensive script with many options for building and starting the application.

**Usage:**
```bash
./scripts/start.sh [OPTIONS]
```

**Options:**
- `--skip-build` - Skip building modules (use existing builds)
- `--skip-docker` - Skip Docker Compose startup (only build modules)
- `--rebuild` - Force rebuild Docker images (no cache)
- `--no-cleanup` - Don't cleanup Docker on script exit
- `-d, --detached` - Run Docker Compose in detached mode (background)
- `-h, --help` - Show help message

**Examples:**
```bash
# Full build and start (interactive)
./scripts/start.sh

# Build and start in background
./scripts/start.sh -d

# Skip build, just start existing containers
./scripts/start.sh --skip-build

# Force rebuild everything
./scripts/start.sh --rebuild

# Build modules only, no Docker
./scripts/start.sh --skip-docker
```

### ⚡ `quick-start.sh`
Simple script for quick development starts.

**Usage:**
```bash
./scripts/quick-start.sh
```

Builds and starts services in interactive mode. Press Ctrl+C to stop.

### 🛑 `stop.sh`
Stops all Docker Compose services.

**Usage:**
```bash
./scripts/stop.sh
```

### 🔄 `restart.sh`
Stops and restarts all services with fresh builds.

**Usage:**
```bash
./scripts/restart.sh
```

## Making Scripts Executable

Before running the scripts for the first time, make them executable:

```bash
chmod +x scripts/*.sh
```

## Service URLs

Once started, the services will be available at:
- **API**: http://localhost:8080
- **Web**: http://localhost:3000

## Development Workflow

### First Time Setup
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Full build and start
./scripts/start.sh
```

### Daily Development
```bash
# Quick restart with latest changes
./scripts/restart.sh

# Or just rebuild and start
./scripts/quick-start.sh
```

### Production-like Testing
```bash
# Build and run in background
./scripts/start.sh -d

# Check logs
docker-compose logs -f

# Stop when done
./scripts/stop.sh
```

## Troubleshooting

### Docker Issues
```bash
# Check Docker status
docker info

# Check running containers
docker-compose ps

# View logs
docker-compose logs api
docker-compose logs web
```

### Build Issues
```bash
# Clean build everything
./scripts/start.sh --rebuild

# Or manually clean
docker-compose down --volumes --remove-orphans
docker system prune -f
```

### Port Conflicts
If ports 8080 or 3000 are already in use, you can either:
1. Stop the conflicting services
2. Modify the ports in `docker-compose.yml`
