"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface QueryFormProps {
  onSubmit: (value: string) => void
  disabled?: boolean
}

export function QueryForm({ onSubmit, disabled = false }: QueryFormProps) {
  const [value, setValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim().length === 0 || disabled) return
    onSubmit(value.trim())
    setValue("")
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <Input
        placeholder="Describe the page you want…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        className="flex-1"
      />
      <Button type="submit" disabled={!value.trim() || disabled}>
        Submit
      </Button>
    </form>
  )
}
