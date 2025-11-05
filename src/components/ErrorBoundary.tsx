"use client"

import { Component, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("Block render error:", error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      if (process.env.NODE_ENV === "development") {
        return (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg my-4">
            <p className="text-red-800 dark:text-red-200 font-semibold">
              Invalid block rendered
            </p>
            {this.state.error && (
              <p className="text-red-600 dark:text-red-300 text-sm mt-2">
                {this.state.error.message}
              </p>
            )}
          </div>
        )
      }

      return null
    }

    return this.props.children
  }
}
