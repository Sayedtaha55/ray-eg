import React from 'react';
import { BuilderProvider, useBuilder } from './context/BuilderContext';
import { TopBar } from './components/header/TopBar';
import { PublishModal } from './components/header/PublishModal';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { CanvasArea } from './components/canvas/CanvasArea';
import { RightInspector } from './components/inspector/RightInspector';
import { CodeWorkspace } from './components/code/CodeWorkspace';
import { AiAssistantModal } from './components/ai/AiAssistantModal';
import { LivePreviewModal } from './components/preview/LivePreviewModal';
import { DeveloperModeDrawer } from './components/dev/DeveloperModeDrawer';
import { CartDrawer } from './components/cart/CartDrawer';

const BuilderWorkspace: React.FC<{ fullScreen?: boolean }> = ({ fullScreen = false }) => {
  return (
    <div className={`flex flex-col ${fullScreen ? 'h-screen' : 'h-[calc(100vh-4rem)]'} w-full bg-slate-100 overflow-hidden font-sans antialiased text-slate-900`}>
      {/* Top Navigation Header */}
      <TopBar />

      {/* Main Studio 3-Column Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar: Pages, Layers, Section Library, Design System, Assets, Data, SEO */}
        <LeftSidebar />

        {/* Center Visual Canvas Area */}
        <CanvasArea />

        {/* Right Inspector Panel: Design, Content Props, Responsive Overrides */}
        <RightInspector />
      </div>

      {/* Bottom Scoped Code Workspace Dock */}
      <CodeWorkspace />

      {/* Modals, Drawers & Overlays */}
      <PublishModal />
      <AiAssistantModal />
      <LivePreviewModal />
      <DeveloperModeDrawer />
      <CartDrawer />
    </div>
  );
};

export default function App({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <BuilderProvider>
      <BuilderWorkspace fullScreen={fullScreen} />
    </BuilderProvider>
  );
}
