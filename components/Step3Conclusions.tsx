
import React, { useState, useEffect } from 'react';
import { analyzeConclusions } from '../services/geminiService';
import { DebriefData } from '../types';

interface Props {
  data: Partial<DebriefData>;
  updateData: (updates: Partial<DebriefData>) => void;
  onFinish: () => void;
}

const Step3Conclusions: React.FC<Props> = ({ data, updateData, onFinish }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rootCauses, setRootCauses] = useState<string[]>(data.rootCauses || []);
  const [conclusions, setConclusions] = useState<string[]>(data.conclusions || []);

  useEffect(() => {
    if (rootCauses.length === 0 && conclusions.length === 0) {
      handleAnalyze();
    }
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeConclusions(data.gaps || []);
      setRootCauses(result.rootCauses || []);
      setConclusions(result.conclusions || []);
    } catch (e: any) {
      if (e.message === "MISSING_API_KEY") {
        setError("מפתח API חסר. נא להתחבר מחדש.");
        // @ts-ignore
        if (window.aistudio) window.aistudio.openSelectKey().then(handleAnalyze);
      } else {
        setError("חלה שגיאה בייצור המסקנות.");
      }
    } finally {
      setLoading(false);
    }
  };

  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => setter(prev => ['', ...prev]);
  const removeItem = (i: number, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => setter(list.filter((_, idx) => idx !== i));
  const updateItem = (i: number, val: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    const newList = [...list];
    newList[i] = val;
    setter(newList);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-left duration-300 pb-32">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">גורמי שורש ומסקנות</h2>
        {!loading && <button onClick={handleAnalyze} className="text-xs font-bold text-blue-600">ניתוח חוזר 🤖</button>}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400">ה-AI מגבש מסקנות בעברית...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-black uppercase text-indigo-500 tracking-wider">🔎 גורמי שורש</label>
              <button onClick={() => addItem(setRootCauses)} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold">+ הוסף ידנית</button>
            </div>
            {rootCauses.map((rc, i) => (
              <div key={i} className="relative group animate-in slide-in-from-bottom-2">
                <textarea
                  value={rc}
                  onChange={(e) => updateItem(i, e.target.value, rootCauses, setRootCauses)}
                  className="w-full p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                  rows={2}
                />
                <button onClick={() => removeItem(i, rootCauses, setRootCauses)} className="absolute -top-2 -left-2 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">✕</button>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-black uppercase text-emerald-600 tracking-wider">✅ מסקנות ולקחים</label>
              <button onClick={() => addItem(setConclusions)} className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold">+ הוסף לקח</button>
            </div>
            {conclusions.map((conc, i) => (
              <div key={i} className="relative group animate-in slide-in-from-bottom-2">
                <textarea
                  value={conc}
                  onChange={(e) => updateItem(i, e.target.value, conclusions, setConclusions)}
                  className="w-full p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  rows={2}
                />
                <button onClick={() => removeItem(i, conclusions, setConclusions)} className="absolute -top-2 -left-2 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">✕</button>
              </div>
            ))}
          </section>
        </div>
      )}

      <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-50">
        <button 
          onClick={() => {
            updateData({ rootCauses, conclusions });
            onFinish();
          }}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-100"
        >
          סיום ושמירת תחקיר ✅
        </button>
      </div>
    </div>
  );
};

export default Step3Conclusions;
