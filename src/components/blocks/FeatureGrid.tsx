import { z } from "zod"
import { FeatureProps as FeaturePropsSchema } from "@/spec/pageSpec"

type FeatureProps = z.infer<typeof FeaturePropsSchema>

interface FeatureGridComponentProps {
  props: FeatureProps
}

export function FeatureGrid({ props }: FeatureGridComponentProps) {
  const { title, items } = props

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {item.icon && (
                <div className="text-4xl mb-4" aria-hidden="true">
                  {item.icon}
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {item.label}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
