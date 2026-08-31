import { useEffect, useState } from 'react';
import { Search, Code2, } from 'lucide-react';

interface ToolSchema {
  name: string;
  description: string;
  schema: any;
}

export const ToolsExplorer = () => {
  const [tools, setTools] = useState<ToolSchema[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTool, setSelectedTool] = useState<ToolSchema | null>(null);

  useEffect(() => {
    fetch('/tools-schema.json')
      .then(res => res.json())
      .then(data => setTools(data.tools))
      .catch(err => console.error(err));
  }, []);

  const filteredTools = tools.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-950 py-16 px-6 sm:px-12 lg:px-24 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
               <Code2 className="text-indigo-500" />
               Interactive MCP Tools Explorer
             </h2>
             <p className="text-slate-500 dark:text-slate-400">ค้นหาและตรวจสอบ Schema ของเครื่องมือทั้งหมด {tools.length} รายการ</p>
           </div>
           <div className="relative w-full md:w-96">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input
               type="text"
               placeholder="ค้นหาชื่อ Tool หรือ Platform..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
             />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden h-[600px] flex flex-col">
              <div className="overflow-y-auto p-4 space-y-2 flex-1">
                 {filteredTools.map((tool, idx) => (
                   <button
                     key={idx}
                     onClick={() => setSelectedTool(tool)}
                     className={`w-full text-left p-4 rounded-lg border transition-all ${selectedTool?.name === tool.name ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                   >
                      <h4 className="font-mono font-semibold text-sm text-slate-900 dark:text-white mb-1 truncate" title={tool.name}>{tool.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{tool.description}</p>
                   </button>
                 ))}
                 {filteredTools.length === 0 && (
                   <p className="text-center text-slate-500 py-10">ไม่พบ Tool ที่ค้นหา</p>
                 )}
              </div>
           </div>

           <div className="lg:col-span-2">
              {selectedTool ? (
                 <div className="bg-slate-900 rounded-xl border border-slate-800 h-[600px] flex flex-col overflow-hidden shadow-xl">
                    <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950">
                       <h3 className="font-mono text-emerald-400 font-semibold">{selectedTool.name}</h3>
                       <button
                         onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedTool.schema, null, 2))}
                         className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded transition-colors"
                       >
                         Copy Schema
                       </button>
                    </div>
                    <div className="p-4 border-b border-slate-800 bg-slate-900">
                       <p className="text-slate-300 text-sm leading-relaxed">{selectedTool.description}</p>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                       <pre className="text-xs text-slate-300 font-mono">
                         <code>{JSON.stringify(selectedTool.schema, null, 2)}</code>
                       </pre>
                    </div>
                 </div>
              ) : (
                 <div className="h-[600px] border border-slate-200 dark:border-slate-800 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-400">
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
