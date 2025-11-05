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

// Component catalog based on ui-schemas.ts
const COMPONENT_CATALOG = {
  Hero: {
    description: "Composed hero section with eyebrow, headline, subhead, and optional CTA",
    props: {
      eyebrow: "string (optional)",
      headline: "string (required)",
      subhead: "string (optional)",
      cta: {
        label: "string (required if cta provided)",
        href: "string (optional)",
        variant: "default | secondary | destructive | ghost | link | outline (optional)",
      },
    },
  },
  FeatureGrid: {
    description: "Grid of feature items (3-6 items)",
    props: {
      title: "string (required)",
      items: [
        {
          icon: "string (optional)",
          label: "string (required)",
          description: "string (required)",
        },
      ],
    },
  },
  Testimonial: {
    description: "Testimonial card with quote, author, and optional role",
    props: {
      quote: "string (required)",
      author: "string (optional)",
      role: "string (optional)",
    },
  },
  Button: {
    description: "Shadcn Button component",
    props: {
      variant: "default | secondary | destructive | ghost | link | outline (default: default)",
      size: "default | sm | lg | icon (default: default)",
      href: "string (URL, optional)",
      children: "string (required - button text)",
      disabled: "boolean (optional)",
    },
  },
  Badge: {
    description: "Shadcn Badge component",
    props: {
      variant: "default | secondary | destructive | outline (default: default)",
      children: "string (required)",
    },
  },
  Card: {
    description: "Shadcn Card component",
    props: {
      children: "string (optional)",
      className: "string (optional)",
    },
  },
  Alert: {
    description: "Shadcn Alert component",
    props: {
      variant: "default | destructive (default: default)",
      title: "string (optional)",
      description: "string (required)",
    },
  },
  Input: {
    description: "Shadcn Input component",
    props: {
      type: "text | email | password | number (default: text)",
      placeholder: "string (optional)",
      value: "string (optional)",
      disabled: "boolean (optional)",
    },
  },
  Label: {
    description: "Shadcn Label component",
    props: {
      children: "string (required)",
      htmlFor: "string (optional)",
    },
  },
  Textarea: {
    description: "Shadcn Textarea component",
    props: {
      placeholder: "string (optional)",
      value: "string (optional)",
      disabled: "boolean (optional)",
      rows: "number 1-20 (optional)",
    },
  },
  Progress: {
    description: "Shadcn Progress component",
    props: {
      value: "number 0-100 (required)",
    },
  },
  Separator: {
    description: "Shadcn Separator component",
    props: {
      orientation: "horizontal | vertical (default: horizontal)",
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { intent, copy } = body

    if (!intent || typeof intent !== "string" || intent.trim().length === 0) {
      return NextResponse.json(
        { error: "Intent is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!copy || typeof copy !== "object" || copy === null) {
      return NextResponse.json(
        { error: "Copy is required and must be an object" },
        { status: 400 }
      )
    }

    const trimmedIntent = intent.trim()

    // Get orchestrator rules
    const { orchestrator } = getRulesBundle()

    // Build system prompt
    const systemPrompt = `${orchestrator}

## Component Catalog

${JSON.stringify(COMPONENT_CATALOG, null, 2)}

## Instructions

You must return ONLY valid JSON. Do not include:
- Markdown code blocks (three backticks with json or plain)
- Explanatory text before or after the JSON
- Any text outside the JSON object
- Comments or annotations

The response must start with { and end with }. Nothing else.

Your output must match this exact structure:
{
  "route": "/string",
  "components": [
    {
      "type": "Hero",
      "props": { ... },
      "from": "sections.hero"
    }
  ],
  "used_copy_keys": ["meta", "sections.hero"],
  "notes": "string (optional)"
}`

    // Build user message
    const userMessage = `Intent: ${trimmedIntent}

Copy payload:
${JSON.stringify(copy, null, 2)}`

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
    console.error("Error in orchestrate route:", error)

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
