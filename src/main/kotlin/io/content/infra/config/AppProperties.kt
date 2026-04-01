package io.content.infra.config

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

data class AppProperties(
    val geminiApiKey: String,
    val vimeoUsername: String,
    val vimeoPassword: String
) {
    companion object {
        fun create(env: ApplicationEnvironment): AppProperties {
            return AppProperties(
                geminiApiKey = env.config.property("gemini.api-key").getString(),
                vimeoUsername = env.config.property("vimeo.username").getString(),
                vimeoPassword = env.config.property("vimeo.password").getString()
            )
        }
    }
}