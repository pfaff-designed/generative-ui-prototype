import { z } from "zod"
import { TestimonialProps as TestimonialPropsSchema } from "@/spec/pageSpec"

type TestimonialProps = z.infer<typeof TestimonialPropsSchema>

interface TestimonialComponentProps {
  props: TestimonialProps
}

export function Testimonial({ props }: TestimonialComponentProps) {
  const { quote, author, role } = props

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-3xl mx-auto">
        <blockquote className="text-center">
          <p className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-white mb-6 italic">
            &ldquo;{quote}&rdquo;
          </p>
          {(author || role) && (
            <footer className="text-gray-600 dark:text-gray-400">
              {author && <cite className="font-semibold not-italic">{author}</cite>}
              {author && role && <span className="mx-2">—</span>}
              {role && <span>{role}</span>}
            </footer>
          )}
        </blockquote>
      </div>
    </section>
  )
}
