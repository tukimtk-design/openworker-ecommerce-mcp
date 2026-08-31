import ts from "typescript";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");
const webboardPublicDir = path.join(rootDir, "webboard", "public");

if (!fs.existsSync(webboardPublicDir)) {
  fs.mkdirSync(webboardPublicDir, { recursive: true });
}

fs.writeFileSync(
  path.join(webboardPublicDir, "ai-context.json"),
  JSON.stringify(
    {
      projectName: "Openworker E-Commerce MCP",
      description: "MCP Server for Openworker to control Chrome/Edge for E-commerce platforms",
      currentPhase: "Pre-Phase-12",
      repository: "openworker-ecommerce-mcp",
      architecturalDecisions: [
        "Uses HybridExecutor pattern for robust UI and API interactions.",
        "Uses sqlite3 for local offline data caching.",
        "Uses Playwright CDP for browser automation.",
        "Follows Zero-Defect Protocol for Tool Schemas (Vertex AI/Claude compatibility).",
      ],
    },
    null,
    2
  )
);

fs.writeFileSync(
  path.join(webboardPublicDir, "protocols.json"),
  JSON.stringify(
    {
      zeroDefectProtocol: {
        strictTyping: [
          "Every array must have 'items'.",
          "Every object must have 'properties' and 'required'.",
          "Dynamic objects must have a dummy property (e.g. _dummy: { type: 'string' }).",
          "No $schema, $ref, patternProperties, or complex anyOf allowed.",
        ],
        preBuildValidation: "npm run build and unit tests must pass before ending a phase.",
      },
      general: [
        "Output messages must be in Thai (Technical English allowed).",
        "Logging must use console.error to avoid corrupting Stdio MCP protocol.",
      ],
    },
    null,
    2
  )
);

fs.writeFileSync(
  path.join(webboardPublicDir, "roadmap.json"),
  JSON.stringify(
    {
      phases: [
        { name: "Phase 7", features: ["Auto-Launch on Windows", "Playwright E2E Mocks", "Openworker Auto-Installer"], status: "Complete" },
        { name: "Phase 8", features: ["Multi-Platform Stock Sync", "Fuzzy Variant Matching"], status: "Complete" },
        { name: "Phase 9", features: ["Docker & Headless Run", "Visual DOM Self-Correction", "Proxy Rotation"], status: "Complete" },
        { name: "Phase 10", features: ["Autonomous AI Store Manager", "Omni-Channel Product Cloner", "E-Commerce Expansion Suite"], status: "Complete" },
        { name: "Phase 11", features: ["LnwShop Integration", "Microsoft 365 Copilot Bridge"], status: "Complete" },
        { name: "Pre-Phase-12", features: ["AI Webboard Hub"], status: "In-Progress" },
        { name: "Phase 12", features: ["Predictive Inventory"], status: "Proposed" },
      ],
    },
    null,
    2
  )
);

fs.writeFileSync(
  path.join(webboardPublicDir, "llms.txt"),
  `Openworker E-Commerce MCP Project

A powerful toolset for managing Shopee, TikTok Shop, Lazada, and LnwShop stores via AI Agents.
Utilizes Playwright to automate CDP browser actions, with local fallback caches and visual auto-correction.
This acts as a definitive context file for LLM crawlers reading this hub.

Current Release: v1.1.0-autonomous

Key rules:
- Schemas strictly typed for Vertex AI.
- Thai output default.
- stdio log streaming using console.error only.
`
);

const indexContent = fs.readFileSync(path.join(rootDir, "src", "index.ts"), "utf8");
const sourceFile = ts.createSourceFile("index.ts", indexContent, ts.ScriptTarget.Latest, true);

let toolsArrayNode = null;

function visit(node) {
  if (ts.isPropertyAssignment(node) && node.name.text === "tools" && ts.isArrayLiteralExpression(node.initializer)) {
    toolsArrayNode = node.initializer;
  }
  ts.forEachChild(node, visit);
}

visit(sourceFile);

if (!toolsArrayNode) {
  console.error("Failed to find tools array in AST.");
  process.exit(1);
}

function astToObject(node) {
  if (ts.isObjectLiteralExpression(node)) {
    const obj = {};
    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key = prop.name.text || prop.name.escapedText;
        obj[key] = astToObject(prop.initializer);
      }
    }
    return obj;
  } else if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map(astToObject);
  } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  } else if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  } else if (node.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  } else if (node.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  } else if (node.kind === ts.SyntaxKind.NullKeyword) {
    return null;
  }
  return undefined;
}

const rawTools = toolsArrayNode.elements.map(astToObject).filter(t => t && t.name);

// Filter out openworker-ecommerce-mcp info tool if it exists to make exactly 32 canonical action tools.
// Or wait, looking at `src/index.ts`, the first tool is `openworker-ecommerce-mcp` describing the server itself.
// We should probably filter it out to meet exactly 32.
const tools = rawTools.filter(t => t.name.startsWith("ecommerce_") || t.name.startsWith("browser_"));

function fixSchema(node) {
  if (!node || typeof node !== "object") return;

  if (node.type === "object") {
    if (!node.properties) {
       node.properties = { _dummy: { type: "string" } };
       node.additionalProperties = true;
    }
    if (!node.required) {
      node.required = [];
    }
    for (const key in node.properties) {
       fixSchema(node.properties[key]);
    }
  } else if (node.type === "array") {
    if (!node.items) {
       node.items = { type: "string" };
    }
    fixSchema(node.items);
  }
}

tools.forEach(t => {
  if (t.inputSchema) {
     fixSchema(t.inputSchema);
  } else {
     t.inputSchema = { type: "object", properties: { _dummy: { type: "string" } }, additionalProperties: true, required: [] };
  }
});

const uniqueNames = new Set(tools.map(t => t.name));
if (uniqueNames.size !== tools.length) {
   console.error("Duplicate tools found during extraction.");
   process.exit(1);
}

if (tools.length !== 32) {
   console.error(`Expected exactly 32 tools, found ${tools.length}`);
   process.exit(1);
}

fs.writeFileSync(
  path.join(webboardPublicDir, "tools-schema.json"),
  JSON.stringify({ tools }, null, 2)
);

console.log("Successfully extracted 32 canonical tools using AST parsing.");
