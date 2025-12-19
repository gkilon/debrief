
import React, { useState } from 'react';
import { analyzeRootCause, chatWithAgent } from '../services/geminiService';
import { DebriefData } from '../types';

interface Props {
  debrief: Partial<DebriefData>;
}

const AIAgent: React.FC<Props> = ({ debrief }) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeRootCause({
      whatHappened: debrief.whatHappened || '',
      whatWasPlanned: debrief.whatWasPlanned || '',
      gaps: debrief.gaps || [],
    });
    setAnalysis(result);
    setLoading(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    
    const response = await chatWithAgent([], userMsg);
    setChatMessages(prev => [...prev, { role: 'assistant', content: response || 'מצטער, הייתה שגיאה' }]);
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden text-white flex flex-col md:flex-row h-[600px]">
      <div className="md:w-1/2 p-6 border-l border-slate-800 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs">🤖</span>
          </div>
          <h2 className="text-xl font-bold">סוכן ניתוח שורש (RCA)</h2>
        </div>

        {!analysis && (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <p className="text-slate-400">הסוכן מוכן לנתח את הנתונים שהזנת ולהציע גורמי שורש.</p>
            <button 
              onClick={handleAnalyze} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'מנתח נתונים...' : 'הפעל ניתוח חכם'}
            </button>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            <div>
              <h3 className="text-blue-400 font-bold mb-2">גורמי שורש שזוהו</h3>
              <ul className="space-y-2">
                {analysis.rootCauses.map((rc: string, i: number) => (
                  <li key={i} className="bg-slate-800 p-2 rounded text-sm border-r-2 border-blue-500">{rc}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-blue-400 font-bold mb-2">ניתוח מעמיק</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{analysis.analysis}</p>
            </div>
            <div>
              <h3 className="text-blue-400 font-bold mb-2">המלצות לביצוע</h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="bg-slate-800 p-2 rounded text-sm border-r-2 border-green-500">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="md:w-1/2 p-6 flex flex-col h-full bg-slate-950">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>💬</span> צ'אט עם הסוכן
        </h3>
        <div className="flex-grow overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
          {chatMessages.length === 0 && (
            <p className="text-slate-500 text-sm italic text-center mt-10">שאל אותי משהו על התחקיר, למשל: "איך יכולנו למנוע את הפער השני?"</p>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-600 rounded-tr-none' : 'bg-slate-800 rounded-tl-none'}`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
            className="flex-grow bg-slate-800 border-none rounded-lg p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="הקלד כאן..."
          />
          <button onClick={handleChat} className="bg-blue-600 p-3 rounded-lg hover:bg-blue-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
