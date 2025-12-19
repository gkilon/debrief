
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = "תחקיר Pro" }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 max-w-md mx-auto shadow-2xl relative">
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-sm">D</div>
          <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">{title}</h1>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
      </header>
      
      <main className="flex-grow px-4 py-6 pb-32 overflow-y-auto">
        {children}
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto pointer-events-none">
        <div className="h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>
    </div>
  );
};

export default Layout;
