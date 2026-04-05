package io.content.infra.http

import com.google.genai.Client

object DefaultGeminiClient {
    private lateinit var client: Client

    fun init(apiKey: String) {
        client = Client.builder().apiKey(apiKey).build()
    }

    fun get() = client
}
