import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetPath = path.join(__dirname, '..', 'webboard', 'public', 'tools-schema.json');

if (!fs.existsSync(targetPath)) {
  console.error(`[VALIDATION ERROR] Cannot find tools-schema.json at: ${targetPath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
const tools = data.tools;

if (!Array.isArray(tools)) {
  console.error(`[VALIDATION ERROR] 'tools' in tools-schema.json is not an array`);
  process.exit(1);
}

if (tools.length !== 32) {
  console.error(`[VALIDATION ERROR] Expected exactly 32 canonical tools, got ${tools.length}`);
  process.exit(1);
}

const toolNames = new Set();
let violations = 0;

const checkNode = (node, path) => {
  if (!node || typeof node !== 'object') return;

  if (node.type === 'array' && !node.items) {
    console.error(`[VIOLATION] Array at "${path}" is missing "items"`);
    violations++;
  }

  if (node.type === 'object') {
    if (!node.properties) {
      console.error(`[VIOLATION] Object at "${path}" is missing "properties"`);
      violations++;
    }

    if (node.required !== undefined && !Array.isArray(node.required)) {
      console.error(`[VIOLATION] Object at "${path}" has invalid "required" (must be an array)`);
      violations++;
    }

    if (
      (node.additionalProperties === true || typeof node.additionalProperties === 'object') &&
      (!node.properties || !node.properties['_dummy'])
    ) {
      console.error(`[VIOLATION] Dynamic object at "${path}" is missing "_dummy" property`);
      violations++;
    }
  }

  if (node['$schema']) {
    console.error(`[VIOLATION] Node at "${path}" contains prohibited "$schema"`);
    violations++;
  }
  if (node['$ref']) {
    console.error(`[VIOLATION] Node at "${path}" contains prohibited "$ref"`);
    violations++;
  }
  if (node.patternProperties) {
    console.error(`[VIOLATION] Node at "${path}" contains prohibited "patternProperties"`);
    violations++;
  }
  if (node.anyOf || node.allOf || node.oneOf) {
    console.error(`[VIOLATION] Node at "${path}" contains prohibited complex logic (anyOf/allOf/oneOf)`);
    violations++;
  }

  if (node.properties && typeof node.properties === 'object') {
    Object.keys(node.properties).forEach(k => checkNode(node.properties[k], `${path}.${k}`));
  }
  if (node.items) {
    if (Array.isArray(node.items)) {
      node.items.forEach((item, i) => checkNode(item, `${path}[items][${i}]`));
    } else {
      checkNode(node.items, `${path}[items]`);
    }
  }
};

tools.forEach((t, idx) => {
  if (!t.name || typeof t.name !== 'string') {
    console.error(`[VIOLATION] Tool at index ${idx} is missing a valid name string`);
    violations++;
    return;
  }

  if (toolNames.has(t.name)) {
    console.error(`[VIOLATION] Duplicate tool name detected: "${t.name}"`);
    violations++;
  }
  toolNames.add(t.name);

  if (
    !t.name.startsWith('ecommerce_') &&
    !t.name.startsWith('browser_')
  ) {
    console.error(`[VIOLATION] Invalid tool namespace prefix for: "${t.name}"`);
    violations++;
  }

  if (!t.description || typeof t.description !== 'string') {
    console.error(`[VIOLATION] Tool "${t.name}" is missing a description`);
    violations++;
  }

  if (!t.inputSchema || typeof t.inputSchema !== 'object') {
    console.error(`[VIOLATION] Tool "${t.name}" is missing a valid inputSchema object`);
    violations++;
  } else {
    checkNode(t.inputSchema, t.name);
  }
});

if (violations > 0) {
  console.error(`\nValidation Failed with ${violations} Zero-Defect Violations.`);
  process.exit(1);
}

console.log("Extracted schema passed Zero-Defect recursive validation (100% Strict).");
