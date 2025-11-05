import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeroProps {
  eyebrow?: string
  headline: string
  subhead?: string
  cta?: {
    label: string
    href?: string
    variant?: "default" | "secondary" | "destructive" | "ghost" | "link" | "outline"
  }
}

export function Hero({ eyebrow, headline, subhead, cta }: HeroProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {eyebrow && (
          <Badge variant="secondary" className="mb-4">
            {eyebrow}
          </Badge>
        )}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
          {headline}
        </h1>
        {subhead && (
          <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {subhead}
          </p>
        )}
        {cta && (
          <Button 
            size="lg" 
            variant={cta.variant || "default"}
            className="mt-4"
            {...(cta.href ? { asChild: true } : {})}
          >
            {cta.href ? (
              <a href={cta.href}>{cta.label}</a>
            ) : (
              cta.label
            )}
          </Button>
        )}
      </div>
    </section>
  )
}
