import { z } from "zod"
import { HeroProps as HeroPropsSchema } from "@/spec/pageSpec"

type HeroProps = z.infer<typeof HeroPropsSchema>

interface HeroComponentProps {
  props: HeroProps
}

export function Hero({ props }: HeroComponentProps) {
  const { content } = props

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        {content.heading && (
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {content.heading}
          </h1>
        )}
        {content.subheading && (
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {content.subheading}
          </p>
        )}
        {content.ctaLabel && (
          <button
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            type="button"
          >
            {content.ctaLabel}
          </button>
        )}
      </div>
    </section>
  )
}
