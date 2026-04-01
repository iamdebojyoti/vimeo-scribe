package io.content.infra.response

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.PropertyNamingStrategies.SnakeCaseStrategy
import com.fasterxml.jackson.databind.annotation.JsonNaming

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonNaming(SnakeCaseStrategy::class)
data class VimeoApiVideoData(
    val data: List<VimeoData>,
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonNaming(SnakeCaseStrategy::class)
    data class VimeoData(
        val sourceLink: String,
    )
}
