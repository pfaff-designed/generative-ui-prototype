import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface FeatureGridProps {
  title: string
  items: Array<{
    icon?: string
    label: string
    description: string
  }>
}

export function FeatureGrid({ title, items }: FeatureGridProps) {

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                {item.icon && (
                  <div className="text-4xl mb-2" aria-hidden="true">
                    {item.icon}
                  </div>
                )}
                <CardTitle>{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
