
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
  const [gaps, setGaps] = useState<string[]>(data.gaps || []);

  useEffect(() => {
    if (gaps.length === 0) {
      handleAnalyze();
    }
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    const suggestedGaps = await identifyGaps(data.whatWasPlanned || '', data.whatHappened || '');
    setGaps(suggestedGaps);
    setLoading(false);
  };

  const handleGapChange = (i: number, val: string) => {
    const newGaps = [...gaps];
    newGaps[i] = val;
    setGaps(newGaps);
  };

  const addGap = () => setGaps([...gaps, '']);
  const removeGap = (i: number) => setGaps(gaps.filter((_, idx) => idx !== i));

  const handleProceed = () => {
    updateData({ gaps });
    onNext();
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left duration-300">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-slate-900">זיהוי פערים</h2>
        <button 
          onClick={handleAnalyze} 
          disabled={loading}
          className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full"
        >
          {loading ? 'מנתח...' : 'נתח שוב 🔄'}
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400">ה-AI מחפש פערים בין התכנון למציאות...</p>
          </div>
        ) : (
          <>
            {gaps.map((gap, i) => (
              <div key={i} className="relative group">
                <textarea
                  value={gap}
                  onChange={(e) => handleGapChange(i, e.target.value)}
                  rows={2}
                  className="w-full p-4 bg-white border border-red-50 rounded-2xl focus:ring-2 focus:ring-red-400 outline-none text-sm text-slate-700 shadow-sm"
                  placeholder="תאר את הפער..."
                />
                <button 
                  onClick={() => removeGap(i)}
                  className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-md"
                >
                  ✕
                </button>
              </div>
            ))}
            <button 
              onClick={addGap}
              className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-400 font-bold rounded-2xl active:bg-slate-100 text-sm"
            >
              + הוסף פער ידנית
            </button>
          </>
        )}
      </div>

      <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-50 pointer-events-auto">
        <button 
          onClick={handleProceed}
          disabled={loading || gaps.length === 0}
          className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl ${
            gaps.length > 0 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'
          }`}
        >
          ניתוח שורש ומסקנות 🎯
        </button>
      </div>
    </div>
  );
};

export default Step2Gaps;
