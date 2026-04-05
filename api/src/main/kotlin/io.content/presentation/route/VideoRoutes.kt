package io.content.presentation.route

import io.content.domain.usecase.SummarizeVideoUseCase
import io.content.presentation.dto.VideoSummaryRequest
import io.content.presentation.dto.VideoSummaryResponse
import io.ktor.http.HttpStatusCode.Companion.InternalServerError
import io.ktor.http.HttpStatusCode.Companion.OK
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import org.koin.ktor.ext.inject

fun Route.videoGenerateRoute() {
    val summarizeVideoUseCase: SummarizeVideoUseCase by inject()

    post("/v1/summarize") {
        runCatching {
            val request = call.receive<VideoSummaryRequest>()
            val result = summarizeVideoUseCase.execute(request.videoIds, request.summarizePrompt, request.aiDetails)

            call.respond(OK, VideoSummaryResponse(result))
        }.onFailure { err ->
            call.respond(InternalServerError, mapOf("error" to err.message))
        }
    }
}
