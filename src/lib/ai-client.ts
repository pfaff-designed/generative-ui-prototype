import Anthropic from "@anthropic-ai/sdk"
import { buildSystemPrompt } from "./prompts"

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables")
  }
  return new Anthropic({
    apiKey,
  })
}

export async function generatePageSpec(prompt: string): Promise<string> {
  try {
    const anthropic = getAnthropicClient()
    const systemPrompt = buildSystemPrompt({ mode: "page-generation" })
    
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 2000,
      temperature: 0.3,
      system: systemPrompt,
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