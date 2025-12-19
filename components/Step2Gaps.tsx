
import React, { useState, useEffect } from 'react';
import { identifyGaps } from '../services/geminiService';
import { DebriefData } from '../types';

interface Props {
  data: Partial<DebriefData>;
  updateData: (updates: Partial<DebriefData>) => void;
  onNext: () => void;
}

const Step2Gaps: React.FC<Props> = ({ data, updateData, onNext }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [gaps, setGaps] = useState<string[]>(data.gaps || []);

  useEffect(() => {
    if (gaps.length === 0) {
      handleAnalyze();
    }
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(false);
    try {
      const suggestedGaps = await identifyGaps(data.whatWasPlanned || '', data.whatHappened || '');
      if (suggestedGaps) {
        setGaps(suggestedGaps);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGapChange = (i: number, val: string) => {
    const newGaps = [...gaps];
    newGaps[i] = val;
    setGaps(newGaps);
  };

  const addGap = () => setGaps([...gaps, '']);
  const removeGap = (i: number) => setGaps(gaps.filter((_, idx) => idx !== i));

  const handleProceed = () => {
    updateData({ gaps: gaps.filter(g => g.trim() !== '') });
    onNext();
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left duration-300">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-slate-900">זיהוי פערים</h2>
        <button 
          onClick={handleAnalyze} 
          disabled={loading}
          className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full active:scale-95 transition-transform"
        >
          {loading ? 'מנתח...' : 'ניתוח AI 🤖'}
        </button>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-800 text-xs font-bold flex flex-col gap-2">
          <p>⚠️ לא הצלחנו להתחבר לבינה המלאכותית (בדוק את ה-API KEY ב-Netlify).</p>
          <button 
            onClick={() => { setError(false); if (gaps.length === 0) addGap(); }}
            className="text-amber-900 underline text-right"
          >
            הזן פערים ידנית והמשך
          </button>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute top-0 w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-slate-700">ה-AI מנתח את הנתונים...</p>
              <p className="text-[10px] text-slate-400 mt-1">זה עשוי לקחת כמה שניות</p>
            </div>
            <button 
              onClick={() => { setLoading(false); addGap(); }}
              className="mt-4 text-[10px] font-bold text-slate-400 underline"
            >
              ביטול והזנה ידנית
            </button>
          </div>
        ) : (
          <>
            {gaps.length === 0 && !loading && (
              <div className="py-10 text-center space-y-4">
                <p className="text-slate-400 text-sm font-medium">לא נמצאו פערים או שהניתוח נכשל.</p>
                <button onClick={addGap} className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold">הוסף פער ראשון +</button>
              </div>
            )}
            {gaps.map((gap, i) => (
              <div key={i} className="relative group animate-in fade-in slide-in-from-bottom-2">
                <textarea
                  value={gap}
                  onChange={(e) => handleGapChange(i, e.target.value)}
                  rows={2}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none text-sm text-slate-700 shadow-sm"
                  placeholder="תאר את הפער..."
                />
                <button 
                  onClick={() => removeGap(i)}
                  className="absolute -top-2 -left-2 w-6 h-6 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-xs shadow-sm hover:bg-red-500 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            {gaps.length > 0 && (
              <button 
                onClick={addGap}
                className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-400 font-bold rounded-2xl active:bg-slate-100 text-sm transition-colors"
              >
                + הוסף פער נוסף
              </button>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-50 pointer-events-auto">
        <button 
          onClick={handleProceed}
          disabled={loading || (gaps.length === 0 && !error)}
          className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl ${
            gaps.length > 0 || error ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'
          }`}
        >
          ניתוח שורש ומסקנות 🎯
        </button>
      </div>
    </div>
  );
};

export default Step2Gaps;
