import { toPageSpec } from "@/lib/adapter"
import { PageSpec } from "@/spec/ui-schemas"
import type { TPageSpec } from "@/spec/ui-schemas"

export async function generateFromPrompt(brief: string): Promise<TPageSpec> {
  // Step 1: Call copywriter API
  const copyRes = await fetch("/api/copywriter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brief }),
  })

  if (!copyRes.ok) {
    const errorData = await copyRes.json().catch(() => ({}))
    throw new Error(errorData.error || "Copywriter failed")
  }

  const copy = await copyRes.json()

  // Check for out-of-scope error from copywriter
  if (copy.error === "OUT_OF_SCOPE") {
    throw new Error(copy.message || "Sorry, I can only answer questions about Charles Pfaff and his work.")
  }

  // Step 2: Call orchestrator API
  const orchRes = await fetch("/api/orchestrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intent: brief, copy }),
  })

  if (!orchRes.ok) {
    const errorData = await orchRes.json().catch(() => ({}))
    throw new Error(errorData.error || "Orchestrator failed")
  }

  const plan = await orchRes.json()

  // Check for out-of-scope error from orchestrator
  if (plan.error === "OUT_OF_SCOPE") {
    throw new Error(plan.message || "Sorry, I can only answer questions about Charles Pfaff and his work.")
  }

  // Step 3: Convert plan to PageSpec using adapter
  // The adapter handles orchestrator plan format (checks for components array),
  // normalizes component types, and validates against PageSpec schema
  try {
    const specCandidate = toPageSpec(plan)

    // Step 4: Validate (adapter already validates, but double-check for safety)
    const parsed = PageSpec.parse(specCandidate)

    return parsed
  } catch (validationError: any) {
    // Log the plan for debugging
    console.error("Validation failed. Orchestrator plan:", JSON.stringify(plan, null, 2))
    console.error("Validation error:", validationError)
    
    // If it's a Zod error, format it better
    if (validationError.errors && Array.isArray(validationError.errors)) {
      throw new Error(`Validation failed: ${JSON.stringify(validationError.errors)}`)
    }
    
    throw validationError
  }
}
