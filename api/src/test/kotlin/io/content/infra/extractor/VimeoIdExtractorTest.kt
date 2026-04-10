package io.content.infra.extractor

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class VimeoIdExtractorTest {
    @Test
    fun `extractId returns same value for numeric input`() {
        assertEquals("123456", VimeoIdExtractor.extractId("123456"))
        assertEquals("1", VimeoIdExtractor.extractId("1"))
        assertEquals("999999999", VimeoIdExtractor.extractId("999999999"))
    }

    @Test
    fun `extractId extracts ID from Vimeo URL`() {
        assertEquals("123456", VimeoIdExtractor.extractId("https://vimeo.com/123456"))
        assertEquals("789012", VimeoIdExtractor.extractId("http://vimeo.com/789012"))
        assertEquals("345678", VimeoIdExtractor.extractId("vimeo.com/345678"))
        assertEquals("901234", VimeoIdExtractor.extractId("https://www.vimeo.com/901234"))
    }

    @Test
    fun `extractId extracts ID from Vimeo URL with path parameters`() {
        assertEquals("123456", VimeoIdExtractor.extractId("https://vimeo.com/123456?param=value"))
        assertEquals("789012", VimeoIdExtractor.extractId("https://vimeo.com/789012/"))
        assertEquals("345678", VimeoIdExtractor.extractId("https://vimeo.com/345678/abc"))
    }

    @Test
    fun `extractId extracts ID from Vimeo URL with additional text`() {
        assertEquals("123456", VimeoIdExtractor.extractId("Check out this video: https://vimeo.com/123456"))
        assertEquals("789012", VimeoIdExtractor.extractId("vimeo.com/789012 is great"))
    }

    @Test
    fun `extractId throws IllegalArgumentException for invalid URL`() {
        assertThrows<IllegalArgumentException> {
            VimeoIdExtractor.extractId("https://youtube.com/123456")
        }
        assertThrows<IllegalArgumentException> {
            VimeoIdExtractor.extractId("https://vimeo.com/abc")
        }
        assertThrows<IllegalArgumentException> {
            VimeoIdExtractor.extractId("invalid input")
        }
        assertThrows<IllegalArgumentException> {
            VimeoIdExtractor.extractId("")
        }
        assertThrows<IllegalArgumentException> {
            VimeoIdExtractor.extractId("https://vimeo.com/")
        }
    }

    @Test
    fun `extractId extracts first ID when multiple Vimeo IDs present`() {
        assertEquals("123456", VimeoIdExtractor.extractId("https://vimeo.com/123456 and vimeo.com/789012"))
    }
}
