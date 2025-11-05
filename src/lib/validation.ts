import { PageSpec, TPageSpec } from "@/spec/ui-schemas"

export function validatePageSpec(data: unknown): { success: true; data: TPageSpec } | { success: false; error: string } {
  try {
    const validated = PageSpec.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown validation error" }
  }
}
