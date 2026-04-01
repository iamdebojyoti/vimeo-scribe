package io.content.infra.adapter

import io.content.domain.port.SummaryPort
import io.content.infra.http.GeminiClient

class GeminiSummaryAdapter : SummaryPort {
    override suspend fun generateSummary(
        prompt: String,
        transcript: String,
    ): String? =
        GeminiClient.get().models.generateContent(
            "gemini-3-flash-preview",
            "$prompt with data $transcript",
            null,
        ).text()
}
