import fs from "fs"
import path from "path"

interface RulesBundle {
  orchestrator: string
  copywriter: string
  lastModified: number
}

let cachedRules: RulesBundle | null = null
let lastCheckTime = 0
const CHECK_INTERVAL = process.env.NODE_ENV === "development" ? 1000 : 60000 // 1s in dev, 1min in prod

function getRulesPath(fileName: string): string {
  return path.join(process.cwd(), "rules", fileName)
}

function readRulesFile(fileName: string): string {
  const filePath = getRulesPath(fileName)
  try {
    return fs.readFileSync(filePath, "utf-8")
  } catch (error) {
    throw new Error(`Failed to read rules file ${fileName}: ${error}`)
  }
}

function shouldReload(): boolean {
  if (!cachedRules) return true
  if (process.env.NODE_ENV !== "development") return false

  const now = Date.now()
  if (now - lastCheckTime < CHECK_INTERVAL) return false

  lastCheckTime = now

  // Check if files have been modified
  try {
    const orchestratorPath = getRulesPath("orchestrator-agent.md")
    const copywriterPath = getRulesPath("copywriter-agent.md")
    const orchestratorStats = fs.statSync(orchestratorPath)
    const copywriterStats = fs.statSync(copywriterPath)
    const maxModified = Math.max(orchestratorStats.mtimeMs, copywriterStats.mtimeMs)

    return maxModified > cachedRules.lastModified
  } catch {
    return false
  }
}

export function loadRules(): RulesBundle {
  if (cachedRules && !shouldReload()) {
    return cachedRules
  }

  const orchestrator = readRulesFile("orchestrator-agent.md")
  const copywriter = readRulesFile("copywriter-agent.md")

  cachedRules = {
    orchestrator,
    copywriter,
    lastModified: Date.now(),
  }

  return cachedRules
}

export function getRulesBundle(): { orchestrator: string; copywriter: string } {
  const bundle = loadRules()
  return {
    orchestrator: bundle.orchestrator,
    copywriter: bundle.copywriter,
  }
}
