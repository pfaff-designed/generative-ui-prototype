"use client"

import { useState, useEffect } from "react"
import { TPageSpec } from "@/spec/pageSpec"
import { BlockRenderer } from "@/components/BlockRenderer"

const PRESETS = [
  "Create a marketing landing page with a hero section and feature grid",
  "Generate a product features page with testimonials",
  "Build a simple landing page with hero and testimonial",
]

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageSpec, setPageSpec] = useState<TPageSpec | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate page")
      }

      setPageSpec(data.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setPageSpec(null)
    } finally {
      setLoading(false)
    }
  }

  const handlePresetClick = (preset: string) => {
    setPrompt(preset)
  }

  // Apply theme from pageSpec
  useEffect(() => {
    if (pageSpec?.theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    return () => {
      document.documentElement.classList.remove("dark")
    }
  }, [pageSpec])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header / Prompt Section */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Generative UI Prototype
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="prompt" className="sr-only">
                Enter your prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the page you want to generate..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? "Generating..." : "Generate Page"}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}
          </form>

          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Quick presets:
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {preset.substring(0, 40)}...
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generated Content */}
      {loading && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Generating your page...</p>
        </div>
      )}

      {pageSpec && !loading && (
        <main>
          {pageSpec.blocks.map((block, index) => (
            <BlockRenderer key={index} block={block} />
          ))}
        </main>
      )}

      {!pageSpec && !loading && !error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Enter a prompt above to generate a page layout
          </p>
        </div>
      )}
    </div>
  )
}
