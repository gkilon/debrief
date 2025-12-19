
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
  const [rootCauses, setRootCauses] = useState<string[]>(data.rootCauses || []);
  const [conclusions, setConclusions] = useState<string[]>(data.conclusions || []);

  useEffect(() => {
    if (rootCauses.length === 0 && conclusions.length === 0) {
      handleAnalyze();
    }
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeConclusions(data.gaps || []);
    setRootCauses(result.rootCauses);
    setConclusions(result.conclusions);
    setLoading(false);
  };

  const handleListChange = (i: number, val: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    const newList = [...list];
    newList[i] = val;
    setter(newList);
  };

  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => setter(prev => [...prev, '']);
  const removeItem = (i: number, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => setter(list.filter((_, idx) => idx !== i));

  const handleFinish = () => {
    updateData({ rootCauses, conclusions });
    onFinish();
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-left duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">גורמי שורש ומסקנות</h2>
        <button onClick={handleAnalyze} disabled={loading} className="text-xs font-bold text-blue-600">נתח שוב</button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400">ה-AI מנתח לעומק (5 Whys)...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-black uppercase text-indigo-500 tracking-wider">🔎 גורמי שורש</label>
              <button onClick={() => addItem(setRootCauses)} className="text-[10px] font-bold text-slate-400">+ הוסף</button>
            </div>
            {rootCauses.map((rc, i) => (
              <div key={i} className="relative">
                <textarea
                  value={rc}
                  onChange={(e) => handleListChange(i, e.target.value, rootCauses, setRootCauses)}
                  className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-300 outline-none text-sm text-indigo-900 shadow-sm"
                  rows={2}
                />
                <button onClick={() => removeItem(i, rootCauses, setRootCauses)} className="absolute -top-1 -left-1 w-5 h-5 bg-indigo-200 text-indigo-600 rounded-full flex items-center justify-center text-[10px]">✕</button>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-black uppercase text-emerald-500 tracking-wider">✅ מסקנות אופרטיביות</label>
              <button onClick={() => addItem(setConclusions)} className="text-[10px] font-bold text-slate-400">+ הוסף</button>
            </div>
            {conclusions.map((conc, i) => (
              <div key={i} className="relative">
                <textarea
                  value={conc}
                  onChange={(e) => handleListChange(i, e.target.value, conclusions, setConclusions)}
                  className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-300 outline-none text-sm text-emerald-900 shadow-sm"
                  rows={2}
                />
                <button onClick={() => removeItem(i, conclusions, setConclusions)} className="absolute -top-1 -left-1 w-5 h-5 bg-emerald-200 text-emerald-600 rounded-full flex items-center justify-center text-[10px]">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-50 pointer-events-auto">
        <button 
          onClick={handleFinish}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-200 active:scale-95"
        >
          סיום ושמירה ✅
        </button>
      </div>
    </div>
  );
};

export default Step3Conclusions;
