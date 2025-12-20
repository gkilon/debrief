
import React from 'react';
import { DebriefData, WhatHappenedStructured } from '../types';

interface Props {
  data: Partial<DebriefData>;
  updateData: (updates: Partial<DebriefData>) => void;
  onNext: () => void;
}

const Step1Input: React.FC<Props> = ({ data, updateData, onNext }) => {
  const actual = (typeof data.whatHappened === 'object' ? data.whatHappened : {
    process: '', result: '', atmosphere: '', resources: '', safety: '', other: ''
  }) as WhatHappenedStructured;

  const handleActualChange = (field: keyof WhatHappenedStructured, value: string) => {
    updateData({
      whatHappened: { ...actual, [field]: value }
    });
  };

  const isComplete = data.title && data.whatWasPlanned && (actual.process || actual.result);

  const categories = [
    { id: 'process' as const, label: '⚙️ תהליך', placeholder: 'איך דברים התנהלו?' },
    { id: 'result' as const, label: '📊 תוצאה', placeholder: 'מה היו התוצאות הסופיות?' },
    { id: 'atmosphere' as const, label: '🎭 אווירה', placeholder: 'איך היה המורל והתקשורת?' },
    { id: 'resources' as const, label: '🎒 משאבים', placeholder: 'כוח אדם, תקציב, ציוד...' },
    { id: 'safety' as const, label: '🛡️ בטיחות', placeholder: 'חריגות או אירועי בטיחות?' },
    { id: 'other' as const, label: '📎 אחר', placeholder: 'דגשים נוספים...' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-32">
      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-slate-400">נושא התחקיר</label>
        <input
          value={data.title || ''}
          onChange={(e) => updateData({ title: e.target.value })}
          className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-bold"
          placeholder="כותרת האירוע"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-blue-500">מה תוכנן? (היעד)</label>
        <textarea
          value={data.whatWasPlanned || ''}
          onChange={(e) => updateData({ whatWasPlanned: e.target.value })}
          rows={3}
          className="w-full p-4 bg-white border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          placeholder="מה רצינו שיקרה?"
        />
      </div>

      <div className="space-y-4">
        <label className="text-xs font-black uppercase text-slate-900">מה היה בפועל? (המצב הקיים)</label>
        <div className="grid gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500">{cat.label}</span>
              <textarea
                value={actual[cat.id]}
                onChange={(e) => handleActualChange(cat.id, e.target.value)}
                className="w-full p-3 bg-white border border-slate-100 rounded-xl text-sm outline-none focus:border-slate-900"
                placeholder={cat.placeholder}
                rows={2}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-50">
        <button 
          onClick={onNext}
          disabled={!isComplete}
          className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all ${
            isComplete ? 'bg-slate-900 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          ניתוח פערים (AI) 🤖
        </button>
      </div>
    </div>
  );
};

export default Step1Input;
