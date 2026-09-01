import { useEffect, useState } from 'react';
import { Search, Code2, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface ToolSchema {
  name: string;
  description: string;
  inputSchema: any;
}

export function validatePayloadAgainstSchema(
  rawPayload: string,
  schema: any
): { valid: boolean; msg: string } {
  if (!rawPayload || !rawPayload.trim()) {
    return { valid: false, msg: 'Payload cannot be empty.' };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawPayload);
  } catch (e: any) {
    return { valid: false, msg: `Invalid JSON syntax: ${e.message}` };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { valid: false, msg: 'Payload must be a JSON object.' };
  }

  if (!schema || typeof schema !== 'object') {
    return { valid: true, msg: 'Payload is valid (No inputSchema constraints defined).' };
  }

  const validateValue = (val: any, propDef: any, fieldPath: string): string | null => {
    if (!propDef || typeof propDef !== 'object') return null;

    // Check enum
    if (propDef.enum && Array.isArray(propDef.enum)) {
      if (!propDef.enum.includes(val)) {
        return `Field '${fieldPath}' must be one of [${propDef.enum.join(', ')}]`;
      }
    }

    // Check type
    if (propDef.type) {
      if (propDef.type === 'string') {
        if (typeof val !== 'string') {
          return `Field '${fieldPath}' must be of type 'string', got '${typeof val}'`;
        }
      } else if (propDef.type === 'number') {
        if (typeof val !== 'number' || isNaN(val)) {
          return `Field '${fieldPath}' must be of type 'number', got '${typeof val}'`;
        }
      } else if (propDef.type === 'boolean') {
        if (typeof val !== 'boolean') {
          return `Field '${fieldPath}' must be of type 'boolean', got '${typeof val}'`;
        }
      } else if (propDef.type === 'array') {
        if (!Array.isArray(val)) {
          return `Field '${fieldPath}' must be of type 'array', got '${typeof val}'`;
        }
        if (propDef.items && typeof propDef.items === 'object') {
          for (let i = 0; i < val.length; i++) {
            const itemErr = validateValue(val[i], propDef.items, `${fieldPath}[${i}]`);
            if (itemErr) return itemErr;
          }
        }
      } else if (propDef.type === 'object') {
        if (typeof val !== 'object' || val === null || Array.isArray(val)) {
          return `Field '${fieldPath}' must be of type 'object', got '${typeof val}'`;
        }
        const nestedErr = validateObject(val, propDef, fieldPath);
        if (nestedErr) return nestedErr;
      }
    }

    return null;
  };

  const validateObject = (obj: any, schemaNode: any, currentPath: string): string | null => {
    if (!schemaNode || typeof schemaNode !== 'object') return null;

    // Check required fields
    if (schemaNode.required && Array.isArray(schemaNode.required)) {
      for (const reqField of schemaNode.required) {
        if (obj[reqField] === undefined || obj[reqField] === null) {
          const fieldPath = currentPath ? `${currentPath}.${reqField}` : reqField;
          return `Field '${fieldPath}' is required`;
        }
      }
    }

    // Check properties
    if (schemaNode.properties && typeof schemaNode.properties === 'object') {
      for (const key of Object.keys(obj)) {
        const propDef = schemaNode.properties[key];
        const val = obj[key];
        const fieldPath = currentPath ? `${currentPath}.${key}` : key;

        if (val === undefined) continue;

        if (!propDef) {
          if (schemaNode.additionalProperties === false) {
            return `Field '${fieldPath}' is not allowed`;
          }
          continue;
        }

        const err = validateValue(val, propDef, fieldPath);
        if (err) return err;
      }
    }

    return null;
  };

  const errorMsg = validateObject(parsed, schema, '');
  if (errorMsg) {
    return { valid: false, msg: errorMsg };
  }

  return { valid: true, msg: 'Payload is valid according to tool inputSchema (Local Validation).' };
}

