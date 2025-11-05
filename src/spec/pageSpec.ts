import { z } from "zod"

// 1) Text content is required in most components
const TextContent = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  body: z.string().optional(),
  ctaLabel: z.string().optional(),
})

// 2) Component props per type (extend as needed)
export const HeroProps = z.object({
  content: TextContent.extend({
    heading: z.string(), // required for hero
    subheading: z.string().optional(),
    ctaLabel: z.string().optional(),
  }),
})

export const FeatureProps = z.object({
  title: z.string(),
  items: z.array(z.object({
    icon: z.string().optional(),
    label: z.string(),
    description: z.string(),
  })).min(3).max(6)
})

export const TestimonialProps = z.object({
  quote: z.string(),
  author: z.string().optional(),
  role: z.string().optional(),
})

// 3) Union of allowed block types
const Block = z.discriminatedUnion("type", [
  z.object({ type: z.literal("hero"), props: HeroProps }),
  z.object({ type: z.literal("featureGrid"), props: FeatureProps }),
  z.object({ type: z.literal("testimonial"), props: TestimonialProps }),
])

export const PageSpec = z.object({
  version: z.literal("1").default("1"),
  theme: z.enum(["light", "dark"]).optional(),
  blocks: z.array(Block).min(1).max(12),
})

// src/lib/planToPageSpec.ts
type OrchestratorPlan = {
  route?: string;
  components: { type: string; props: any; from?: string }[];
};

type PageSpecV1 = {
  version: "1";
  route?: string;
  blocks: { type: string; props: any; from?: string }[];
};

export function planToPageSpec(plan: OrchestratorPlan): PageSpecV1 {
  return {
    version: "1",
    route: plan.route ?? "/",
    blocks: plan.components.map(c => ({
      type: c.type,
      props: c.props,
      from: c.from,
    })),
  };
}

export type TPageSpec = z.infer<typeof PageSpec>
export type TBlock = z.infer<typeof Block>
