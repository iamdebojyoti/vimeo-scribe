package io.content.domain.port

interface TranscriptPort {
    suspend fun fetchTranscript(videoId: String): String
}
