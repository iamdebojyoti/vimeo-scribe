# Docker for Vimeo Scribe

This directory contains Docker configuration for containerizing the Vimeo Scribe application.

## Files

- `Dockerfile` - Multi-stage build configuration for the Kotlin/Ktor application
- `.dockerignore` - Files and directories to exclude from Docker build context
- `docker-compose.yml` - Docker Compose configuration for easy deployment

## Build and Run

### Using Docker Compose (Recommended)

```bash
# Build and run the container
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop the container
docker-compose down
```

### Using Docker directly

```bash
# Build the image
docker build -t vimeo-scribe .

# Run the container
docker run -p 8080:8080 vimeo-scribe

# Run in detached mode
docker run -d -p 8080:8080 --name vimeo-scribe vimeo-scribe
```

## Configuration

The application runs on port 8080 by default. You can:

- Change the port mapping in `docker-compose.yml` or Docker run command
- Adjust JVM options via the `JAVA_OPTS` environment variable
- Configure additional environment variables as needed

## Health Check

The container includes a health check that monitors the application at `/health` endpoint every 30 seconds.

## Development

For development with hot reload, consider mounting the source directory and using development-specific configurations.
