# Test Transcript Files

This directory contains transcript files used in the SummarizeVideoUseCaseTest.

## Files

- `transcript-simple.txt` - Simple transcript with one segment: "Hello world"
- `transcript-two-segments.txt` - Transcript with two segments: "Hello world" and "This is a test"
- `transcript-complex.txt` - Complex transcript with metadata, multiple segments, and numbers
- `transcript-first-video.txt` - Transcript for first video in multiple video tests: "First video content"
- `transcript-second-video.txt` - Transcript for second video in multiple video tests: "Second video content"
- `transcript-single-video.txt` - Transcript for single video tests: "Single video content"
- `transcript-content-one.txt` - Content for video 1 in three-video test: "Content one"
- `transcript-content-two.txt` - Content for video 2 in three-video test: "Content two"
- `transcript-content-three.txt` - Content for video 3 in three-video test: "Content three"
- `transcript-content.txt` - Simple content transcript: "Content"
- `transcript-empty.txt` - Empty transcript for edge case testing

These files can be loaded in tests using:

```kotlin
val transcript = File("src/test/resources/transcripts/transcript-simple.txt").readText()
```
