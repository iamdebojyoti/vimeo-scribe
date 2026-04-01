package io.content.presentation.dto

data class VideoSummaryRequest(
    val videoId: String,
    val summarizePrompt: String? = null,
)
