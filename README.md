# Vimeo Scribe

A **Kotlin/Ktor** microservice that generates AI-powered summaries from Vimeo video transcripts. Leverages Google Gemini to transform video content into concise, readable summaries.

## Overview

Vimeo Scribe extracts transcripts from Vimeo videos and uses Google's Gemini AI to generate intelligent summaries. It supports both single video and batch processing workflows via a RESTful API.

### Key Features

- **Single Video Summarization** — Generate summaries from individual Vimeo URLs or video IDs
- **Batch Processing** — Process multiple videos in a single request with aggregated summaries
- **Custom Prompts** — Provide custom summarization instructions for tailored outputs
- **RESTful API** — Clean HTTP endpoints with JSON request/response format
- **Docker Support** — Containerized deployment with Gradle tasks

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   REST API      │────▶│  Use Case Layer  │────▶│  Gemini AI      │
│   (Ktor)        │     │                  │     │  (Summary)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Vimeo API       │
                        │  (Transcripts)   │
                        └──────────────────┘
```

**Tech Stack:**
- **Runtime:** Kotlin 2.x on JVM 21
- **Framework:** Ktor (Netty engine)
- **AI:** Google Gemini API
- **DI:** Koin
- **Serialization:** kotlinx.serialization + Jackson
- **Testing:** JUnit 5 + MockK

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/summarize` | Summarize a single video |
| `POST` | `/v1/summarize/multiple` | Summarize multiple videos |

### Request/Response

#### Single Video Summary

**Request:**
```json
POST /v1/summarize
Content-Type: application/json

{
  "videoId": "https://vimeo.com/123456789",
  "summarizePrompt": "Summarize the key points in 3 bullet points"
}
```

**Response:**
```json
{
  "summary": "• First key point\n• Second key point\n• Third key point"
}
```

#### Multiple Videos Summary

**Request:**
```json
POST /v1/summarize/multiple
Content-Type: application/json

{
  "videoIds": [
    "https://vimeo.com/123456789",
    "https://vimeo.com/987654321"
  ],
  "summarizePrompt": "Compare and contrast the main themes"
}
```

**Response:**
```json
{
  "summary": "Both videos discuss..."
}
```

## Configuration

Create environment variables for external service credentials:

```bash
export GEMINI_API_KEY="your-gemini-api-key"
export VIMEO_USERNAME="your-vimeo-username"
export VIMEO_PASSWORD="your-vimeo-password"
```

Or configure directly in `src/main/resources/application.yaml`:

```yaml
gemini:
    api-key: ${GEMINI_API_KEY}
vimeo:
    username: ${VIMEO_USERNAME}
    password: ${VIMEO_PASSWORD}
```

## Building & Running

### Prerequisites
- JDK 21+
- Gradle 8.x (or use wrapper)

### Tasks

| Task | Command | Description |
|------|---------|-------------|
| Run tests | `./gradlew test` | Execute test suite |
| Build | `./gradlew build` | Compile and package |
| Fat JAR | `./gradlew buildFatJar` | Build standalone executable |
| Docker image | `./gradlew buildImage` | Create container image |
| Run local | `./gradlew run` | Start development server |
| Run Docker | `./gradlew runDocker` | Run containerized version |

### Quick Start

```bash
# 1. Set environment variables
export GEMINI_API_KEY="..."
export VIMEO_USERNAME="..."
export VIMEO_PASSWORD="..."

# 2. Run the server
./gradlew run

# 3. Test the API
curl -X POST http://localhost:8080/v1/summarize \
  -H "Content-Type: application/json" \
  -d '{"videoId": "https://vimeo.com/123456789"}'
```

On successful startup:
```
2024-12-04 14:32:45.584 [main] INFO  Application - Application started in 0.303 seconds.
2024-12-04 14:32:45.682 [main] INFO  Application - Responding at http://0.0.0.0:8080
```

## Project Structure

```
src/
├── main/kotlin/io/content/
│   ├── Application.kt          # Ktor app entry point
│   ├── Dependency.kt           # Koin DI configuration
│   ├── Routing.kt              # Route registration
│   ├── Serialization.kt        # JSON serialization setup
│   ├── Monitoring.kt           # Logging & monitoring
│   ├── domain/                 # Business logic & ports
│   │   ├── usecase/            # Use case implementations
│   │   └── port/               # Interface definitions
│   ├── infra/                  # Infrastructure layer
│   │   ├── adapter/            # External service adapters (Gemini, Vimeo)
│   │   ├── config/             # Configuration classes
│   │   ├── extractor/          # Vimeo ID extraction
│   │   ├── http/               # HTTP clients
│   │   └── model/              # Data models
│   └── presentation/           # API layer
│       ├── dto/                # Request/response DTOs
│       └── route/              # Route handlers
└── test/kotlin/                # Test suites
```

## Development

### Running Tests

```bash
./gradlew test
```

Tests use JUnit 5 with MockK for mocking. Output includes passed/skipped/failed events with full exception traces.

### Docker Deployment

Build and run with Docker:

```bash
# Build image
./gradlew buildImage

# Run locally
./gradlew runDocker

# Or publish to local registry
./gradlew publishImageToLocalRegistry
```

## License

MIT License — see LICENSE file for details.
