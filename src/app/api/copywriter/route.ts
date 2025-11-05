import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getRulesBundle } from "@/lib/rules"
import { parseJSONResponse } from "@/lib/json-extract"

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables")
  }
  return new Anthropic({
    apiKey,
  })
}

// Static data for Charles Pfaff (from rules/orchestrator-agent.md)
const STATIC_DATA = {
  bio: {
    name: "Charles Pfaff",
    title: "Creative Technologist & Front‑End Engineer",
    location: "Richmond, VA",
    summary: "I bridge design and engineering to craft human‑centered, performant experiences. I build thoughtful interfaces, design systems, and AI‑assisted workflows.",
    email: "hello@pfaff.design",
    site: "https://pfaff.design",
  },
  skills: {
    engineering: ["React", "TypeScript", "Next.js", "Node.js", "Tailwind CSS", "Storybook", "Supabase", "Postmark", "GSAP"],
    design: ["Figma", "Framer", "Design Systems", "Prototyping", "Accessibility"],
    other: ["UX Writing", "Prompt Design", "CI/CD", "Testing (Jest)"],
  },
  caseStudies: {
    fridgepal: {
      name: "FridgePal",
      summary: "Smart grocery & meal planning with AI receipt parsing and Supabase.",
      highlights: ["Email parsing of Instacart receipts", "Feature‑based React architecture", "Supabase Edge Functions for notifications"],
    },
    catalyst: {
      name: "Catalyst Design System",
      summary: "Token‑driven React + Tailwind component library documented in Storybook.",
      highlights: ["Radix UI primitives", "CVA token patterns", "Theming via CSS variables"],
    },
    makeNoise: {
      name: "Make Noise",
      summary: "Personal brand + portfolio blending music, art, and tech.",
      highlights: ["Editorial layout", "Simple color system", "Fast iteration workflow"],
    },
  },
  experience: [
    { role: "UX Engineer / Front‑End", org: "Agencies & Startups", summary: "Bridged design systems and app delivery across teams." },
  ],
  testimonials: [
    { author: "Design Lead", quote: "Charles bridges aesthetics and engineering with rare clarity." },
    { author: "PM", quote: "He ships clean, reliable interfaces—fast." },
  ],
  links: {
    github: "https://github.com/charlespfaff",
    linkedin: "https://www.linkedin.com/in/charlespfaff/",
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brief, style } = body

    if (!brief || typeof brief !== "string" || brief.trim().length === 0) {
      return NextResponse.json(
        { error: "Brief is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (brief.length > 1000) {
      return NextResponse.json(
        { error: "Brief is too long (max 1000 characters)" },
        { status: 400 }
      )
    }

    const trimmedBrief = brief.trim()

    // Get copywriter rules
    const { copywriter } = getRulesBundle()

    // Build system prompt
    const systemPrompt = `${copywriter}

## Static Data

${JSON.stringify(STATIC_DATA, null, 2)}

## Instructions

You must return ONLY valid JSON. Do not include:
- Markdown code blocks (three backticks with json or plain)
- Explanatory text before or after the JSON
- Any text outside the JSON object
- Comments or annotations

The response must start with { and end with }. Nothing else.`

    // Build user message
    const userMessage = style
      ? `Brief: ${trimmedBrief}\n\nStyle: ${style}`
      : `Brief: ${trimmedBrief}`

    // Call Anthropic
    const anthropic = getAnthropicClient()
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 2000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
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

    // Parse JSON response
    let parsedData: unknown
    try {
      parsedData = parseJSONResponse(content.text)
    } catch (parseError) {
      console.error("JSON parse error. Raw response:", content.text.substring(0, 500))
      console.error("Parse error:", parseError)
      throw new Error("Failed to parse AI response as JSON")
    }

    // Check for out-of-scope error
    if (typeof parsedData === "object" && parsedData !== null && "error" in parsedData) {
      return NextResponse.json(parsedData, { status: 200 })
    }

    return NextResponse.json(parsedData)
  } catch (error) {
    console.error("Error in copywriter route:", error)

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API error: ${error.message}` },
        { status: 500 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
