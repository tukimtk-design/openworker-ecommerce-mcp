# AI Living Webboard & Knowledge Hub

The central knowledge hub (Single Source of Truth) for the Openworker E-Commerce MCP project.
Designed to act as a definitive reference for human developers and AI Agents (Jules, Claude, Gemini).

## Features

- **AI Endpoints**: Exposes `/ai-context.json`, `/tools-schema.json`, and `/protocols.json` for zero-loss context sharing.
- **Interactive MCP Tools Explorer**: Search and view strict schemas for 32+ tools.
- **Zero-Defect Linter**: Automatically validate JSON Schemas against Vertex AI requirements.
- **Prompt Dispatcher**: Quick copy templates for Controller and Developer AI.

## Getting Started

### Local Development

1. \`npm run webboard:dev\`
   Starts the Vite development server.
2. \`npm run webboard:serve\`
   Serves the production build locally.

### Building & Deploying

To build the static webboard:

\`\`\`bash
npm run webboard:build
\`\`\`

The compiled static assets will be located in the \`webboard/dist/\` directory, ready to be deployed to GitHub Pages, Vercel, or any static hosting service.
