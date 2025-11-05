import Anthropic from "@anthropic-ai/sdk"

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables")
  }
  return new Anthropic({
    apiKey,
  })
}

const SYSTEM_PROMPT = `You are a UI specification generator. Your task is to generate a JSON object that describes a page layout with components and their content.

You must return ONLY valid JSON, no markdown, no code blocks, no explanations.

Allowed component types:
1. "hero" - A hero section with heading (required), optional subheading, and optional CTA button
2. "featureGrid" - A grid of features with a title and 3-6 feature items (each with label and description, optional icon)
3. "testimonial" - A testimonial with quote (required), optional author and role

The JSON schema you must follow:
{
  "version": "1",
  "theme": "light" | "dark" (optional),
  "blocks": [
    {
      "type": "hero",
      "props": {
        "content": {
          "heading": "string (required)",
          "subheading": "string (optional)",
          "ctaLabel": "string (optional)"
        }
      }
    },
    {
      "type": "featureGrid",
      "props": {
        "title": "string (required)",
        "items": [
          {
            "icon": "string (optional)",
            "label": "string (required)",
            "description": "string (required)"
          }
        ] // Must have 3-6 items
      }
    },
    {
      "type": "testimonial",
      "props": {
        "quote": "string (required)",
        "author": "string (optional)",
        "role": "string (optional)"
      }
    }
  ] // Must have 1-12 blocks
}

Return ONLY the JSON object, nothing else.`

export async function generatePageSpec(prompt: string): Promise<string> {
  try {
    const anthropic = getAnthropicClient()
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 2000,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== "text") {
      throw new Error("Unexpected content type from Anthropic API")
    }

    if (!content.text) {
      throw new Error("No content returned from Anthropic")
    }

    return content.text
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Anthropic API error: ${error.message}`)
    }
    throw error
  }
}