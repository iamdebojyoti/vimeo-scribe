package io.content.infra.adapter

import com.google.genai.Client
import io.content.domain.port.SummaryPort
import io.content.infra.http.DefaultGeminiClient
import io.content.presentation.dto.AIDetails
import io.content.presentation.dto.AIProvider

class GeminiSummaryAdapter : SummaryPort {
    override suspend fun generateSummary(
        prompt: String,
        transcript: String,
        aiDetails: AIDetails?,
    ): String? =
        getClient(aiDetails).models.generateContent(
            MODEL_NAME,
            "$prompt with data $transcript",
            null,
        ).text()

    override fun providerName() = AIProvider.GEMINI

    private fun getClient(aiDetails: AIDetails?): Client {
        return if (aiDetails != null) {
            Client.builder().apiKey(aiDetails.apiKey).build()
        } else {
            DefaultGeminiClient.get()
        }
    }

    companion object {
        private const val MODEL_NAME = "gemini-3-flash-preview"
    }
}
