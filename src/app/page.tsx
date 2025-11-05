"use client"

import { useState, useRef } from "react"
import { QueryForm } from "@/components/ui/query-form"
import { RenderSurface } from "@/components/render-surface"
import { Separator } from "@/components/ui/separator"
import { generateFromPrompt } from "@/lib/actions/generate"
import type { TPageSpec } from "@/spec/ui-schemas"

export default function Home() {
  const [spec, setSpec] = useState<TPageSpec | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reqRef = useRef<string | null>(null)

  async function handleSubmit(prompt: string) {
    setError(null)
    setLoading(true)
    setSpec(null) // clear previous content so we never show multiple pages

    const thisReq = crypto.randomUUID()
    reqRef.current = thisReq

    try {
      const next = await generateFromPrompt(prompt)
      if (reqRef.current === thisReq) {
        setSpec(next)
      }
    } catch (e: any) {
      if (reqRef.current === thisReq) {
        setError(e?.message ?? "Failed to generate")
      }
    } finally {
      if (reqRef.current === thisReq) {
        setLoading(false)
      }
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-6">
      <QueryForm onSubmit={handleSubmit} disabled={loading} />
      <Separator className="border-muted" />
      <RenderSurface spec={spec} loading={loading} error={error} />
    </div>
  )
}
