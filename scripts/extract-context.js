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

// 1. ai-context.json
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
  ) + "\n"
);

// 2. protocols.json
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
  ) + "\n"
);

// 3. roadmap.json
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
  ) + "\n"
);

// 4. llms.txt
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

// 5. tools-schema.json (Extracted canonically from src/index.ts AST without semantic mutation)
const indexFilePath = path.join(rootDir, "src", "index.ts");
if (!fs.existsSync(indexFilePath)) {
  console.error(`[AST Extraction Error] Cannot find src/index.ts at ${indexFilePath}`);
  process.exit(1);
}

const indexContent = fs.readFileSync(indexFilePath, "utf8");
const sourceFile = ts.createSourceFile("index.ts", indexContent, ts.ScriptTarget.Latest, true);

let toolsArrayNode = null;

function visit(node) {
  if (
    ts.isPropertyAssignment(node) &&
    (node.name.text === "tools" || node.name.escapedText === "tools") &&
    ts.isArrayLiteralExpression(node.initializer)
  ) {
    toolsArrayNode = node.initializer;
  }
  ts.forEachChild(node, visit);
}

visit(sourceFile);

if (!toolsArrayNode) {
  console.error("[AST Extraction Error] Failed to find tools array in src/index.ts AST.");
  process.exit(1);
}

function astToObject(node, currentToolName = "<unknown>", currentPath = "root") {
  if (!node) return undefined;

  if (ts.isObjectLiteralExpression(node)) {
    const obj = {};
    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key = prop.name.text || prop.name.escapedText || prop.name.getText();
        obj[key] = astToObject(prop.initializer, currentToolName, `${currentPath}.${key}`);
      } else if (ts.isShorthandPropertyAssignment(prop)) {
        const key = prop.name.text || prop.name.escapedText || prop.name.getText();
        obj[key] = prop.name.text;
      } else {
        const kindName = ts.SyntaxKind[prop.kind] || String(prop.kind);
        console.error(
          `[AST Extraction Error] Unsupported property kind '${kindName}' at Tool: '${currentToolName}', Path: '${currentPath}'`
        );
        process.exit(1);
      }
    }
    return obj;
  }

  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((elem, idx) =>
      astToObject(elem, currentToolName, `${currentPath}[${idx}]`)
    );
  }

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  }

  if (ts.isPrefixUnaryExpression(node)) {
    if (node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(node.operand)) {
      return -Number(node.operand.text);
    }
    if (node.operator === ts.SyntaxKind.PlusToken && ts.isNumericLiteral(node.operand)) {
      return Number(node.operand.text);
    }
  }

  if (node.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }

  if (node.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }

  if (node.kind === ts.SyntaxKind.NullKeyword) {
    return null;
  }

  if (ts.isIdentifier(node)) {
    if (node.text === "undefined") {
      return undefined;
    }
  }

  const kindName = ts.SyntaxKind[node.kind] || String(node.kind);
  console.error(
    `[AST Extraction Error] Unsupported AST node kind '${kindName}' (${node.kind}) at Tool: '${currentToolName}', Path: '${currentPath}'`
  );
  process.exit(1);
}

const tools = toolsArrayNode.elements.map((toolElem, idx) => {
  if (!ts.isObjectLiteralExpression(toolElem)) {
    console.error(`[AST Extraction Error] Expected ObjectLiteralExpression in tools array at index ${idx}`);
    process.exit(1);
  }

  let toolName = `<tool_${idx}>`;
  for (const prop of toolElem.properties) {
    if (ts.isPropertyAssignment(prop)) {
      const key = prop.name.text || prop.name.escapedText || prop.name.getText();
      if (
        key === "name" &&
        (ts.isStringLiteral(prop.initializer) || ts.isNoSubstitutionTemplateLiteral(prop.initializer))
      ) {
        toolName = prop.initializer.text;
        break;
      }
    }
  }

  return astToObject(toolElem, toolName, toolName);
});

if (tools.length === 0) {
  console.error(`Expected non-zero tools, found 0`);
  process.exit(1);
}

const seenNames = new Set();
for (const tool of tools) {
  if (!tool.name) {
    console.error(`[AST Extraction Error] Found tool without a name: ${JSON.stringify(tool)}`);
    process.exit(1);
  }
  if (seenNames.has(tool.name)) {
    console.error(`[AST Extraction Error] Duplicate tool name detected: '${tool.name}'`);
    process.exit(1);
  }
  seenNames.add(tool.name);
}

fs.writeFileSync(
  path.join(webboardPublicDir, "tools-schema.json"),
  JSON.stringify({ tools }, null, 2) + "\n"
);

console.log(`Successfully extracted ${tools.length} canonical tools using safe AST parsing without mutation.`);
