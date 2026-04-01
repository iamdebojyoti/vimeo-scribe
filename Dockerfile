# Use multi-stage build for better image size and security
FROM openjdk:21-jdk-slim AS build

# Install gradle and necessary tools
RUN apt-get update && \
    apt-get install -y wget unzip && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy gradle wrapper files first to leverage Docker layer caching
COPY gradlew gradlew.bat gradle/ gradle/

# Make gradlew executable
RUN chmod +x gradlew

# Download gradle dependencies
RUN ./gradlew --no-daemon --version

# Copy the rest of the project files
COPY . .

# Build the application
RUN ./gradlew --no-daemon clean build -x test

# Runtime stage
FROM openjdk:21-jre-slim

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Create app user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Change ownership to app user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the default Ktor port
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Set JVM options for containerized environment
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
