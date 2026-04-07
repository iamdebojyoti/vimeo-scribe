<div align="center">
  <h1>🎬 Vimeo Scribe</h1>
  <p><strong>AI-Powered Video Summarization Platform</strong></p>
  <p>Transform Vimeo videos into intelligent, concise summaries using Google Gemini AI</p>
  
  [![Kotlin](https://img.shields.io/badge/Kotlin-2.3.0-blue.svg)](https://kotlinlang.org/)
  [![Ktor](https://img.shields.io/badge/Ktor-3.4.0-green.svg)](https://ktor.io/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
  [![AI](https://img.shields.io/badge/AI-Gemini-purple.svg)](https://ai.google.dev/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

## ✨ Overview

Vimeo Scribe is a cutting-edge **microservice platform** that automatically extracts transcripts from Vimeo videos and leverages **Google's Gemini AI** to generate intelligent, context-aware summaries. Built with modern Kotlin/Ktor architecture, it provides both powerful REST APIs and a sleek web interface for seamless video content processing.

### 🚀 What Makes It Special?

- **🧠 Smart AI Summarization** - Powered by Google Gemini for human-like summaries
- **⚡ Lightning Fast** - Optimized for performance with concurrent processing
- **🎯 Precision Targeting** - Custom prompts for tailored summarization styles
- **📊 Batch Processing** - Handle multiple videos simultaneously
- **🐳 Container-Ready** - Full Docker support with one-click deployment
- **🌐 Modern Web UI** - Beautiful React-based frontend interface

### Key Features

- **Single Video Summarization** — Generate summaries from individual Vimeo URLs or video IDs
- **Batch Processing** — Process multiple videos in a single request with aggregated summaries
- **Custom Prompts** — Provide custom summarization instructions for tailored outputs
- **RESTful API** — Clean HTTP endpoints with JSON request/response format
- **Docker Support** — Containerized deployment with Gradle tasks

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Web UI        │────▶│   REST API       │────▶│  Gemini AI      │
│   (React)       │     │   (Ktor)        │     │  (Summary)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Vimeo API       │
                        │  (Transcripts)   │
                        └──────────────────┘
```

### 🛠️ Tech Stack

**Backend:**
- **Runtime:** Kotlin 2.3.0 on JVM 21
- **Framework:** Ktor 3.4.0 with Netty engine
- **AI Engine:** Google Gemini API 1.40.0
- **Dependency Injection:** Koin 4.1.0-Beta8
- **Serialization:** kotlinx.serialization + Jackson
- **Testing:** JUnit 5.10.2 + MockK 1.13.8
- **Code Quality:** ktlint 12.1.1

**Frontend:**
- **Framework:** React 19.0.0 with TypeScript 5.8.2
- **Build Tool:** Vite 6.2.0
- **Styling:** TailwindCSS 4.1.14
- **UI Components:** shadcn/ui
- **Icons:** Lucide React 0.546.0
- **HTTP Client:** Axios 1.14.0
- **Markdown:** react-markdown 10.1.0
- **Animations:** Motion 12.38.0

**Infrastructure:**
- **Containerization:** Docker + Docker Compose
- **Build System:** Gradle 8.x
- **CI/CD:** GitHub Actions

## 📚 API Reference

### 🎯 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/vimeo-scribe/v1/summarize` | Summarize single or multiple videos |
| `GET` | `/` | Health check endpoint |

### 💬 Request/Response Examples

#### Video Summary Request

**Endpoint:** `POST /vimeo-scribe/v1/summarize`

**Request:**
```json
{
  "videoIds": ["https://vimeo.com/123456789"],
  "summarizePrompt": "Summarize the key points in 3 bullet points",
  "aiDetails": {
    "provider": "GEMINI",
    "apiKey": "your-gemini-api-key",
    "additionalData": {
      "model": "gemini-pro",
      "temperature": "0.5"
    }
  }
}
```

**Minimal Request:**
```json
{
  "videoIds": ["https://vimeo.com/123456789"]
}
```

**Response (Success):**
```json
{
  "summary": "• First key point\n• Second key point\n• Third key point"
}
```

**Response (Error):**
```json
{
  "error": "Batch processing failed"
}
```

#### Multiple Videos Summary

**Request:**
```json
{
  "videoIds": [
    "https://vimeo.com/123456789",
    "https://vimeo.com/987654321"
  ],
  "summarizePrompt": "Compare and contrast the main themes",
  "aiDetails": {
    "provider": "GEMINI",
    "apiKey": "your-gemini-api-key"
  }
}
```

**Response:**
```json
{
  "summary": "Both videos discuss..."
}
```

### 📋 Request Schema

#### VideoSummaryRequest
```json
{
  "videoIds": "string[]" (required),
  "summarizePrompt": "string (optional)",
  "aiDetails": {
    "provider": "GEMINI" (required),
    "apiKey": "string" (required),
    "additionalData": "object<string, string> (optional)"
  } (optional)
}
```

#### VideoSummaryResponse
```json
{
  "summary": "string | null"
}
```

#### AIDetails
```json
{
  "provider": "GEMINI",
  "apiKey": "string",
  "additionalData": {
    "model": "gemini-pro",
    "temperature": "0.5"
  }
}
```

### 🚨 Error Handling

- **200 OK**: Request processed successfully
- **500 Internal Server Error**: Processing failed with error details in response body

**Error Response Format:**
```json
{
  "error": "Error description message"
}
```

## ⚙️ Configuration

### 🔑 Environment Variables

Create environment variables for external service credentials:

```bash
export GEMINI_API_KEY="your-gemini-api-key"
export VIMEO_USERNAME="your-vimeo-username"
export VIMEO_PASSWORD="your-vimeo-password"
```

### 📄 Configuration File

Or configure directly in `api/src/main/resources/application.yaml`:

```yaml
ktor:
    deployment:
        port: 8080
gemini:
    api-key: ${GEMINI_API_KEY}
vimeo:
    username: ${VIMEO_USERNAME}
    password: ${VIMEO_PASSWORD}
```

## 🚀 Quick Start

### 🎯 One-Command Setup with Docker

The fastest way to get started is using our Docker scripts:

```bash
# Clone and setup
git clone <repository-url>
cd vimeo-scribe

# Make scripts executable
chmod +x scripts/*.sh

# Set your API keys
export GEMINI_API_KEY="your-gemini-api-key"
export VIMEO_USERNAME="your-vimeo-username"
export VIMEO_PASSWORD="your-vimeo-password"

# Start everything (builds and runs both API and Web UI)
./scripts/start.sh
```

🎉 **Access your application:**
- **Web Interface:** http://localhost:3000
- **API Endpoint:** http://localhost:8081

### 🛠️ Manual Setup

#### Prerequisites
- JDK 21+
- Node.js 20+
- Gradle 8.x (or use wrapper)
- Docker & Docker Compose

#### Step 1: Backend Setup
```bash
# Set environment variables
export GEMINI_API_KEY="..."
export VIMEO_USERNAME="..."
export VIMEO_PASSWORD="..."

# Run the API server
./gradlew run
```

#### Step 2: Frontend Setup
```bash
cd web
npm install
npm run dev
```

#### Step 3: Test the API
```bash
curl -X POST http://localhost:8080/vimeo-scribe/v1/summarize \
  -H "Content-Type: application/json" \
  -d '{"videoIds": ["https://vimeo.com/123456789"]}'
```

### 🐳 Docker Commands

| Task | Command | Description |
|------|---------|-------------|
| Build & Run | `./scripts/start.sh` | Full build and start |
| Quick Start | `./scripts/quick-start.sh` | Fast development start |
| Background | `./scripts/start.sh -d` | Run in detached mode |
| Rebuild | `./scripts/start.sh --rebuild` | Force rebuild images |
| Skip Build | `./scripts/start.sh --skip-build` | Use existing builds |
| Stop Services | `./scripts/stop.sh` | Stop all containers |
| Restart | `./scripts/restart.sh` | Rebuild and restart |

### 📋 Gradle Tasks

| Task | Command | Description |
|------|---------|-------------|
| Run tests | `./gradlew test` | Execute test suite |
| Build | `./gradlew build` | Compile and package |
| ktlint check | `./gradlew ktlintCheck` | Check code formatting |
| ktlint format | `./gradlew ktlintFormat` | Format code |
| Run local | `./gradlew run` | Start development server |

### ✅ Success Indicators

On successful startup, you'll see:
```
2025-04-07 14:32:45.584 [main] INFO  Application - Application started in 0.303 seconds.
2025-04-07 14:32:45.682 [main] INFO  Application - Responding at http://0.0.0.0:8080
```

**Docker Compose Output:**
```
[INFO] Starting Vimeo Scribe build and deployment process...
[SUCCESS] API module built successfully
[SUCCESS] Web module built successfully
[INFO] Starting services...
vimeo-scribe-api-1  | [INFO] Application started in 0.303 seconds.
vimeo-scribe-web-1   | [INFO] Server running on port 80
```

## 📁 Project Structure

```
vimeo-scribe/
├── 📄 README.md                   # This file
├── 🐳 docker-compose.yml          # Multi-service orchestration
├── 📜 build.gradle.kts             # Root build configuration
├── 📜 settings.gradle.kts          # Gradle settings
├── 📁 api/                         # Backend Kotlin service
│   ├── 📁 src/
│   │   ├── 📁 main/kotlin/io/content/
│   │   │   ├── 📄 Application.kt          # Ktor app entry point
│   │   │   ├── 📄 Dependency.kt           # Koin DI configuration
│   │   │   ├── 📄 Routing.kt              # Route registration
│   │   │   ├── 📄 Serialization.kt        # JSON serialization setup
│   │   │   ├── 📄 Monitoring.kt           # Logging & monitoring
│   │   │   ├── 📁 domain/                 # Business logic & ports
│   │   │   │   ├── 📁 usecase/            # Use case implementations
│   │   │   │   └── 📁 port/               # Interface definitions
│   │   │   ├── 📁 infra/                  # Infrastructure layer
│   │   │   │   ├── 📁 adapter/            # External service adapters (Gemini, Vimeo)
│   │   │   │   ├── 📁 config/             # Configuration classes
│   │   │   │   ├── 📁 extractor/          # Vimeo ID extraction
│   │   │   │   ├── 📁 http/               # HTTP clients
│   │   │   │   └── 📁 model/              # Data models
│   │   │   └── 📁 presentation/           # API layer
│   │   │       ├── 📁 dto/                # Request/response DTOs
│   │   │       └── 📁 route/              # Route handlers
│   │   └── 📁 test/kotlin/                # Test suites
│   ├── 📄 Dockerfile                   # Backend container definition
│   └── 📄 build.gradle.kts             # Backend build config
├── 📁 web/                         # Frontend React app
│   ├── 📁 src/
│   │   ├── 📁 lib/                    # Utility functions
│   │   ├── 📄 App.tsx                 # Main React component
│   │   ├── 📄 main.tsx                # App entry point
│   │   └── 📄 index.css               # Global styles
│   ├── 📄 package.json               # Node.js dependencies
│   ├── 📄 vite.config.ts              # Vite configuration
│   ├── 📄 tailwind.config.js          # TailwindCSS config
│   └── 📄 Dockerfile                  # Frontend container definition
├── 📁 scripts/                     # Deployment and utility scripts
│   ├── 📄 start.sh                   # Main deployment script
│   ├── 📄 quick-start.sh             # Quick development start
│   ├── 📄 stop.sh                    # Stop all services
│   ├── 📄 restart.sh                 # Restart services
│   └── 📄 README.md                  # Script documentation
└── 📁 .github/                     # CI/CD workflows
    └── 📁 workflows/
        ├── 📄 ci.yml                    # Continuous integration
        ├── 📄 deploy_to_render.yml      # Render deployment
        └── 📄 format.yml                # Code formatting
```

## 🧪 Development

### 🔬 Testing

```bash
# Run backend tests
./gradlew test

# Run frontend tests
cd web && npm test

# Run tests with coverage
./gradlew test jacocoTestReport
```

Tests use:
- **Backend:** JUnit 5 with MockK for mocking
- **Frontend:** Vitest with React Testing Library
- **Coverage:** JaCoCo for backend, c8 for frontend

### 🐛 Debugging

#### Backend Debugging
```bash
# Run with debug enabled
./gradlew run --args="-Ddebug=true"

# View application logs
docker-compose logs -f api
```

#### Frontend Debugging
```bash
# Run with dev tools
cd web && npm run dev

# View build logs
docker-compose logs -f web
```

### 🚀 Production Deployment

### Docker Deployment
```bash
# Build production images
./scripts/start.sh --rebuild

# Run in production mode
docker-compose -f docker-compose.yml up -d

# Scale services
docker-compose up -d --scale api=3
```

### Render Cloud Deployment
The project includes automated deployment to Render via GitHub Actions:

1. **Manual Deployment**: Use the "Deploy to Render" workflow in GitHub Actions
2. **Automatic Deployment**: Triggered on push to main branch
3. **Services Deployed**:
   - API Service: Containerized Kotlin backend
   - Web Service: Static React frontend

**Required Render Secrets**:
- `RENDER_API_SERVICE_ID`: API service identifier
- `RENDER_WEB_SERVICE_ID`: Web service identifier  
- `RENDER_API_KEY`: Render API key
- `RENDER_API_URL`: Deployed API endpoint
- `RENDER_WEB_URL`: Deployed web endpoint

#### Environment Configuration
```bash
# Production environment variables
export JAVA_OPTS="-Xmx2g -Xms1g"
export GEMINI_API_KEY="prod-key"
export VIMEO_USERNAME="prod-user"
export VIMEO_PASSWORD="prod-pass"
export VITE_BACKEND_URL="https://api.your-domain.com"
```

## 🔧 Advanced Configuration

### Custom Prompts
Create custom summarization prompts for different use cases:

```json
{
  "summarizePrompt": "Create a technical summary with code examples",
  "summarizePrompt": "Extract key action items and deadlines",
  "summarizePrompt": "Summarize for a non-technical audience"
}
```

### Performance Tuning
```yaml
# application.yaml
ktor:
  deployment:
    callGroupSize: 4
    connectionGroupSize: 8
    workerGroupSize: 4
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License — see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** - For providing powerful AI capabilities
- **Vimeo API** - For reliable video transcript access
- **Ktor Community** - For excellent async web framework
- **React Team** - For amazing frontend development experience

---

<div align="center">
  <p>Made with ❤️ by the Vimeo Scribe Team</p>
  <p>Transform your video content into actionable insights</p>
</div>
