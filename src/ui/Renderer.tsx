"use client"

import { useState } from "react"
import { UI_REGISTRY } from "@/ui/registry"
import type { TPageSpec, TComponent } from "@/spec/ui-schemas"
import { ErrorBoundary } from "@/components/ErrorBoundary"

interface RendererProps {
  spec: TPageSpec
}

function ComponentRenderer({ component }: { component: TComponent }) {
  const [showRaw, setShowRaw] = useState(false)
  const Component = UI_REGISTRY[component.type as keyof typeof UI_REGISTRY]
  
  if (!Component) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`Unknown component type: ${component.type}`)
    }
    return null
  }
  
  // Handle different prop structures
  const props = component.props as any
  
  return (
    <div style={{ position: "relative" }}>
      {process.env.NODE_ENV === "development" && (
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
      )}
      {/* For components that expect children as a string prop */}
      {"children" in props && typeof props.children === "string" ? (
        <Component {...props}>{props.children}</Component>
      ) : (
        /* For composed patterns (Hero, FeatureGrid, Testimonial) that expect props directly */
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
  )
}

export function Renderer({ spec }: RendererProps) {
  return (
    <>
      {spec.blocks.map((block, index) => (
        <ErrorBoundary key={index}>
          <ComponentRenderer component={block} />
        </ErrorBoundary>
      ))}
    </>
  )
}
