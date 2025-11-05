import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Renderer } from "@/ui/Renderer"
import type { TPageSpec } from "@/spec/ui-schemas"

interface RenderSurfaceProps {
  spec: TPageSpec | null
  loading: boolean
  error: string | null
}

export function RenderSurface({ spec, loading, error }: RenderSurfaceProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Generation failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!spec) return null

  return <Renderer spec={spec} />
}
