package io.content.domain.usecase

import io.content.domain.port.SummaryPort
import io.content.domain.port.TranscriptPort
import io.content.infra.extractor.VimeoIdExtractor
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.unmockkObject
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.io.File

class SummarizeVideoUseCaseTest {
    private lateinit var transcriptPort: TranscriptPort
    private lateinit var summaryPort: SummaryPort
    private lateinit var summarizeVideoUseCase: SummarizeVideoUseCase

    companion object {
        private const val RESOURCES_PATH = "src/test/resources"

        private fun loadTranscript(filename: String): String {
            return File("$RESOURCES_PATH/$filename").readText()
        }
    }

    @BeforeEach
    fun setUp() {
        transcriptPort = mockk()
        summaryPort = mockk()
        summarizeVideoUseCase = SummarizeVideoUseCase(transcriptPort, summaryPort)
        mockkObject(VimeoIdExtractor)
    }

    @AfterEach
    fun tearDown() {
        unmockkObject(VimeoIdExtractor)
    }

    @Test
    fun `execute should return summary when transcript and summary generation succeed`() =
        runTest {
            // Given
            val videoId = "123456"
            val prompt = "Custom prompt"
            val transcript = loadTranscript("transcripts/transcript-two-segments.txt")
            val expectedSummary = "This is a summary"

            coEvery { transcriptPort.fetchTranscript(videoId) } returns transcript
            coEvery { summaryPort.generateSummary(prompt, transcript) } returns expectedSummary

            // When
            val result = summarizeVideoUseCase.execute(videoId, prompt)

            // Then
            assert(result == expectedSummary)
            coVerify { transcriptPort.fetchTranscript(videoId) }
            coVerify { summaryPort.generateSummary(prompt, transcript) }
        }

    @Test
    fun `execute should use default prompt when prompt is null`() =
        runTest {
            // Given
            val videoId = "123456"
            val transcript = loadTranscript("transcripts/transcript-simple.txt")
            val expectedSummary = "Default summary"

            coEvery { transcriptPort.fetchTranscript(videoId) } returns transcript
            coEvery { summaryPort.generateSummary("Summarize this video transcript", transcript) } returns expectedSummary

            // When
            val result = summarizeVideoUseCase.execute(videoId, null)

            // Then
            assert(result == expectedSummary)
            coVerify { transcriptPort.fetchTranscript(videoId) }
            coVerify { summaryPort.generateSummary("Summarize this video transcript", transcript) }
        }

    @Test
    fun `execute should extract text from transcript correctly`() =
        runTest {
            // Given
            val videoId = "123456"
            val transcript = loadTranscript("transcripts/transcript-complex.txt")
            val expectedSummary = "Processed transcript"

            coEvery { transcriptPort.fetchTranscript(videoId) } returns transcript
            coEvery { summaryPort.generateSummary(any(), transcript) } returns expectedSummary

            // When
            val result = summarizeVideoUseCase.execute(videoId, "test prompt")

            // Then
            assert(result == expectedSummary)
            coVerify { transcriptPort.fetchTranscript(videoId) }
            coVerify { summaryPort.generateSummary(any(), transcript) }
        }

    @Test
    fun `execute should return null when summary generation returns null`() =
        runTest {
            // Given
            val videoId = "123456"
            val transcript = loadTranscript("transcripts/transcript-simple.txt")

            coEvery { transcriptPort.fetchTranscript(videoId) } returns transcript
            coEvery { summaryPort.generateSummary(any(), any()) } returns null

            // When
            val result = summarizeVideoUseCase.execute(videoId, null)

            // Then
            assert(result == null)
            coVerify { transcriptPort.fetchTranscript(videoId) }
            coVerify { summaryPort.generateSummary(any(), any()) }
        }

    @Test
    fun `executeMultiple should process multiple video IDs correctly`() =
        runTest {
            // Given
            val videoIds = listOf("123456", "https://vimeo.com/789012")
            val prompt = "Custom prompt"
            val transcript1 = loadTranscript("transcripts/transcript-first-video.txt")
            val transcript2 = loadTranscript("transcripts/transcript-second-video.txt")
            val expectedSummary = "Combined summary"

            every { VimeoIdExtractor.extractId("123456") } returns "123456"
            every { VimeoIdExtractor.extractId("https://vimeo.com/789012") } returns "789012"
            coEvery { transcriptPort.fetchTranscript("123456") } returns transcript1
            coEvery { transcriptPort.fetchTranscript("789012") } returns transcript2
            coEvery {
                summaryPort.generateSummary(
                    "Custom prompt.Consider |||| as a separator between two transcripts",
                    "First video content |||| Second video content",
                )
            } returns expectedSummary

            // When
            val result = summarizeVideoUseCase.executeMultiple(videoIds, prompt)

            // Then
            assert(result == expectedSummary)
            coVerify { transcriptPort.fetchTranscript("123456") }
            coVerify { transcriptPort.fetchTranscript("789012") }
            coVerify {
                summaryPort.generateSummary(
                    "Custom prompt.Consider |||| as a separator between two transcripts",
                    "First video content |||| Second video content",
                )
            }
        }

