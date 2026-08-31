import { useState } from 'react';
import { ShieldAlert, ShieldCheck, TerminalSquare } from 'lucide-react';

export const ZeroDefectLinter = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [result, setResult] = useState<{valid: boolean, messages: string[]} | null>(null);

  const validateSchema = () => {
    try {
      if (!jsonInput.trim()) {
        setResult({ valid: false, messages: ["กรุณาใส่ JSON Schema"] });
        return;
      }

      const obj = JSON.parse(jsonInput);
      const msgs: string[] = [];
      let valid = true;

      const checkNode = (node: any, path: string) => {
        if (!node || typeof node !== 'object') return;

        if (node.type === 'array' && !node.items) {
          valid = false;
          msgs.push(`[Error] Array at "${path}" is missing "items" property.`);
        }

        if (node.type === 'object') {
           if (!node.properties) {
              valid = false;
              msgs.push(`[Error] Object at "${path}" is missing "properties". Use _dummy property if dynamic.`);
           } else if (Object.keys(node.properties).length === 0) {
              // It's empty, but if it has additionalProperties, they might consider it dynamic. Vertex strictly wants properties.
              // We'll let it slide if properties exists, but they probably need _dummy
           }

           if (!node.required) {
              valid = false;
              msgs.push(`[Error] Object at "${path}" is missing "required" array.`);
           }

           // Check for dynamic _dummy requirements if it has additionalProperties: true but no actual properties
           if (node.additionalProperties === true && node.properties && !node.properties['_dummy'] && Object.keys(node.properties).length === 0) {
              valid = false;
              msgs.push(`[Error] Dynamic object at "${path}" is missing "_dummy" or "additionalProperties: true".`);
           }
        }

        if (node['$schema']) {
           valid = false;
           msgs.push(`[Error] Node at "${path}" contains prohibited "$schema".`);
        }

        if (node['$ref']) {
           valid = false;
           msgs.push(`[Error] Node at "${path}" contains prohibited "$ref".`);
        }

        if (node.patternProperties) {
           valid = false;
           msgs.push(`[Error] Node at "${path}" contains prohibited "patternProperties".`);
        }

        if (node.anyOf || node.allOf || node.oneOf) {
           valid = false;
           msgs.push(`[Error] Node at "${path}" contains prohibited complex nested anyOf/allOf/oneOf.`);
        }

        if (node.properties) {
          Object.keys(node.properties).forEach(k => {
            checkNode(node.properties[k], `${path}.${k}`);
          });
        }
        if (node.items) {
          checkNode(node.items, `${path}[items]`);
        }
      };

      checkNode(obj, 'root');

      if (valid && msgs.length === 0) {
        setResult({ valid: true, messages: ['Schema ผ่านเกณฑ์ Zero-Defect Protocol 100%'] });
      } else {
        setResult({ valid: false, messages: msgs }); // Never claim passed if warnings/errors exist
      }
    } catch (e: any) {
      setResult({ valid: false, messages: [`Invalid JSON: ${e.message}`] });
    }
  };

  return (
    <div className="bg-slate-900 py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
           <TerminalSquare className="text-emerald-500" />
           Zero-Defect Linter Widget
        </h2>
        <p className="text-slate-400 mb-8">
           วาง JSON Schema ของคุณเพื่อตรวจสอบให้แน่ใจว่าปฏิบัติตามกฎ Vertex AI Strict Typing
        </p>

        <div className="grid md:grid-cols-2 gap-6">
           <div>
             <textarea
               value={jsonInput}
               onChange={(e) => setJsonInput(e.target.value)}
               placeholder="วาง JSON Schema ที่นี่..."
               className="w-full h-64 bg-slate-950 text-emerald-400 font-mono text-sm p-4 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
             />
             <button
               onClick={validateSchema}
               className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
             >
               Lint Schema
             </button>
           </div>

           <div className={`p-6 rounded-xl border ${result ? (result.valid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30') : 'bg-slate-800 border-slate-700'}`}>
              <h3 className="text-lg font-bold text-white mb-4">Linter Result</h3>
              {!result ? (
                 <p className="text-slate-500 text-sm">รอการตรวจสอบ...</p>
              ) : (
                 <div className="space-y-3">
                   {result.messages.map((msg, idx) => (
                     <div key={idx} className={`flex items-start gap-2 ${msg.includes('[Error]') || msg.includes('Invalid') ? 'text-red-400' : 'text-emerald-400'}`}>
                        {msg.includes('[Error]') || msg.includes('Invalid') ? <ShieldAlert size={18} className="shrink-0 mt-0.5" /> : <ShieldCheck size={18} className="shrink-0 mt-0.5" />}
                        <span className="text-sm font-mono">{msg}</span>
                     </div>
                   ))}
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
