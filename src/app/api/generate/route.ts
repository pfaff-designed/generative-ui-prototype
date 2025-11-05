import { NextRequest, NextResponse } from "next/server"
import { generatePageSpec } from "@/lib/ai-client"
import { validatePageSpec } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Prompt is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Prompt is too long (max 1000 characters)" },
        { status: 400 }
      )
    }

    // Generate page spec from AI
    const jsonString = await generatePageSpec(prompt.trim())

    // Parse JSON
    let parsedData: unknown
    try {
      parsedData = JSON.parse(jsonString)
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: "Failed to parse AI response as JSON" },
        { status: 500 }
      )
    }

    // Validate with Zod
    const validationResult = validatePageSpec(parsedData)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: `Invalid schema: ${validationResult.error}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: validationResult.data,
    })
  } catch (error) {
    console.error("Error in generate route:", error)
    
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
