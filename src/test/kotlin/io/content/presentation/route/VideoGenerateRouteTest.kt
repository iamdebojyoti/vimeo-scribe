package io.content.presentation.route

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import io.content.domain.usecase.SummarizeVideoUseCase
import io.content.infra.extractor.VimeoIdExtractor
import io.content.presentation.dto.MultipleVideoSummaryRequest
import io.content.presentation.dto.VideoSummaryRequest
import io.content.presentation.dto.VideoSummaryResponse
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.jackson.jackson
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.testing.testApplication
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.koin.core.context.startKoin
import org.koin.core.context.stopKoin
import org.koin.dsl.module
import kotlin.test.assertContains
import kotlin.test.assertEquals

class VideoGenerateRouteTest {
    private val summarizeVideoUseCase: SummarizeVideoUseCase = mockk()

    @BeforeEach
    fun setUp() {
        startKoin {
            modules(
                module {
                    single { summarizeVideoUseCase }
                },
            )
        }
        mockkObject(VimeoIdExtractor)
    }

    @AfterEach
    fun tearDown() {
        stopKoin()
        unmockkAll()
    }

    private fun withVideoRouteApp(block: suspend (HttpClient) -> Unit) =
        testApplication {
            install(ContentNegotiation) {
                jackson {
                    setDefaultPropertyInclusion(JsonInclude.Include.NON_NULL)
                    enable(SerializationFeature.INDENT_OUTPUT)
                    disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                    registerModule(JavaTimeModule())
                    disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                }
            }
            routing { videoGenerateRoute() }

            val client =
                createClient {
                    install(io.ktor.client.plugins.contentnegotiation.ContentNegotiation) {
                        jackson {
                            setDefaultPropertyInclusion(JsonInclude.Include.NON_NULL)
                            enable(SerializationFeature.INDENT_OUTPUT)
                            disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                            registerModule(JavaTimeModule())
                            disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                        }
                    }
                }

            block(client)
        }

    @Test
    fun `summarize - returns 200 with summary on success`() =
        withVideoRouteApp { client ->
            val rawVideoId = "https://vimeo.com/123456789"
            val vimeoId = "123456789"
            val prompt = "Summarise in 3 bullets"
            val summary = "• Point 1\n• Point 2\n• Point 3"

            every { VimeoIdExtractor.extractId(rawVideoId) } returns vimeoId
            coEvery { summarizeVideoUseCase.execute(vimeoId, prompt) } returns summary

            val response =
                client.post("/v1/summarize") {
                    contentType(ContentType.Application.Json)
                    setBody(VideoSummaryRequest(videoId = rawVideoId, summarizePrompt = prompt))
                }

            assertEquals(HttpStatusCode.OK, response.status)
            val body = response.body<VideoSummaryResponse>()
            assertEquals(summary, body.summary)

            coVerify(exactly = 1) { VimeoIdExtractor.extractId(rawVideoId) }
            coVerify(exactly = 1) { summarizeVideoUseCase.execute(vimeoId, prompt) }
        }

    @Test
    fun `summarize - returns 200 with null summary when use case returns null`() =
        withVideoRouteApp { client ->
            val rawVideoId = "https://vimeo.com/999"
            val vimeoId = "999"

            every { VimeoIdExtractor.extractId(rawVideoId) } returns vimeoId
            coEvery { summarizeVideoUseCase.execute(vimeoId, null) } returns null

            val response =
                client.post("/v1/summarize") {
                    contentType(ContentType.Application.Json)
                    setBody(VideoSummaryRequest(videoId = rawVideoId))
                }

            assertEquals(HttpStatusCode.OK, response.status)
            val body = response.body<VideoSummaryResponse>()
            assertEquals(null, body.summary)
        }

    @Test
    fun `summarize - sends null prompt to use case when prompt is omitted`() =
        withVideoRouteApp { client ->
            val rawVideoId = "https://vimeo.com/111"
            val vimeoId = "111"

            every { VimeoIdExtractor.extractId(rawVideoId) } returns vimeoId
            coEvery { summarizeVideoUseCase.execute(vimeoId, null) } returns "Summary"

            client.post("/v1/summarize") {
                contentType(ContentType.Application.Json)
                setBody(VideoSummaryRequest(videoId = rawVideoId))
            }

            coVerify(exactly = 1) { summarizeVideoUseCase.execute(vimeoId, null) }
        }

