package io.content.infra.adapter

import io.content.domain.port.TranscriptPort
import io.content.infra.http.AppHttpClient
import io.content.infra.model.VimeoAuthorizeBody
import io.content.infra.response.VimeoApiVideoData
import io.content.infra.response.VimeoAuthResponse
import io.ktor.client.call.body
import io.ktor.client.request.basicAuth
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType

class VimeoTranscriptAdapter(val vimeoUsername: String, val vimeoPassword: String) : TranscriptPort {
    override suspend fun fetchTranscript(videoId: String): String =
        readData(videoId).let {
            AppHttpClient.client.get(it.data[0].sourceLink).body()
        }

    private suspend fun authorize(): VimeoAuthResponse {
        return AppHttpClient.client.post(VIMEO_AUTHORIZE_URL) {
            basicAuth(vimeoUsername, vimeoPassword)
            contentType(ContentType.Application.Json)
            setBody(VimeoAuthorizeBody.create())
        }.body()
    }

    private suspend fun readData(videoId: String): VimeoApiVideoData {
        val accessToken = authorize().accessToken
        return AppHttpClient.client.get("${VIMEO_DATA_READ_BASE_URL}/$videoId/texttracks") {
            header("Authorization", "bearer $accessToken")
            contentType(ContentType.Application.Json)
        }.body()
    }

    companion object {
        private const val VIMEO_AUTHORIZE_URL = "https://api.vimeo.com/oauth/authorize/client"
        private const val VIMEO_DATA_READ_BASE_URL = "https://api.vimeo.com/videos"
    }
}
