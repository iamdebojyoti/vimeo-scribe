package io.content.presentation.route

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import io.content.domain.usecase.SummarizeVideoUseCase
import io.content.infra.extractor.VimeoIdExtractor
import io.content.presentation.dto.AIDetails
import io.content.presentation.dto.AIProvider
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

    companion object {
        private val testAIDetails =
            AIDetails(
                provider = AIProvider.GEMINI,
                apiKey = "test-api-key",
                additionalData = mapOf("model" to "gemini-pro", "temperature" to "0.5"),
            )

        private val minimalAIDetails =
            AIDetails(
                provider = AIProvider.GEMINI,
                apiKey = "minimal-key",
            )
    }

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
    fun `summarize multiple videos - returns 200 with combined summary on success`() =
        withVideoRouteApp { client ->
            val videoIds = listOf("vid-A", "vid-B", "vid-C")
            val prompt = "Give an overview"
            val summary = "Combined summary of all three videos"
            val request =
                VideoSummaryRequest(
                    videoIds = videoIds,
                    summarizePrompt = prompt,
                    aiDetails = testAIDetails,
                )

            coEvery { summarizeVideoUseCase.execute(videoIds, prompt, testAIDetails) } returns summary

            val response =
                client.post("/v1/summarize") {
                    contentType(ContentType.Application.Json)
                    setBody(request)
                }

            assertEquals(HttpStatusCode.OK, response.status)
            val body = response.body<VideoSummaryResponse>()
            assertEquals(summary, body.summary)

            coVerify(exactly = 1) { summarizeVideoUseCase.execute(videoIds, prompt, testAIDetails) }
            coVerify(exactly = 0) { VimeoIdExtractor.extractId(any()) }
        }

    @Test
    fun `summarize videos with AI details - passes correct parameters to use case`() =
        withVideoRouteApp { client ->
            val videoIds = listOf("vid-X", "vid-Y")
            val request =
                VideoSummaryRequest(
                    videoIds = videoIds,
                    aiDetails = minimalAIDetails,
                )

            coEvery { summarizeVideoUseCase.execute(videoIds, null, minimalAIDetails) } returns "Summary"

            client.post("/v1/summarize") {
                contentType(ContentType.Application.Json)
                setBody(request)
            }

            coVerify(exactly = 1) { summarizeVideoUseCase.execute(videoIds, null, minimalAIDetails) }
        }

    @Test
    fun `summarize empty video list - returns 200 with null summary`() =
        withVideoRouteApp { client ->
            coEvery { summarizeVideoUseCase.execute(emptyList(), null, null) } returns null

            val response =
                client.post("/v1/summarize") {
                    contentType(ContentType.Application.Json)
                    setBody(VideoSummaryRequest(videoIds = emptyList()))
                }

            assertEquals(HttpStatusCode.OK, response.status)
        }

    @Test
    fun `summarize with use case exception - returns 500 with error message`() =
        withVideoRouteApp { client ->
            val videoIds = listOf("vid-1", "vid-2")
            val request =
                VideoSummaryRequest(
                    videoIds = videoIds,
                    aiDetails = testAIDetails,
                )

            coEvery { summarizeVideoUseCase.execute(videoIds, null, testAIDetails) } throws
                RuntimeException("Batch processing failed")

            val response =
                client.post("/v1/summarize") {
                    contentType(ContentType.Application.Json)
                    setBody(request)
                }

            assertEquals(HttpStatusCode.InternalServerError, response.status)
            assertContains(response.bodyAsText(), "Batch processing failed")
        }

    @Test
    fun `summarize with error response - error body contains error key`() =
        withVideoRouteApp { client ->
            val request =
                VideoSummaryRequest(
                    videoIds = listOf("v1"),
                    aiDetails = testAIDetails,
                )

            coEvery { summarizeVideoUseCase.execute(listOf("v1"), null, testAIDetails) } throws
                RuntimeException("Something went wrong")

            val response =
                client.post("/v1/summarize") {
                    contentType(ContentType.Application.Json)
                    setBody(request)
                }

            val bodyText = response.bodyAsText()
            assertContains(bodyText, "\"error\"")
            assertContains(bodyText, "Something went wrong")
        }
}
