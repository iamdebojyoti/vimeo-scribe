package io.content.presentation.dto

data class VideoSummaryRequest(
    val videoIds: List<String>,
    val aiDetails: AIDetails? = null,
    val summarizePrompt: String? = null,
)
