package io.content.infra.model

import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.databind.annotation.JsonNaming

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy::class)
data class VimeoAuthorizeBody(
    val grantType: String,
    val scope: String
) {
    companion object {
        fun create() =  VimeoAuthorizeBody(
            grantType = CLIENT_CREDENTIALS_GRANT,
            scope = PUBLIC_SCOPE
        )

        private const val CLIENT_CREDENTIALS_GRANT = "client_credentials"
        private const val PUBLIC_SCOPE = "public"
    }
}
