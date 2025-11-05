import { TBlock } from "@/spec/pageSpec"
import { Hero } from "./blocks/Hero"
import { FeatureGrid } from "./blocks/FeatureGrid"
import { Testimonial } from "./blocks/Testimonial"
import { ErrorBoundary } from "./ErrorBoundary"

interface BlockRendererProps {
  block: TBlock
}

export function BlockRenderer({ block }: BlockRendererProps) {
  return (
    <ErrorBoundary>
      {block.type === "hero" && <Hero props={block.props} />}
      {block.type === "featureGrid" && <FeatureGrid props={block.props} />}
      {block.type === "testimonial" && <Testimonial props={block.props} />}
    </ErrorBoundary>
  )
}
