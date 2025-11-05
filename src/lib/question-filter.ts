/**
 * Pre-filter to quickly reject irrelevant questions before calling the model.
 * This saves tokens and guarantees behavior even if the model drifts.
 */

const CHARLES_KEYWORDS = [
  "charles",
  "pfaff",
  "fridgepal",
  "catalyst",
  "make noise",
  "portfolio",
  "resume",
  "case study",
  "project",
  "design system",
  "react",
  "typescript",
  "tailwind",
  "supabase",
  "storybook",
  "figma",
  "framer",
  "creative technologist",
  "front-end engineer",
  "ux engineer",
  "richmond",
  "virginia",
]

const OFF_TOPIC_PATTERNS = [
  /^how (do|can|would) i/,
  /^what('s| is) the weather/,
  /^who won/,
  /^tell me about (apple|microsoft|google|amazon|meta)/,
  /^how (to|do you) make/,
  /recipe/,
  /cooking/,
  /baking/,
  /chocolate chip cookies/,
  /election/,
  /politics/,
  /sports/,
  /movie/,
  /music (artist|album|song)/,
]

export interface FilterResult {
  relevant: boolean
  reason?: string
}

export function filterQuestion(question: string): FilterResult {
  const normalized = question.toLowerCase().trim()

  // Check for off-topic patterns first
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        relevant: false,
        reason: "Question matches off-topic pattern",
      }
    }
  }

  // Check for Charles-related keywords
  const hasKeyword = CHARLES_KEYWORDS.some((keyword) =>
    normalized.includes(keyword)
  )

  if (hasKeyword) {
    return { relevant: true }
  }

  // Questions that are clearly about a person (might be Charles)
  const personPatterns = [
    /^(what|who|where|when|how) (is|are|was|were|does|did|can|will)/,
    /^(tell me|describe|explain) (about|more about)/,
  ]

  const looksLikePersonQuery = personPatterns.some((pattern) =>
    pattern.test(normalized)
  )

  if (looksLikePersonQuery && normalized.length < 100) {
    // Give benefit of the doubt for short questions
    return { relevant: true }
  }

  // Default: reject if no clear connection
  return {
    relevant: false,
    reason: "No clear connection to Charles Pfaff or his work",
  }
}
