import { NextRequest, NextResponse } from "next/server"
import { generatePageSpec } from "@/lib/ai-client"
import { parseJSONResponse } from "@/lib/json-extract"
import { toPageSpec } from "@/lib/adapter"

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

    // Parse JSON (handles markdown code blocks and extra text)
    let parsedData: unknown
    try {
      parsedData = parseJSONResponse(jsonString)
    } catch (parseError) {
      // Log the raw response for debugging
      console.error("JSON parse error. Raw response:", jsonString.substring(0, 500))
      console.error("Parse error:", parseError)
      
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to parse AI response as JSON",
          details: process.env.NODE_ENV === "development" 
            ? `Raw response preview: ${jsonString.substring(0, 200)}...` 
            : undefined
        },
        { status: 500 }
      )
    }

    // Transform and validate using adapter
    let validatedSpec
    try {
      validatedSpec = toPageSpec(parsedData)
    } catch (adapterError) {
      // Log the actual response for debugging
      console.error("Adapter validation failed. Received data:", JSON.stringify(parsedData, null, 2))
      console.error("Adapter error:", adapterError)
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid schema: ${adapterError instanceof Error ? adapterError.message : "Unknown error"}`,
          receivedData: process.env.NODE_ENV === "development" 
            ? parsedData 
            : undefined
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: validatedSpec,
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
