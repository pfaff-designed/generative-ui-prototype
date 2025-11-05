import { useState } from "react"
import { TComponent } from "@/spec/ui-schemas"
import { UI_REGISTRY } from "@/ui/registry"
import { ErrorBoundary } from "./ErrorBoundary"

interface BlockRendererProps {
  component: TComponent
}

export function BlockRenderer({ component }: BlockRendererProps) {
  const [showRaw, setShowRaw] = useState(false)
  const Component = UI_REGISTRY[component.type as keyof typeof UI_REGISTRY]

  if (!Component) {
    return null
  }

  const props = component.props as any

  return (
    <ErrorBoundary>
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowRaw((s) => !s)}
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            fontSize: 12,
            background: "#eee",
            border: "1px solid #ccc",
            borderRadius: 4,
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          {showRaw ? "Hide JSON" : "Show JSON"}
        </button>
        {"children" in props && typeof props.children === "string" ? (
          <Component {...props}>{props.children}</Component>
        ) : (
          <Component {...props} />
        )}
        {showRaw && (
          <pre
            style={{
              background: "#f6f8fa",
              padding: "1rem",
              fontSize: 12,
              overflowX: "auto",
              marginTop: "1rem",
              border: "1px solid #ddd",
            }}
          >
            {JSON.stringify(component, null, 2)}
          </pre>
        )}
      </div>
    </ErrorBoundary>
  )
}