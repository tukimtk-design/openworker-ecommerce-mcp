import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories
const rootDir = path.join(__dirname, '..');
const webboardPublicDir = path.join(rootDir, 'webboard', 'public');

if (!fs.existsSync(webboardPublicDir)) {
  fs.mkdirSync(webboardPublicDir, { recursive: true });
}

// ... (other json files generation is same and works fine)

// For tools, let's parse character by character to find the tool objects safely.
const indexContent = fs.readFileSync(path.join(rootDir, 'src', 'index.ts'), 'utf8');

const tools = [];

const listStartIndex = indexContent.indexOf('tools: [');
if (listStartIndex !== -1) {
    let openBrackets = 0;
    let listEndIndex = -1;
    for (let i = listStartIndex + 7; i < indexContent.length; i++) {
        if (indexContent[i] === '[') openBrackets++;
        if (indexContent[i] === ']') {
            openBrackets--;
            if (openBrackets === 0) {
                listEndIndex = i;
                break;
            }
        }
    }

    if (listEndIndex !== -1) {
        const toolsListStr = indexContent.substring(listStartIndex + 7, listEndIndex + 1);

        // Use a dirty evaluation to extract the whole array
        try {
            // we have to replace things that aren't defined in the scope, but they seem to be plain objects.
            const parsedTools = (new Function(`return ${toolsListStr}`))();
            tools.push(...parsedTools);
            console.log(`Successfully extracted ${tools.length} tools to tools-schema.json using eval.`);
        } catch (e) {
            console.error("Eval failed for the entire array:", e.message);
            // Fallback: simple string splitting for the UI
            const fallbackTools = [];
            let inBlock = false;
            let blockStr = "";
            let braces = 0;

            for (let i = 0; i < toolsListStr.length; i++) {
                if (toolsListStr[i] === '{') {
                    if (braces === 0) inBlock = true;
                    braces++;
                }
                if (inBlock) {
                    blockStr += toolsListStr[i];
                }
                if (toolsListStr[i] === '}') {
                    braces--;
                    if (braces === 0) {
                        inBlock = false;

                        try {
                           const t = (new Function(`return ${blockStr}`))();
                           fallbackTools.push(t);
                        } catch(err) {
                           console.error("Failed to parse tool block.");
                        }

                        blockStr = "";
                    }
                }
            }
            tools.push(...fallbackTools);
            console.log(`Successfully extracted ${tools.length} tools to tools-schema.json using fallback parser.`);
        }
    }
}

fs.writeFileSync(path.join(webboardPublicDir, 'tools-schema.json'), JSON.stringify({ tools }, null, 2));