    @Test
    fun `executeMultiple should use default prompt when prompt is null`() =
        runTest {
            // Given
            val videoIds = listOf("123456")
            val transcript = loadTranscript("transcripts/transcript-single-video.txt")
            val expectedSummary = "Single summary"

            every { VimeoIdExtractor.extractId("123456") } returns "123456"
            coEvery { transcriptPort.fetchTranscript("123456") } returns transcript
            coEvery {
                summaryPort.generateSummary(
                    "Summarize this video transcript.Consider |||| as a separator between two transcripts",
                    "Single video content",
                )
            } returns expectedSummary

            // When
            val result = summarizeVideoUseCase.executeMultiple(videoIds, null)

            // Then
            assert(result == expectedSummary)
            coVerify { transcriptPort.fetchTranscript("123456") }
            coVerify {
                summaryPort.generateSummary(
                    "Summarize this video transcript.Consider |||| as a separator between two transcripts",
                    "Single video content",
                )
            }
        }

    @Test
    fun `executeMultiple should handle three videos correctly`() =
        runTest {
            // Given
            val videoIds = listOf("123456", "789012", "345678")
            val transcript1 = loadTranscript("transcripts/transcript-content-one.txt")
            val transcript2 = loadTranscript("transcripts/transcript-content-two.txt")
            val transcript3 = loadTranscript("transcripts/transcript-content-three.txt")
            val expectedSummary = "Three video summary"

            every { VimeoIdExtractor.extractId("123456") } returns "123456"
            every { VimeoIdExtractor.extractId("789012") } returns "789012"
            every { VimeoIdExtractor.extractId("345678") } returns "345678"
            coEvery { transcriptPort.fetchTranscript("123456") } returns transcript1
            coEvery { transcriptPort.fetchTranscript("789012") } returns transcript2
            coEvery { transcriptPort.fetchTranscript("345678") } returns transcript3
            coEvery {
                summaryPort.generateSummary(
                    any(),
                    "Content one |||| Content two |||| Content three",
                )
            } returns expectedSummary

            // When
            val result = summarizeVideoUseCase.executeMultiple(videoIds, "test")

            // Then
            assert(result == expectedSummary)
            coVerify { transcriptPort.fetchTranscript("123456") }
            coVerify { transcriptPort.fetchTranscript("789012") }
            coVerify { transcriptPort.fetchTranscript("345678") }
            coVerify {
                summaryPort.generateSummary(
                    any(),
                    "Content one |||| Content two |||| Content three",
                )
            }
        }

    @Test
    fun `executeMultiple should propagate exception from VimeoIdExtractor`() =
        runTest {
            // Given
            val videoIds = listOf("invalid-url")
            val errorMessage = "Invalid Vimeo ID or URL format: invalid-url"

            every { VimeoIdExtractor.extractId("invalid-url") } throws IllegalArgumentException(errorMessage)

            // When & Then
            val exception =
                assertThrows<IllegalArgumentException> {
                    summarizeVideoUseCase.executeMultiple(videoIds, null)
                }
            assert(exception.message == errorMessage)
        }

    @Test
    fun `executeMultiple should return null when summary generation returns null`() =
        runTest {
            // Given
            val videoIds = listOf("123456")
            val transcript = loadTranscript("transcripts/transcript-content.txt")

            every { VimeoIdExtractor.extractId("123456") } returns "123456"
            coEvery { transcriptPort.fetchTranscript("123456") } returns transcript
            coEvery { summaryPort.generateSummary(any(), any()) } returns null

            // When
            val result = summarizeVideoUseCase.executeMultiple(videoIds, null)

            // Then
            assert(result == null)
            coVerify { transcriptPort.fetchTranscript("123456") }
            coVerify { summaryPort.generateSummary(any(), any()) }
        }

    @Test
    fun `extractTranscriptText should handle empty transcript`() =
        runTest {
            // Given
            val videoId = "123456"
            val transcript = loadTranscript("transcripts/transcript-empty.txt")
            val expectedSummary = "Empty summary"

            coEvery { transcriptPort.fetchTranscript(videoId) } returns transcript
            coEvery { summaryPort.generateSummary(any(), "") } returns expectedSummary

            // When
            val result = summarizeVideoUseCase.execute(videoId, null)

            // Then
            assert(result == expectedSummary)
            coVerify { transcriptPort.fetchTranscript(videoId) }
            coVerify { summaryPort.generateSummary(any(), "") }
        }
}
