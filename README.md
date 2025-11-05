# Generative UI Prototype

Prompt → JSON UI spec (+ text content) → React render.

This prototype demonstrates a safe, typed path from LLM output to live UI using a small, boring stack.

## Stack

- **Next.js (App Router)**, **React**, **TypeScript**
- **Tailwind CSS**
- **Anthropic SDK**
- **Zod** for runtime schema validation + TS types
- **ESLint + Prettier**
- Deploy: **Vercel**

> Intentional omissions for MVP: no Zustand, no React Query, no Storybook. Add only if needed.

## Core Idea

The model returns a **PageSpec** (JSON) that lists allowed components with their props (including all **text content**). We validate that JSON with Zod, then render a whitelist of React components.

## Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Set up environment variables
Create a `.env.local` file in the root directory:
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3) Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4) Build for production
```bash
npm run build
npm start
```

## Deployment to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository in [Vercel](https://vercel.com)
3. Add the `ANTHROPIC_API_KEY` environment variable in Vercel project settings
4. Deploy

Vercel will automatically detect Next.js and configure the build settings.

## Project Structure

```
/src
  /app
    page.tsx                    # Main landing page with prompt input
    layout.tsx                  # Root layout
    api
      /generate
        route.ts                # POST endpoint: prompt → AI → validated PageSpec
  /components
    /blocks
      Hero.tsx                  # Hero block component
      FeatureGrid.tsx           # Feature grid component
      Testimonial.tsx           # Testimonial component
    BlockRenderer.tsx           # Maps block type → component
    ErrorBoundary.tsx           # Error handling for invalid blocks
  /spec
    pageSpec.ts                 # Zod schema + TypeScript types
  /lib
    ai-client.ts                # Anthropic SDK wrapper with rate limits & token caps
    validation.ts               # Zod validation helpers
```

## Features

- **Type-safe schema validation**: All AI outputs are validated with Zod schemas
- **Whitelisted components**: Only approved component types can be rendered
- **Safe rendering**: No HTML injection - all content is rendered as text
- **Error handling**: Graceful error states for invalid schemas, API failures, and network errors
- **Accessible UI**: Semantic HTML, focus states, and WCAG-aware color contrast
- **Responsive design**: Mobile-first approach with Tailwind CSS