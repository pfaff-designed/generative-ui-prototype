"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Loader2 } from "lucide-react"
import { TPageSpec } from "@/spec/ui-schemas"
import { Renderer } from "@/ui/Renderer"

interface Message {
  id: string
  content: string
  timestamp: Date
  type: "user" | "response"
  pageSpec?: TPageSpec
  error?: string
}

export function ChatInterface() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      timestamp: new Date(),
      type: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    const prompt = input.trim()
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate page")
      }

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: prompt,
        timestamp: new Date(),
        type: "response",
        pageSpec: data.data,
      }

      setMessages((prev) => [...prev, responseMessage])
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: prompt,
        timestamp: new Date(),
        type: "response",
        error: err instanceof Error ? err.message : "An error occurred",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
        <CardTitle>Generative UI Prototype</CardTitle>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="p-0 flex-1">
        <div className="flex flex-col h-full">
          {/* Messages area */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Describe the page you want to generate. Press Enter to generate.
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    {/* User message */}
                    {message.type === "user" && (
                      <div className="flex flex-col space-y-1">
                        <div className="flex justify-end">
                          <div className="max-w-[80%] rounded-lg bg-primary text-primary-foreground p-3">
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground text-right">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    )}

                    {/* Response with page spec */}
                    {message.type === "response" && message.pageSpec && (
                      <div className="space-y-2">
                        <div className="rounded-lg border p-4">
                          <Renderer spec={message.pageSpec} />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    )}

                    {/* Error response */}
                    {message.type === "response" && message.error && (
                      <div className="space-y-2">
                        <Alert variant="destructive">
                          <AlertDescription>{message.error}</AlertDescription>
                        </Alert>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Generating your page...</span>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <Separator />

          {/* Input area */}
          <div className="p-4 space-y-2">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the page you want to generate..."
                className="flex-1"
                disabled={loading}
              />
              {input && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  className="shrink-0"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Press Enter to generate, Shift+Enter for new line
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
