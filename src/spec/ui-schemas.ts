import { z } from "zod"

// Button Schema
export const ButtonSpec = z.object({
  type: z.literal("Button"),
  props: z.object({
    variant: z.enum(["default", "secondary", "destructive", "ghost", "link", "outline"]).default("default"),
    size: z.enum(["default", "sm", "lg", "icon"]).default("default"),
    href: z.string().url().optional(),
    children: z.string(), // text only (keep it simple)
    disabled: z.boolean().optional(),
  }),
})

// Badge Schema
export const BadgeSpec = z.object({
  type: z.literal("Badge"),
  props: z.object({
    variant: z.enum(["default", "secondary", "destructive", "outline"]).default("default"),
    children: z.string(),
  }),
})

// Card Schema (for raw Card usage)
export const CardSpec = z.object({
  type: z.literal("Card"),
  props: z.object({
    children: z.string().optional(),
    className: z.string().optional(),
  }),
})

// Alert Schema
export const AlertSpec = z.object({
  type: z.literal("Alert"),
  props: z.object({
    variant: z.enum(["default", "destructive"]).default("default"),
    title: z.string().optional(),
    description: z.string(),
  }),
})

// Input Schema
export const InputSpec = z.object({
  type: z.literal("Input"),
  props: z.object({
    type: z.enum(["text", "email", "password", "number"]).default("text"),
    placeholder: z.string().optional(),
    value: z.string().optional(),
    disabled: z.boolean().optional(),
  }),
})

// Label Schema
export const LabelSpec = z.object({
  type: z.literal("Label"),
  props: z.object({
    children: z.string(),
    htmlFor: z.string().optional(),
  }),
})

// Textarea Schema
export const TextareaSpec = z.object({
  type: z.literal("Textarea"),
  props: z.object({
    placeholder: z.string().optional(),
    value: z.string().optional(),
    disabled: z.boolean().optional(),
    rows: z.number().min(1).max(20).optional(),
  }),
})

// Progress Schema
export const ProgressSpec = z.object({
  type: z.literal("Progress"),
  props: z.object({
    value: z.number().min(0).max(100),
  }),
})

// Separator Schema
export const SeparatorSpec = z.object({
  type: z.literal("Separator"),
  props: z.object({
    orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
  }).optional(),
})

// Composed patterns - Hero
export const HeroSpec = z.object({
  type: z.literal("Hero"),
  props: z.object({
    eyebrow: z.string().optional(),
    headline: z.string(),
    subhead: z.string().optional(),
    cta: z.object({ 
      label: z.string(), 
      href: z.string().optional(),
      variant: z.enum(["default", "secondary", "destructive", "ghost", "link", "outline"]).optional(),
    }).optional(),
  }),
})

// Composed patterns - FeatureGrid
export const FeatureGridSpec = z.object({
  type: z.literal("FeatureGrid"),
  props: z.object({
    title: z.string(),
    items: z.array(z.object({
      icon: z.string().optional(),
      label: z.string(),
      description: z.string(),
    })).min(3).max(6),
  }),
})

// Composed patterns - Testimonial
export const TestimonialSpec = z.object({
  type: z.literal("Testimonial"),
  props: z.object({
    quote: z.string(),
    author: z.string().optional(),
    role: z.string().optional(),
  }),
})

// Union of all allowed component specs
export const AllowedComponentSpec = z.discriminatedUnion("type", [
  ButtonSpec,
  BadgeSpec,
  CardSpec,
  AlertSpec,
  InputSpec,
  LabelSpec,
  TextareaSpec,
  ProgressSpec,
  SeparatorSpec,
  HeroSpec,
  FeatureGridSpec,
  TestimonialSpec,
])

// Page Spec
export const PageSpec = z.object({
  version: z.literal("1"),
  theme: z.enum(["light", "dark"]).optional(),
  blocks: z.array(AllowedComponentSpec).min(1).max(12),
})

export type TPageSpec = z.infer<typeof PageSpec>
export type TComponent = z.infer<typeof AllowedComponentSpec>
