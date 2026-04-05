package io.content.domain.usecase

import io.content.domain.port.SummaryPort
import io.content.domain.port.TranscriptPort
import io.content.infra.extractor.VimeoIdExtractor
import io.content.presentation.dto.AIDetails
import io.content.presentation.dto.AIProvider
import io.content.presentation.dto.AIProvider.GEMINI

class SummarizeVideoUseCase(
    private val transcriptPort: TranscriptPort,
    private val summaryPorts: List<SummaryPort>,
) {
    suspend fun execute(
        videoIds: List<String>,
        prompt: String?,
        aiDetails: AIDetails?,
    ): String? {
        return videoIds.map {
            val vimeoId = VimeoIdExtractor.extractId(it)
            transcriptPort.fetchTranscript(vimeoId)
        }.map {
            extractTranscriptText(it)
        }.reduce { acc, elem ->
            acc.plus(" $SEPARATOR $elem")
        }.let { transcript ->
            getSummaryPort(aiDetails?.provider).generateSummary(
                (prompt ?: DEFAULT_SUMMARY_PROMPT)
                    .plus(ADDITIONAL_PROMPT_STATEMENT_FOR_SEPERATOR)
                    .plus(FORMATTING_GUIDE),
                transcript,
                aiDetails,
            )
        }
    }

    private fun extractTranscriptText(transcript: String): String {
        val lines = transcript.lineSequence()
        val result = StringBuilder()

        for (line in lines) {
            val trimmedLine = line.trim()
            when {
                trimmedLine.isBlank() || trimmedLine == "WEBVTT" || trimmedLine == "Transcript" -> continue
                trimmedLine.all { it.isDigit() } -> continue
                Regex(TIMESTAMP_REGEX_PATTERN).matches(trimmedLine) -> continue
                else -> result.append(trimmedLine).append(" ")
            }
        }

        return result.toString().trim()
    }

    private fun getSummaryPort(provider: AIProvider?): SummaryPort =
        summaryPorts.firstOrNull { it.providerName() == provider } ?: getDefaultSummaryPort()

    private fun getDefaultSummaryPort(): SummaryPort = summaryPorts.first { it.providerName() == GEMINI }

    companion object {
        private const val DEFAULT_SUMMARY_PROMPT = "Summarize this video transcript"
        private const val SEPARATOR = "||||"
        private const val ADDITIONAL_PROMPT_STATEMENT_FOR_SEPERATOR =
            ".Consider |||| as a separator between two transcripts. "
        private const val FORMATTING_GUIDE = "Use markdown formatting"
        private const val TIMESTAMP_REGEX_PATTERN = """\d{2}:\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}\.\d{3}"""
    }
}
