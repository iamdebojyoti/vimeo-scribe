package io.content.domain.usecase

import io.content.domain.port.SummaryPort
import io.content.domain.port.TranscriptPort
import io.content.infra.extractor.VimeoIdExtractor

class SummarizeVideoUseCase(
    private val transcriptPort: TranscriptPort,
    private val summaryPorts: SummaryPort,
) {
    suspend fun execute(
        videoId: String,
        prompt: String?,
    ): String? {
        return transcriptPort.fetchTranscript(videoId).also { transcript ->
            extractTranscriptText(transcript)
        }.let {
            summaryPorts.generateSummary(prompt ?: DEFAULT_SUMMARY_PROMPT, it)
        }
    }

    suspend fun executeMultiple(
        videoIds: List<String>,
        prompt: String?,
    ): String? {
        return videoIds.map {
            val vimeoId = VimeoIdExtractor.extractId(it)
            transcriptPort.fetchTranscript(vimeoId)
        }.map {
            extractTranscriptText(it)
        }.reduce {
                acc, elem ->
            acc.plus(" $SEPARATOR $elem")
        }.let { transcript ->
            summaryPorts.generateSummary(
                (prompt ?: DEFAULT_SUMMARY_PROMPT)
                    .plus(ADDITIONAL_PROMPT_STATEMENT_FOR_SEPERATOR),
                transcript,
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

    companion object {
        private const val DEFAULT_SUMMARY_PROMPT = "Summarize this video transcript"
        private const val SEPARATOR = "||||"
        private const val ADDITIONAL_PROMPT_STATEMENT_FOR_SEPERATOR = ".Consider |||| as a separator between two transcripts"
        private const val TIMESTAMP_REGEX_PATTERN = """\d{2}:\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}\.\d{3}"""
    }
}
