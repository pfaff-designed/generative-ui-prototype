import { PageSpec, type TPageSpec, type TComponent } from "@/spec/ui-schemas"

// Type alias map for common variations the model might use
const TYPE_ALIASES: Record<string, string> = {
  "hero": "Hero",
  "Hero": "Hero",
  "featureGrid": "FeatureGrid",
  "FeatureGrid": "FeatureGrid",
  "feature-grid": "FeatureGrid",
  "testimonial": "Testimonial",
  "Testimonial": "Testimonial",
  "ctaButton": "Button",
  "CTAButton": "Button",
  "button": "Button",
  "badge": "Badge",
  "card": "Card",
  "alert": "Alert",
  "input": "Input",
  "label": "Label",
  "textarea": "Textarea",
  "progress": "Progress",
  "separator": "Separator",
}

// Normalize component type using aliases
function normalizeType(type: string): string {
  return TYPE_ALIASES[type] || type
}

// Transform props to match schema (normalize variant names, etc.)
function normalizeProps(type: string, props: any): any {
  const normalizedType = normalizeType(type)
  
  // Normalize variant names for Button
  if (normalizedType === "Button" && props.variant) {
    const validVariants = ["default", "secondary", "destructive", "ghost", "link", "outline"]
    if (!validVariants.includes(props.variant)) {
      props.variant = "default"
    }
  }
  
  // Normalize variant names for Badge
  if (normalizedType === "Badge" && props.variant) {
    const validVariants = ["default", "secondary", "destructive", "outline"]
    if (!validVariants.includes(props.variant)) {
      props.variant = "default"
    }
  }
  
  // Transform old Hero format to new format
  if (normalizedType === "Hero" && props.content) {
    return {
      eyebrow: props.eyebrow,
      headline: props.content.heading || props.headline,
      subhead: props.content.subheading || props.subhead,
      cta: props.content.ctaLabel ? {
        label: props.content.ctaLabel,
        href: props.content.ctaHref || props.cta?.href,
      } : props.cta,
    }
  }
  
  // Transform FeatureGrid props - handle variations in field names
  if (normalizedType === "FeatureGrid") {
    // Ensure we have valid items array
    let normalizedItems: any[] = []
    if (Array.isArray(props.items)) {
      normalizedItems = props.items
        .filter((item: any) => item && typeof item === "object") // Filter out null/undefined
        .map((item: any) => {
          // Map various possible field names to the expected schema format
          const label = item.label || item.title || item.name || item.heading || item.text || ""
          const description = item.description || item.desc || item.body || item.summary || ""
          
          return {
            icon: item.icon || undefined,
            label: label.trim(),
            description: description.trim(),
          }
        })
        .filter((item: any) => item.label && item.description) // Only include items with both required fields
    }
    
    // Ensure we have at least 3 items (required by schema)
    if (normalizedItems.length < 3) {
      // Log warning in development
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `FeatureGrid has only ${normalizedItems.length} valid items (minimum 3 required). Original props:`,
          props
        )
      }
      // This will fail validation, but we return the structure anyway
      normalizedItems = normalizedItems.length > 0 ? normalizedItems : []
    }
    
    const title = props.title || props.heading || props.name || ""
    
    return {
      title: title.trim() || "Features", // Provide default if missing
      items: normalizedItems,
    }
  }
  
  // Transform Testimonial props - handle variations
  if (normalizedType === "Testimonial") {
    return {
      quote: props.quote || props.text || props.content || "",
      author: props.author || props.name,
      role: props.role || props.title,
    }
  }
  
  return props
}

export function toPageSpec(modelPlan: unknown): TPageSpec {
  // Handle different input formats
  let blocks: any[] = []
  
  if (typeof modelPlan === "object" && modelPlan !== null) {
    const plan = modelPlan as any
    
    // Format 1: { blocks: [...] }
    if (Array.isArray(plan.blocks)) {
      blocks = plan.blocks
    }
    // Format 2: { components: [...] } (orchestrator format)
    else if (Array.isArray(plan.components)) {
      blocks = plan.components
    }
    // Format 3: Direct array
    else if (Array.isArray(plan)) {
      blocks = plan
    }
  }
  
  // Transform and normalize blocks
  const normalizedBlocks: TComponent[] = blocks
    .map((block) => {
      if (!block || typeof block !== "object") return null
      
      const type = normalizeType(block.type || block.componentType || "")
      const props = normalizeProps(type, block.props || {})
      
      return {
        type: type as any,
        props,
      } as TComponent
    })
    .filter((block): block is TComponent => block !== null)
  
  const candidate = {
    version: "1" as const,
    theme: (typeof modelPlan === "object" && modelPlan !== null && "theme" in modelPlan)
      ? modelPlan.theme
      : undefined,
    blocks: normalizedBlocks,
  }
  
  // Validate against schema (throws if invalid)
  return PageSpec.parse(candidate)
}
