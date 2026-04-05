package io.content.domain.port

import io.content.presentation.dto.AIDetails
import io.content.presentation.dto.AIProvider

interface SummaryPort {
    suspend fun generateSummary(
        prompt: String,
        transcript: String,
        aiDetails: AIDetails?,
    ): String?

    fun providerName(): AIProvider
}
