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
  const [error, setError] = useState<string | null>(null);
  const [gaps, setGaps] = useState<string[]>(data.gaps || []);

  useEffect(() => {
    if (gaps.length === 0) {
      handleAnalyze();
    }
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const suggestedGaps = await identifyGaps(data.whatWasPlanned || '', data.whatHappened || '');
      if (suggestedGaps && suggestedGaps.length > 0) {
        setGaps(suggestedGaps);
      } else {
        setError("מפתח ה-API לא זוהה או שאינו תקין בסביבת ההרצה.");
      }
    } catch (e: any) {
      console.error(e);
      setError("חלה שגיאה בתקשורת עם ה-AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleGapChange = (i: number, val: string) => {
    const newGaps = [...gaps];
    newGaps[i] = val;
    setGaps(newGaps);
  };

  const addGap = () => {
    setGaps([...gaps, '']);
    setError(null);
  };
  
  const removeGap = (i: number) => setGaps(gaps.filter((_, idx) => idx !== i));

  const handleProceed = () => {
    updateData({ gaps: gaps.filter(g => g.trim() !== '') });
    onNext();
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left duration-300">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-slate-900">זיהוי פערים</h2>
        {!loading && (
          <button 
            onClick={handleAnalyze} 
            className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full active:scale-95 transition-transform"
          >
            נסה ניתוח AI שוב 🤖
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-red-900 text-xs font-bold flex flex-col gap-3 animate-in fade-in">
          <div className="flex gap-2">
            <span>⚠️</span>
            <div className="space-y-1">
              <p>המערכת לא הצליחה לגשת ל-AI.</p>
              <p className="font-normal opacity-80">וודא שמשתנה הסביבה API_KEY מוגדר ב-Netlify ושהוא זמין ל-Frontend. נסה להשתמש ב-VITE_API_KEY במידת הצורך.</p>
            </div>
          </div>
          <button 
            onClick={addGap}
            className="bg-white border border-red-200 py-2 px-4 rounded-xl self-end text-red-700 shadow-sm font-bold active:scale-95 transition-transform"
          >
            המשך והזן פערים ידנית
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
              <p className="text-sm font-black text-slate-700">ה-AI מנתח נתונים...</p>
              <p className="text-[10px] text-slate-400 mt-1 italic">מזהה פערים בין תכנון לביצוע</p>
            </div>
          </div>
        ) : (
          <>
            {gaps.length === 0 && !error && (
              <div className="py-10 text-center space-y-4">
                <p className="text-slate-400 text-sm font-medium">מוכן להזנת פערים.</p>
                <button onClick={addGap} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg">הוסף פער ראשון +</button>
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
            {(gaps.length > 0 || error) && (
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
            gaps.length > 0 || error ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400 opacity-50'
          }`}
        >
          לשלב המסקנות 🎯
        </button>
      </div>
    </div>
  );
};

export default Step2Gaps;