    @Test
    fun `summarize - returns 500 when VimeoIdExtractor throws`() =
        withVideoRouteApp { client ->
            val rawVideoId = "not-a-vimeo-url"

            every { VimeoIdExtractor.extractId(rawVideoId) } throws IllegalArgumentException("Invalid Vimeo URL")

            val response =
                client.post("/v1/summarize") {
                    contentType(ContentType.Application.Json)
                    setBody(VideoSummaryRequest(videoId = rawVideoId))
                }

            assertEquals(HttpStatusCode.InternalServerError, response.status)
            assertContains(response.bodyAsText(), "Invalid Vimeo URL")
            coVerify(exactly = 0) { summarizeVideoUseCase.execute(any(), any()) }
        }

    @Test
    fun `summarize - returns 500 when use case throws`() =
        withVideoRouteApp { client ->
            val rawVideoId = "https://vimeo.com/222"
            val vimeoId = "222"

            every { VimeoIdExtractor.extractId(rawVideoId) } returns vimeoId
            coEvery { summarizeVideoUseCase.execute(vimeoId, any()) } throws RuntimeException("AI service unavailable")

            val response =
                client.post("/v1/summarize") {
                    contentType(ContentType.Application.Json)
                    setBody(VideoSummaryRequest(videoId = rawVideoId))
                }

            assertEquals(HttpStatusCode.InternalServerError, response.status)
            assertContains(response.bodyAsText(), "AI service unavailable")
        }

    @Test
    fun `summarize multiple - returns 200 with combined summary on success`() =
        withVideoRouteApp { client ->
            val videoIds = listOf("vid-A", "vid-B", "vid-C")
            val prompt = "Give an overview"
            val summary = "Combined summary of all three videos"

            coEvery { summarizeVideoUseCase.executeMultiple(videoIds, prompt) } returns summary

            val response =
                client.post("/v1/summarize/multiple") {
                    contentType(ContentType.Application.Json)
                    setBody(MultipleVideoSummaryRequest(videoIds = videoIds, summarizePrompt = prompt))
                }

            assertEquals(HttpStatusCode.OK, response.status)
            val body = response.body<VideoSummaryResponse>()
            assertEquals(summary, body.summary)

            coVerify(exactly = 1) { summarizeVideoUseCase.executeMultiple(videoIds, prompt) }
            coVerify(exactly = 0) { VimeoIdExtractor.extractId(any()) }
        }

    @Test
    fun `summarize multiple - passes null prompt when omitted`() =
        withVideoRouteApp { client ->
            val videoIds = listOf("vid-X", "vid-Y")

            coEvery { summarizeVideoUseCase.executeMultiple(videoIds, null) } returns "Summary"

            client.post("/v1/summarize/multiple") {
                contentType(ContentType.Application.Json)
                setBody(MultipleVideoSummaryRequest(videoIds = videoIds))
            }

            coVerify(exactly = 1) { summarizeVideoUseCase.executeMultiple(videoIds, null) }
        }

    @Test
    fun `summarize multiple - returns 200 with empty list`() =
        withVideoRouteApp { client ->
            coEvery { summarizeVideoUseCase.executeMultiple(emptyList(), null) } returns null

            val response =
                client.post("/v1/summarize/multiple") {
                    contentType(ContentType.Application.Json)
                    setBody(MultipleVideoSummaryRequest(videoIds = emptyList()))
                }

            assertEquals(HttpStatusCode.OK, response.status)
        }

    @Test
    fun `summarize multiple - returns 500 when use case throws`() =
        withVideoRouteApp { client ->
            val videoIds = listOf("vid-1", "vid-2")

            coEvery { summarizeVideoUseCase.executeMultiple(videoIds, any()) } throws
                RuntimeException("Batch processing failed")

            val response =
                client.post("/v1/summarize/multiple") {
                    contentType(ContentType.Application.Json)
                    setBody(MultipleVideoSummaryRequest(videoIds = videoIds))
                }

            assertEquals(HttpStatusCode.InternalServerError, response.status)
            assertContains(response.bodyAsText(), "Batch processing failed")
        }

    @Test
    fun `summarize multiple - error body contains error key`() =
        withVideoRouteApp { client ->
            coEvery { summarizeVideoUseCase.executeMultiple(any(), any()) } throws
                RuntimeException("Something went wrong")

            val response =
                client.post("/v1/summarize/multiple") {
                    contentType(ContentType.Application.Json)
                    setBody(MultipleVideoSummaryRequest(videoIds = listOf("v1")))
                }

            val bodyText = response.bodyAsText()
            assertContains(bodyText, "\"error\"")
            assertContains(bodyText, "Something went wrong")
        }
}
