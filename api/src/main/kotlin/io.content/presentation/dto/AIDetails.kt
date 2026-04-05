package io.content.presentation.dto

data class AIDetails(
    val provider: AIProvider,
    val apiKey: String,
    val additionalData: Map<String, String>? = null,
)

enum class AIProvider {
    GEMINI,
}
