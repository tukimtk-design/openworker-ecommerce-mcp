import { HeroSection } from './components/HeroSection';
import { ToolsExplorer } from './components/ToolsExplorer';
import { RoadmapTimeline } from './components/RoadmapTimeline';
import { ZeroDefectLinter } from './components/ZeroDefectLinter';
import { PromptDispatcher } from './components/PromptDispatcher';

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans">
      <HeroSection />
      <ToolsExplorer />
      <RoadmapTimeline />
      <ZeroDefectLinter />
      <PromptDispatcher />

      <footer className="bg-slate-950 text-slate-500 py-8 text-center border-t border-slate-900">
         <p>© {new Date().getFullYear()} Openworker E-Commerce MCP. Single Source of Truth Hub.</p>
      </footer>
    </div>
  );
}

export default App;
