import { useState } from 'react';
import { Copy, Check, MessageSquareCode } from 'lucide-react';

export const PromptDispatcher = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const prompts = [
    {
      id: "master-context",
      title: "Master Context for AI Chat",
      description: "ก็อปปี้ Context เริ่มต้นเพื่อให้ AI Chat Controller ทราบสถานะล่าสุดของโปรเจกต์",
      text: "ฉันคือ AI Project Controller ของ Openworker E-Commerce MCP กรุณาอัปเดตข้อมูลโครงสร้างโปรเจกต์และดึงข้อมูลจาก AI Webboard Hub (/ai-context.json) เพื่อให้แน่ใจว่าเราทำงานอยู่บน Phase 12 ล่าสุด และปฏิบัติตาม Zero-Defect Protocol อย่างเคร่งครัด"
    },
    {
      id: "jules-task",
      title: "Task Prompt for Google Jules",
      description: "สั่งการ Jules ให้สร้าง MCP Tool ใหม่ตามมาตรฐาน",
      text: "สวัสดี Jules! ฉันต้องการให้คุณสร้าง MCP Tool ตัวใหม่ที่ src/tools/ โดยต้องปฏิบัติตามกฎ Zero-Defect Protocol อย่างเคร่งครัด (Schema ต้องมี items สำหรับ array และ properties สำหรับ object เสมอ) และอย่าลืมรัน npm test หลังจบงาน"
    }
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
           <MessageSquareCode className="text-blue-500" />
           One-Click AI Prompt Dispatcher
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
           {prompts.map(prompt => (
             <div key={prompt.id} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{prompt.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1">{prompt.description}</p>

                <div className="bg-slate-900 rounded-lg p-4 mb-4 relative group">
                  <p className="text-xs text-slate-300 font-mono line-clamp-3">{prompt.text}</p>
                </div>

                <button
                  onClick={() => handleCopy(prompt.id, prompt.text)}
                  className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors ${copiedId === prompt.id ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white'}`}
                >
                  {copiedId === prompt.id ? (
                    <><Check size={18} /> คัดลอกแล้ว</>
                  ) : (
                    <><Copy size={18} /> คัดลอก Prompt</>
                  )}
                </button>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