export const ToolsExplorer = () => {
  const [tools, setTools] = useState<ToolSchema[]>([]);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [selectedTool, setSelectedTool] = useState<ToolSchema | null>(null);
  const [error, setError] = useState(false);

  const [testPayload, setTestPayload] = useState('');
  const [testResult, setTestResult] = useState<{ valid: boolean; msg: string } | null>(null);

  const baseUrl = import.meta.env.BASE_URL;

  useEffect(() => {
    fetch(`${baseUrl}tools-schema.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch tools schema');
        return res.json();
      })
      .then((data) => setTools(data.tools || []))
      .catch((err) => {
        console.error(err);
        setError(true);
      });
  }, [baseUrl]);

  const filteredTools = tools.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = platformFilter
      ? t.description.toLowerCase().includes(platformFilter.toLowerCase()) ||
        t.name.toLowerCase().includes(platformFilter.toLowerCase())
      : true;
    return matchesSearch && matchesPlatform;
  });

  const runTestPayload = () => {
    if (!selectedTool) return;
    const res = validatePayloadAgainstSchema(testPayload, selectedTool.inputSchema);
    setTestResult(res);
  };

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 py-16 px-6 sm:px-12 lg:px-24 min-h-screen">
        <div className="max-w-7xl mx-auto flex items-center justify-center p-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertTriangle className="text-red-500 mr-3" />
          <p className="text-red-700 dark:text-red-400 font-semibold">
            Failed to load tools-schema.json endpoint.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 py-16 px-6 sm:px-12 lg:px-24 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
              <Code2 className="text-indigo-500" />
              Interactive MCP Tools Explorer
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              ค้นหาและตรวจสอบ Schema ของเครื่องมือทั้งหมด {tools.length} รายการ
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">All Platforms</option>
              <option value="shopee">Shopee</option>
              <option value="tiktok">TikTok</option>
              <option value="lazada">Lazada</option>
              <option value="lnwshop">LnwShop</option>
            </select>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหาชื่อ Tool..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden h-[750px] flex flex-col">
            <div className="overflow-y-auto p-4 space-y-2 flex-1">
              {filteredTools.map((tool, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedTool(tool);
                    setTestResult(null);
                    setTestPayload('{\n  \n}');
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedTool?.name === tool.name
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                      : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <h4
                    className="font-mono font-semibold text-sm text-slate-900 dark:text-white mb-1 truncate"
                    title={tool.name}
                  >
                    {tool.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {tool.description}
                  </p>
                </button>
              ))}
              {filteredTools.length === 0 && (
                <p className="text-center text-slate-500 py-10">ไม่พบ Tool ที่ค้นหา</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedTool ? (
              <div className="bg-slate-900 rounded-xl border border-slate-800 h-[750px] flex flex-col overflow-hidden shadow-xl">
                <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950">
                  <h3 className="font-mono text-emerald-400 font-semibold">{selectedTool.name}</h3>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(JSON.stringify(selectedTool.inputSchema, null, 2))
                    }
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded transition-colors cursor-pointer"
                  >
                    Copy inputSchema
                  </button>
                </div>
                <div className="p-4 border-b border-slate-800 bg-slate-900">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {selectedTool.description}
                  </p>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <pre className="text-xs text-slate-300 font-mono">
                    <code>{JSON.stringify(selectedTool.inputSchema, null, 2)}</code>
                  </pre>
                </div>

                <div className="border-t border-slate-800 p-4 bg-slate-950">
                  <h4 className="text-white text-sm font-semibold mb-2">
                    Test Payload (Local Schema Validation Only)
                  </h4>
                  <textarea
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    placeholder="วาง Test Payload JSON ที่นี่..."
                    className="w-full h-24 bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-lg border border-slate-700 focus:border-indigo-500 outline-none mb-2"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      onClick={runTestPayload}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded cursor-pointer transition-colors"
                    >
                      Validate Payload
                    </button>
                    {testResult && (
                      <div
                        className={`flex items-center gap-2 text-xs font-mono ${
                          testResult.valid ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {testResult.valid ? (
                          <ShieldCheck size={14} className="shrink-0" />
                        ) : (
                          <AlertTriangle size={14} className="shrink-0" />
                        )}
                        <span>{testResult.msg}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[750px] border border-slate-200 dark:border-slate-800 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-400">
                <Code2 size={48} className="mb-4 opacity-20" />
                <p>เลือก Tool จากเมนูด้านซ้ายเพื่อดูรายละเอียด</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
