import { NextRequest, NextResponse } from "next/server"
import { generateFromPrompt } from "@/lib/actions/generate"

/**
 * Test endpoint to verify AI generation is working
 * POST /api/test-ai
 * Body: { prompt: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    
    console.log("\n=== TEST AI ENDPOINT ===")
    console.log("Prompt:", prompt)
    console.log("Starting generation pipeline...")

    const result = await generateFromPrompt(prompt.trim())
    
    const duration = Date.now() - startTime

    console.log(`\n=== GENERATION COMPLETE (${duration}ms) ===`)
    console.log("Generated blocks:", result.blocks.length)
    result.blocks.forEach((block, i) => {
      console.log(`  ${i + 1}. ${block.type}`)
    })

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      duration: `${duration}ms`,
      prompt,
      result: {
        version: result.version,
        theme: result.theme,
        blockCount: result.blocks.length,
        blocks: result.blocks.map(b => ({
          type: b.type,
          propsKeys: Object.keys(b.props || {}),
        })),
      },
      fullSpec: result, // Include full spec for detailed inspection
    })
  } catch (error: any) {
    console.error("\n=== TEST AI ERROR ===")
    console.error("Error:", error.message)
    console.error("Stack:", error.stack)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        errorType: error.constructor.name,
      },
      { status: 500 }
    )
  }
}

