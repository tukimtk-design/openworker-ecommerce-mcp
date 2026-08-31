import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface Phase {
  name: string;
  features: string[];
  status: string;
}

export const RoadmapTimeline = () => {
  const [phases, setPhases] = useState<Phase[]>([]);

  useEffect(() => {
    fetch('/roadmap.json')
      .then(res => res.json())
      .then(data => setPhases(data.phases))
      .catch(err => console.error("Failed to load roadmap", err));
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-10 flex items-center gap-3">
           <Clock className="text-indigo-500" />
           Project Roadmap & Phase Tracker
        </h2>

        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 md:ml-0 md:space-y-0 md:grid md:grid-cols-2 md:gap-8 md:border-l-0">
           {phases.map((phase, index) => {
             const isComplete = phase.status === 'Complete';

             return (
               <div key={index} className="mb-10 ml-8 md:ml-0 md:mb-12 relative group">
                  <div className="hidden md:block absolute top-6 -left-[2.1rem] md:static md:hidden w-5 h-5"></div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative">
                     <span className={`absolute -left-12 top-6 md:-left-4 md:-ml-0.5 md:top-6 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 ${isComplete ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}>
                       {isComplete ? <CheckCircle2 size={16} className="text-white" /> : <Circle size={10} className="text-white fill-white" />}
                     </span>

                     <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{phase.name}</h3>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${isComplete ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                           {phase.status}
                        </span>
                     </div>

                     <ul className="space-y-2">
                        {phase.features.map((feature, fIndex) => (
                           <li key={fIndex} className="text-slate-600 dark:text-slate-400 text-sm flex items-start gap-2">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                              {feature}
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
             )
           })}
        </div>
      </div>
    </div>
  );
};
