
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Step1Input from './components/Step1Input';
import Step2Gaps from './components/Step2Gaps';
import Step3Conclusions from './components/Step3Conclusions';
import { DebriefData } from './types';

const STORAGE_KEY = 'debrief_pro_records';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'editor' | 'setup'>('dashboard');
  const [activeStep, setActiveStep] = useState(0);
  const [history, setHistory] = useState<DebriefData[]>([]);
  const [currentDebrief, setCurrentDebrief] = useState<Partial<DebriefData>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // בדיקת קיום מפתח API בהפעלה
  useEffect(() => {
    const checkApiKey = async () => {
      const exists = !!process.env.API_KEY;
      // @ts-ignore - aistudio is provided by the environment
      if (!exists && window.aistudio) {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        if (!selected) {
          setHasApiKey(false);
          setView('setup');
        }
      }
    };
    checkApiKey();
  }, []);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading history", e);
      }
    }
  }, []);

  // Save history whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const handleConnect = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // הנחה שהבחירה הצליחה לפי ההוראות
      setHasApiKey(true);
      setView('dashboard');
    }
  };

  const startNewDebrief = () => {
    setCurrentDebrief({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      title: '',
      whatWasPlanned: '',
      whatHappened: '',
      gaps: [],
      rootCauses: [],
      conclusions: [],
      images: []
    });
    setActiveStep(0);
    setView('editor');
  };

  const updateDebrief = (updates: Partial<DebriefData>) => {
    setCurrentDebrief(prev => ({ ...prev, ...updates }));
  };

  const saveToHistory = (data: Partial<DebriefData>) => {
    const fullDebrief = { ...data, timestamp: data.timestamp || Date.now() } as DebriefData;
    setHistory(prev => {
      const exists = prev.find(d => d.id === fullDebrief.id);
      if (exists) {
        return prev.map(d => d.id === fullDebrief.id ? fullDebrief : d);
      }
      return [fullDebrief, ...prev];
    });
  };

  const handleSaveDraft = () => {
    saveToHistory(currentDebrief);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleFinish = () => {
    saveToHistory(currentDebrief);
    alert('התחקיר נשמר בארכיון המכשיר ✅');
    setView('dashboard');
  };

  const deleteDebrief = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('למחוק את התחקיר לצמיתות?')) {
      setHistory(prev => prev.filter(d => d.id !== id));
    }
  };

  const shareDebrief = (platform: 'whatsapp' | 'email' | 'native') => {
    const d = currentDebrief;
    let text = `*סיכום תחקיר: ${d.title || 'ללא כותרת'}*\n`;
    text += `תאריך: ${new Date(d.timestamp || Date.now()).toLocaleDateString('he-IL')}\n\n`;
    
    if (d.whatWasPlanned) text += `*מה תוכנן:*\n${d.whatWasPlanned}\n\n`;
    if (d.whatHappened) text += `*מה היה בפועל:*\n${d.whatHappened}\n\n`;
    
    if (d.gaps && d.gaps.length > 0) {
      text += `*פערים שזוהו:*\n${d.gaps.map((g, i) => `${i + 1}. ${g}`).join('\n')}\n\n`;
    }
    
    if (d.rootCauses && d.rootCauses.length > 0) {
      text += `*גורמי שורש:*\n${d.rootCauses.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n`;
    }
    
    if (d.conclusions && d.conclusions.length > 0) {
      text += `*מסקנות אופרטיביות:*\n${d.conclusions.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n`;
    }

    text += `נשלח מאפליקציית Debrief Pro`;

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=סיכום תחקיר: ${d.title}&body=${encodeURIComponent(text)}`;
    } else if (platform === 'native' && navigator.share) {
      navigator.share({
        title: `תחקיר: ${d.title}`,
        text: text,
      }).catch(console.error);
    }
  };

  if (view === 'setup') {
    return (
      <Layout title="חיבור למערכת">
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-8 animate-in fade-in">
          <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center text-white text-5xl shadow-2xl">
            🚀
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900">ברוכים הבאים</h2>
            <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">
              כדי להשתמש ביכולות הבינה המלאכותית לניתוח התחקיר, עליך לחבר מפתח API.
            </p>
          </div>
          <button 
            onClick={handleConnect}
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all w-full max-w-xs"
          >
            התחברות עם Google Gemini
          </button>
          <p className="text-[10px] text-slate-400">
            השימוש מחייב מפתח API מפרויקט עם חיוב מופעל. <br/>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline font-bold">למידע נוסף על חיוב</a>
          </p>
        </div>
      </Layout>
    );
  }

  if (view === 'dashboard') {
    return (
      <Layout title="התחקירים שלי">
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-1">הפקת לקחים</h2>
              <p className="text-slate-400 text-sm mb-6">סיכום תקלות ושיפור ביצועים</p>
              <button 
                onClick={startNewDebrief}
                className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all"
              >
                תחקיר חדש +
              </button>
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">ארכיון (נשמר מקומית)</h3>
            {history.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="text-4xl">📂</div>
                <p className="text-slate-400 font-bold text-sm">אין עדיין תחקירים שמורים</p>
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    setCurrentDebrief(item);
                    setActiveStep(0); 
                    setView('editor');
                  }}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg">
                      {item.conclusions.length > 0 ? '✅' : '📝'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(item.timestamp).toLocaleDateString('he-IL')} • {item.gaps.length} פערים
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => deleteDebrief(item.id, e)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={activeStep === 0 ? "תחקיר חדש" : activeStep === 1 ? "ניתוח פערים" : "מסקנות ושיפור"}>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-2 px-1">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  activeStep >= i ? 'bg-slate-900' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center px-1">
            <button 
              onClick={() => activeStep === 0 ? setView('dashboard') : setActiveStep(prev => prev - 1)}
              className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-900 transition-all"
            >
              <span>→</span> {activeStep === 0 ? "חזור" : "חזור שלב"}
            </button>

            <div className="flex gap-2 items-center">
              {saveStatus === 'saved' && (
                <span className="text-[10px] font-bold text-emerald-500 animate-pulse">נשמר!</span>
              )}
              <button 
                onClick={handleSaveDraft}
                className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                title="שמור טיוטה"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
              </button>
              <button 
                onClick={() => shareDebrief('whatsapp')}
                className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
                title="שתף בוואטסאפ"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82c1.516.903 3.133 1.381 4.82 1.381 5.398 0 9.791-4.393 9.794-9.792 0-2.613-1.018-5.07-2.866-6.92s-4.307-2.868-6.92-2.868c-5.399 0-9.791 4.394-9.794 9.794 0 1.748.463 3.456 1.341 4.965l-1.005 3.673 3.765-.988z"></path></svg>
              </button>
              <button 
                onClick={() => shareDebrief('email')}
                className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
                title="שלח במייל"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="pb-24">
          {activeStep === 0 && (
            <Step1Input 
              data={currentDebrief} 
              updateData={updateDebrief} 
              onNext={() => setActiveStep(1)} 
            />
          )}

          {activeStep === 1 && (
            <Step2Gaps 
              data={currentDebrief} 
              updateData={updateDebrief} 
              onNext={() => setActiveStep(2)} 
            />
          )}

          {activeStep === 2 && (
            <Step3Conclusions 
              data={currentDebrief} 
              updateData={updateDebrief} 
              onFinish={handleFinish} 
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default App;
