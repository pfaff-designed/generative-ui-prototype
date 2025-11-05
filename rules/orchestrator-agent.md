# Orchestrator Agent — System Prompt

## Role
You transform a page intent and copy payload into a render plan. You choose components and produce STRICT JSON the UI can render. You never produce prose.

## Inputs
- **intent**: A short description of the page to render.
- **copy**: The Copywriter JSON payload (meta, sections, assets).
- **component_catalog**: List of available components and prop schemas.
- **guardrails**: Governance rules (on-topic Charles-only scope + refusal message).

## Output Schema (STRICT JSON ONLY)
{
  "route": "/string",                         // suggested pathname
  "components": [
    {
      "type": "Hero",                         // must exist in catalog
      "props": {
        "eyebrow": "string?",
        "headline": "string",
        "subhead": "string?",
        "cta": { "label": "string", "href": "string?" }
      },
      "from": "sections.hero"                 // traceability
    },
    {
      "type": "FeatureGrid",
      "props": {
        "items": [
          { "title": "string", "desc": "string" }
        ]
      },
      "from": "sections.work"
    }
  ],
  "used_copy_keys": ["meta", "sections.hero", "sections.work"],
  "notes": "string"                           // optional implementation hints for dev
}

## Rules
- Output valid JSON only. No comments, no code fences.
- Use only known components from the catalog. If unavailable, choose the closest fallback and state so in "notes".
- Prefer referencing `copy.sections[*].content` fields directly into component props.
- If the intent or copy is out-of-scope per guardrails, return:
  {"error":"OUT_OF_SCOPE","message":"Sorry, I can only answer questions about Charles Pfaff and his work."}

(data/charles-static.json)
{
  "bio": {
    "name": "Charles Pfaff",
    "title": "Creative Technologist & Front‑End Engineer",
    "location": "Richmond, VA",
    "summary": "I bridge design and engineering to craft human‑centered, performant experiences. I build thoughtful interfaces, design systems, and AI‑assisted workflows.",
    "email": "hello@pfaff.design",
    "site": "https://pfaff.design"
  },
  "skills": {
    "engineering": ["React", "TypeScript", "Next.js", "Node.js", "Tailwind CSS", "Storybook", "Supabase", "Postmark", "GSAP"],
    "design": ["Figma", "Framer", "Design Systems", "Prototyping", "Accessibility"],
    "other": ["UX Writing", "Prompt Design", "CI/CD", "Testing (Jest)"]
  },
  "caseStudies": {
    "fridgepal": {
      "name": "FridgePal",
      "summary": "Smart grocery & meal planning with AI receipt parsing and Supabase.",
      "highlights": ["Email parsing of Instacart receipts", "Feature‑based React architecture", "Supabase Edge Functions for notifications"]
    },
    "catalyst": {
      "name": "Catalyst Design System",
      "summary": "Token‑driven React + Tailwind component library documented in Storybook.",
      "highlights": ["Radix UI primitives", "CVA token patterns", "Theming via CSS variables"]
    },
    "makeNoise": {
      "name": "Make Noise",
      "summary": "Personal brand + portfolio blending music, art, and tech.",
      "highlights": ["Editorial layout", "Simple color system", "Fast iteration workflow"]
    }
  },
  "experience": [
    { "role": "UX Engineer / Front‑End", "org": "Agencies & Startups", "summary": "Bridged design systems and app delivery across teams." }
  ],
  "testimonials": [
    { "author": "Design Lead", "quote": "Charles bridges aesthetics and engineering with rare clarity." },
    { "author": "PM", "quote": "He ships clean, reliable interfaces—fast." }
  ],
  "links": {
    "github": "https://github.com/charlespfaff",
    "linkedin": "https://www.linkedin.com/in/charlespfaff/"
  }
}

(src/lib/promptLoader.ts)
import fs from "node:fs";
import path from "node:path";

export type CopywriterData = {
  bio: any;
  skills: any;
  caseStudies: any;
  experience: any[];
  testimonials: any[];
  links: any;
};

export function loadCopywriterPrompt(): string {
  return fs.readFileSync(path.join(process.cwd(), "prompts", "copywriter.system.md"), "utf8");
}

export function loadOrchestratorPrompt(): string {
  return fs.readFileSync(path.join(process.cwd(), "prompts", "orchestrator.system.md"), "utf8");
}

export function loadStaticData(): CopywriterData {
  const raw = fs.readFileSync(path.join(process.cwd(), "data", "charles-static.json"), "utf8");
  return JSON.parse(raw);
}

(src/lib/componentCatalog.ts)
export const COMPONENT_CATALOG = {
  Hero: {
    props: ["eyebrow?", "headline", "subhead?", "cta?"]
  },
  FeatureGrid: {
    props: ["items[]: {title, desc}"]
  },
  Testimonial: {
    props: ["quote", "author"]
  }
} as const;

(src/app/api/copywriter/route.ts)
import { NextRequest, NextResponse } from "next/server";
import { loadCopywriterPrompt, loadStaticData } from "@/lib/promptLoader";

export async function POST(req: NextRequest) {
  const { brief, style } = await req.json();
  const system = loadCopywriterPrompt();
  const staticData = loadStaticData();

  // TODO: Call your model with {system, brief, staticData, style}
  // For now return a mocked, schema-correct payload to unblock UI work.
  const json = {
    meta: {
      title: "Charles Pfaff — Creative Technologist",
      description: "Front‑end engineer and creative technologist in Richmond, VA."
    },
    sections: [
      {
        key: "hero",
        purpose: "Introduce Charles and value prop",
        content: {
          headline: "Creative Technologist crafting human‑centered interfaces",
          subhead: "I bridge design and code to ship reliable, expressive products.",
          body: "",
          bullets: [],
          cta: { label: "View Work", href: "/work" }
        },
        source: ["static.bio"]
      }
    ],
    assets: []
  };

  return NextResponse.json(json);
}

(src/app/api/orchestrate/route.ts)
import { NextRequest, NextResponse } from "next/server";
import { loadOrchestratorPrompt } from "@/lib/promptLoader";
import { COMPONENT_CATALOG } from "@/lib/componentCatalog";

export async function POST(req: NextRequest) {
  const { intent, copy } = await req.json();
  const system = loadOrchestratorPrompt();
  const catalog = COMPONENT_CATALOG;

  // TODO: Call your model with {system, intent, copy, catalog}
  // Return a mocked render plan to unblock UI wiring.
  const plan = {
    route: "/",
    components: [
      {
        type: "Hero",
        props: {
          eyebrow: "Creative Technologist",
          headline: copy?.sections?.find((s: any) => s.key === "hero")?.content?.headline ?? "Charles Pfaff",
          subhead: copy?.sections?.find((s: any) => s.key === "hero")?.content?.subhead ?? "",
          cta: { label: "View Work", href: "/work" }
        },
        from: "sections.hero"
      }
    ],
    used_copy_keys: ["meta", "sections.hero"],
    notes: "Planned with mocked orchestrator. Replace with model call."
  };

  return NextResponse.json(plan);
}