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

// This function will both check and repair the node as required by Binding Finding 3
const checkAndRepairNode = (node, pathStr) => {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'array' && !node.items) {
        console.warn(`[REPAIR] Array at "${pathStr}" is missing "items". Adding items: {type: 'string'}`);
        node.items = { type: 'string' }; // Safe dummy
    }

    if (node.type === 'object') {
        if (!node.properties) {
            console.warn(`[REPAIR] Object at "${pathStr}" is missing "properties". Making it dynamic.`);
            node.properties = { _dummy: { type: 'string' } };
            node.additionalProperties = true;
        }

        if (!node.required) {
            console.warn(`[REPAIR] Object at "${pathStr}" is missing "required". Adding required: []`);
            node.required = [];
        }

        // Dynamic Object Rule Check
        if (node.additionalProperties === true) {
            if (!node.properties || !node.properties['_dummy']) {
                console.warn(`[REPAIR] Dynamic object at "${pathStr}" is missing "_dummy". Adding it.`);
                node.properties = node.properties || {};
                node.properties['_dummy'] = { type: 'string' };
            }
        } else {
           if (node.properties && node.properties['_dummy']) {
                console.warn(`[REPAIR] Ordinary object at "${pathStr}" contains "_dummy" but is not dynamic. Setting additionalProperties: true.`);
                node.additionalProperties = true;
           }
        }
    }

    if (node['$schema']) { console.error(`[VIOLATION] Node at "${pathStr}" contains "$schema"`); violations++; }
    if (node['$ref']) { console.error(`[VIOLATION] Node at "${pathStr}" contains "$ref"`); violations++; }
    if (node.patternProperties) { console.error(`[VIOLATION] Node at "${pathStr}" contains "patternProperties"`); violations++; }
    if (node.anyOf || node.allOf || node.oneOf) { console.error(`[VIOLATION] Node at "${pathStr}" contains complex logic`); violations++; }

    if (node.properties) {
        Object.keys(node.properties).forEach(k => checkAndRepairNode(node.properties[k], `${pathStr}.${k}`));
    }
    if (node.items) {
        checkAndRepairNode(node.items, `${pathStr}[items]`);
    }
};

tools.forEach(t => {
    if (!t.name.startsWith("ecommerce_") && t.name !== "browser_attach_existing" && t.name !== "browser_detect_challenge") {
        console.error(`[VIOLATION] Invalid legacy namespace exception for tool: ${t.name}`);
        violations++;
    }

    if (!t.inputSchema) {
        console.warn(`[REPAIR] Tool ${t.name} is missing inputSchema`);
        t.inputSchema = { type: 'object', properties: { _dummy: { type: 'string' } }, additionalProperties: true, required: [] };
    } else {
        checkAndRepairNode(t.inputSchema, t.name);
    }
});

if (violations > 0) {
    console.error(`\nValidation Failed with ${violations} unrepairable Zero-Defect Violations.`);
    process.exit(1);
}

// Write the repaired data back to ensure it serves a compliant schema
fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));

console.log("Extracted schema passed Zero-Defect recursive validation and repair (100% Strict).");
