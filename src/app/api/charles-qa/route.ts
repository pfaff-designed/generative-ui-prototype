import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { buildSystemPrompt } from "@/lib/prompts"
import { filterQuestion } from "@/lib/question-filter"

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables")
  }
  return new Anthropic({
    apiKey,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question } = body

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Question is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (question.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Question is too long (max 1000 characters)" },
        { status: 400 }
      )
    }

    const trimmedQuestion = question.trim()

    // Pre-filter: reject irrelevant questions before calling the model
    const filterResult = filterQuestion(trimmedQuestion)
    if (!filterResult.relevant) {
      return NextResponse.json({
        success: true,
        answer: "Sorry, I can only answer questions about Charles Pfaff and his work.",
        filtered: true,
      })
    }

    // Build system prompt with rules
    const systemPrompt = buildSystemPrompt({ mode: "qa" })

    // Call Anthropic
    const anthropic = getAnthropicClient()
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: trimmedQuestion,
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

    return NextResponse.json({
      success: true,
      answer: content.text,
      filtered: false,
    })
  } catch (error) {
    console.error("Error in charles-qa route:", error)

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { success: false, error: `Anthropic API error: ${error.message}` },
        { status: 500 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
