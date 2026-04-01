package io.content.domain.port

interface SummaryPort {
    suspend fun generateSummary(prompt: String, transcript: String): String?
}
