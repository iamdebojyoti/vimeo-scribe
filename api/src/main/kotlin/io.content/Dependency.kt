package io.content

import io.content.domain.port.SummaryPort
import io.content.domain.port.TranscriptPort
import io.content.domain.usecase.SummarizeVideoUseCase
import io.content.infra.adapter.GeminiSummaryAdapter
import io.content.infra.adapter.VimeoTranscriptAdapter
import io.content.infra.config.AppProperties
import io.content.infra.http.DefaultGeminiClient
import io.ktor.server.application.Application
import io.ktor.server.application.install
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin

fun Application.configureDependency() {
    val props = AppProperties.create(environment)
    DefaultGeminiClient.init(props.geminiApiKey)

    val appModule =
        module {
            single<TranscriptPort> { VimeoTranscriptAdapter(props.vimeoUsername, props.vimeoPassword) }
            single<List<SummaryPort>> { listOf(GeminiSummaryAdapter()) }
            single<SummarizeVideoUseCase> { SummarizeVideoUseCase(get(), get()) }
        }

    install(Koin) {
        modules(appModule)
    }
}
