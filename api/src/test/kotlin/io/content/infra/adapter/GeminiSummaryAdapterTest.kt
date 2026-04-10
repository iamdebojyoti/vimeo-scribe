package io.content.infra.adapter

import io.content.presentation.dto.AIProvider
import io.mockk.unmockkAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class GeminiSummaryAdapterTest {
    private lateinit var adapter: GeminiSummaryAdapter

    @BeforeEach
    fun setup() {
        adapter = GeminiSummaryAdapter()
    }

    @AfterEach
    fun tearDown() {
        unmockkAll()
    }

    @Test
    fun `providerName returns GEMINI`() {
        assertEquals(AIProvider.GEMINI, adapter.providerName())
    }
}
