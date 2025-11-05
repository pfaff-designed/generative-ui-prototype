import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface TestimonialProps {
  quote: string
  author?: string
  role?: string
}

export function Testimonial({ quote, author, role }: TestimonialProps) {

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <blockquote className="text-center">
              <p className="text-2xl sm:text-3xl font-medium mb-6 italic">
                &ldquo;{quote}&rdquo;
              </p>
              {(author || role) && (
                <>
                  <Separator className="my-4" />
                  <footer className="text-muted-foreground">
                    {author && <cite className="font-semibold not-italic">{author}</cite>}
                    {author && role && <span className="mx-2">—</span>}
                    {role && <span>{role}</span>}
                  </footer>
                </>
              )}
            </blockquote>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
