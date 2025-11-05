/**
 * Extracts JSON from AI response, handling markdown code blocks and extra text
 */

export function extractJSON(text: string): string {
  // Remove markdown code blocks (```json ... ``` or ``` ... ```)
  let cleaned = text.replace(/```json\s*\n?/g, "").replace(/```\s*\n?/g, "").trim()

  // Find JSON object boundaries
  const jsonStart = cleaned.indexOf("{")
  const jsonEnd = cleaned.lastIndexOf("}")

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    // Try to find array boundaries as fallback
    const arrayStart = cleaned.indexOf("[")
    const arrayEnd = cleaned.lastIndexOf("]")
    
    if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
      cleaned = cleaned.substring(arrayStart, arrayEnd + 1)
    } else {
      throw new Error("No JSON object or array found in response")
    }
  } else {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1)
  }

  // Remove any trailing commas before closing braces/brackets (common AI mistake)
  cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1")

  return cleaned.trim()
}

export function parseJSONResponse(text: string): unknown {
  try {
    // First, try direct parsing
    return JSON.parse(text)
  } catch {
    // If that fails, try extracting JSON from markdown/extra text
    const extracted = extractJSON(text)
    return JSON.parse(extracted)
  }
}
