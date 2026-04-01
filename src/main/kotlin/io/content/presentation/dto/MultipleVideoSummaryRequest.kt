package io.content.presentation.dto

data class MultipleVideoSummaryRequest(
    val videoIds: List<String>,
    val summarizePrompt: String? = null
)