import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetPath = path.join(__dirname, '..', 'webboard', 'public', 'tools-schema.json');

const data = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
const tools = data.tools;

if (tools.length !== 32) {
    console.error(`Validation Failed: Expected exactly 32 canonical tools, got ${tools.length}`);
    process.exit(1);
}

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
        if (!node.required) {
            console.error(`[VIOLATION] Object at "${path}" is missing "required"`);
            violations++;
        }
        if (node.additionalProperties === true && node.properties && !node.properties['_dummy'] && Object.keys(node.properties).length === 0) {
            console.error(`[VIOLATION] Dynamic object at "${path}" is missing "_dummy" property`);
            violations++;
        }
    }

    if (node['$schema']) { console.error(`[VIOLATION] Node at "${path}" contains "$schema"`); violations++; }
    if (node['$ref']) { console.error(`[VIOLATION] Node at "${path}" contains "$ref"`); violations++; }
    if (node.patternProperties) { console.error(`[VIOLATION] Node at "${path}" contains "patternProperties"`); violations++; }
    if (node.anyOf || node.allOf || node.oneOf) { console.error(`[VIOLATION] Node at "${path}" contains complex logic`); violations++; }

    if (node.properties) {
        Object.keys(node.properties).forEach(k => checkNode(node.properties[k], `${path}.${k}`));
    }
    if (node.items) {
        checkNode(node.items, `${path}[items]`);
    }
};

tools.forEach(t => {
    if (!t.name.startsWith("ecommerce_") && t.name !== "browser_attach_existing" && t.name !== "browser_detect_challenge") {
        console.error(`[VIOLATION] Invalid legacy namespace exception for tool: ${t.name}`);
        violations++;
    }
    checkNode(t.inputSchema, t.name);
});

if (violations > 0) {
    console.error(`\nValidation Failed with ${violations} Zero-Defect Violations.`);
    process.exit(1);
}

console.log("Extracted schema passed Zero-Defect recursive validation (100% Strict).");
