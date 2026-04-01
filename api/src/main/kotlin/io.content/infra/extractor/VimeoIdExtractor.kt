package io.content.infra.extractor

object VimeoIdExtractor {
    fun extractId(videoInput: String): String {
        if (videoInput.matches(Regex("^\\d+$"))) {
            return videoInput
        }

        val urlPattern = Regex("vimeo\\.com/(\\d+)")
        val matchResult = urlPattern.find(videoInput)

        return matchResult?.groupValues?.get(1)
            ?: throw IllegalArgumentException("Invalid Vimeo ID or URL format: $videoInput")
    }
}
