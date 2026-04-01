package io.content.infra.http

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.jackson.*

object AppHttpClient {
    val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            jackson()
        }
    }
}
