import { Terminal, Bot, Server } from 'lucide-react';

export const HeroSection = () => {
  return (
    <div className="bg-slate-900 text-white py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="mb-10 md:mb-0 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-500/30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live (v1.0.0-enterprise)
            </span>
            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold border border-blue-500/30">
              Phase 12: Autonomous
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Openworker E-Commerce MCP
            <span className="block text-indigo-400">AI Living Webboard & Knowledge Hub</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            ศูนย์กลางการเผยแพร่ Context ของโปรเจกต์ (Single Source of Truth) เพื่อลด Human Error และ AI Hallucination รวบรวมเครื่องมือ MCP กว่า 32 ตัว กฎระเบียบ Zero-Defect Protocol และเครื่องมือช่วยเหลือ AI Developer
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/ai-context.json" target="_blank" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg border border-slate-700 transition-colors">
              <Terminal size={18} />
              /ai-context.json
            </a>
            <a href="/tools-schema.json" target="_blank" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg border border-slate-700 transition-colors">
              <Server size={18} />
              /tools-schema.json
            </a>
            <a href="/llms.txt" target="_blank" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg border border-slate-700 transition-colors">
              <Bot size={18} />
              /llms.txt
            </a>
          </div>
        </div>
        <div className="w-full max-w-sm">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -z-10 group-hover:bg-indigo-500/20 transition-colors"></div>
            <h3 className="text-xl font-bold mb-2">System Status</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                 <span className="text-slate-400">Environment</span>
                 <span className="font-mono text-emerald-400">Production</span>
               </div>
               <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                 <span className="text-slate-400">MCP Tools Active</span>
                 <span className="font-mono font-bold text-white">32 Tools</span>
               </div>
               <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                 <span className="text-slate-400">Strict Schema Check</span>
                 <span className="font-mono text-emerald-400">Passed 100%</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-400">Framework</span>
                 <span className="font-mono text-white">Vite + React</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
