import { toPageSpec } from "@/lib/adapter"
import { PageSpec } from "@/spec/ui-schemas"
import type { TPageSpec } from "@/spec/ui-schemas"

export async function generateFromPrompt(brief: string): Promise<TPageSpec> {
  console.log("\n=== GENERATE PIPELINE START ===")
  console.log("Brief:", brief)

  // Step 1: Call copywriter API
  console.log("\n[1/3] Calling copywriter API...")
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
  console.log("[1/3] Copywriter response received")
  if (copy.sections) {
    console.log(`  Sections: ${copy.sections.length}`)
    copy.sections.forEach((s: any, i: number) => {
      console.log(`    ${i + 1}. ${s.key || "unknown"}: ${s.content?.headline || s.purpose || "no headline"}`)
    })
  }

  // Step 2: Call orchestrator API
  console.log("\n[2/3] Calling orchestrator API...")
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
  console.log("[2/3] Orchestrator response received")
  if (plan.components) {
    console.log(`  Components: ${plan.components.length}`)
    plan.components.forEach((c: any, i: number) => {
      console.log(`    ${i + 1}. ${c.type} (from: ${c.from || "unknown"})`)
    })
  }

  // Step 3: Convert plan to PageSpec using adapter
  // The adapter handles orchestrator plan format (checks for components array),
  // normalizes component types, and validates against PageSpec schema
  console.log("\n[3/3] Converting and validating PageSpec...")
  try {
    const specCandidate = toPageSpec(plan)
    console.log(`[3/3] Validation successful - ${specCandidate.blocks.length} blocks`)

    // Step 4: Validate (adapter already validates, but double-check for safety)
    const parsed = PageSpec.parse(specCandidate)
    
    console.log("\n=== GENERATE PIPELINE COMPLETE ===")
    console.log(`Final spec: ${parsed.blocks.length} blocks`)
    parsed.blocks.forEach((block, i) => {
      console.log(`  ${i + 1}. ${block.type}`)
    })

    return parsed
  } catch (validationError: any) {
    // Log the plan for debugging
    console.error("\n=== GENERATE PIPELINE VALIDATION ERROR ===")
    console.error("Orchestrator plan:", JSON.stringify(plan, null, 2))
    console.error("Validation error:", validationError)
    
    // If it's a Zod error, format it better
    if (validationError.errors && Array.isArray(validationError.errors)) {
      throw new Error(`Validation failed: ${JSON.stringify(validationError.errors)}`)
    }
    
    throw validationError
  }
}
