
import React from 'react';
import { DebriefData, WhatHappenedStructured } from '../types';

interface Props {
  data: Partial<DebriefData>;
  updateData: (updates: Partial<DebriefData>) => void;
  onNext: () => void;
}

const Step1Input: React.FC<Props> = ({ data, updateData, onNext }) => {
  // Initialize structured data if not present
  const actual = (typeof data.whatHappened === 'object' ? data.whatHappened : {
    process: '',
    result: '',
    atmosphere: '',
    resources: '',
    safety: '',
    other: ''
  }) as WhatHappenedStructured;

  const handleActualChange = (field: keyof WhatHappenedStructured, value: string) => {
    updateData({
      whatHappened: { ...actual, [field]: value }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateData({
            images: [...(data.images || []), event.target.result as string]
          });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const isComplete = data.title && data.whatWasPlanned && 
                    (actual.process || actual.result || actual.atmosphere);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-32">
      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-slate-400 tracking-wider">נושא האירוע</label>
        <input
          value={data.title || ''}
          onChange={(e) => updateData({ title: e.target.value })}
          className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-bold text-slate-800 shadow-sm transition-all"
          placeholder="מה קרה? (למשל: תקלה ביום השיווק)"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-blue-500 tracking-wider">מה תוכנן? (יעדים ושאיפה)</label>
        <textarea
          value={data.whatWasPlanned || ''}
          onChange={(e) => updateData({ whatWasPlanned: e.target.value })}
          rows={3}
          className="w-full p-4 bg-white border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 shadow-sm"
          placeholder="היעד המקורי, הזמנים, המשאבים שהוקצו..."
        />
      </div>

      <div className="space-y-4">
        <label className="text-xs font-black uppercase text-slate-900 tracking-wider">מה היה בפועל? (פירוט קטגוריות)</label>
        
        <div className="grid gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">⚙️ תהליך</span>
            <textarea
              value={actual.process}
              onChange={(e) => handleActualChange('process', e.target.value)}
              className="w-full p-3 bg-white border border-slate-100 rounded-xl text-sm outline-none focus:border-slate-900 shadow-sm"
              placeholder="איך דברים התנהלו בפועל?"
              rows={2}
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">📊 תוצאה</span>
            <textarea
              value={actual.result}
              onChange={(e) => handleActualChange('result', e.target.value)}
              className="w-full p-3 bg-white border border-slate-100 rounded-xl text-sm outline-none focus:border-slate-900 shadow-sm"
              placeholder="מה היו התוצאות הסופיות המספריות/ממשיות?"
              rows={2}
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">🎭 אווירה ומורל</span>
            <textarea
              value={actual.atmosphere}
              onChange={(e) => handleActualChange('atmosphere', e.target.value)}
              className="w-full p-3 bg-white border border-slate-100 rounded-xl text-sm outline-none focus:border-slate-900 shadow-sm"
              placeholder="איך הצוות הרגיש? היה מתח? שיתוף פעולה?"
              rows={2}
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">🎒 משאבים</span>
            <textarea
              value={actual.resources}
              onChange={(e) => handleActualChange('resources', e.target.value)}
              className="w-full p-3 bg-white border border-slate-100 rounded-xl text-sm outline-none focus:border-slate-900 shadow-sm"
              placeholder="ציוד, תקציב, כוח אדם - מה היה חסר או עודף?"
              rows={2}
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">🛡️ בטיחות</span>
            <textarea
              value={actual.safety}
              onChange={(e) => handleActualChange('safety', e.target.value)}
              className="w-full p-3 bg-white border border-slate-100 rounded-xl text-sm outline-none focus:border-slate-900 shadow-sm"
              placeholder="האם היו אירועי בטיחות או כמעט ונפגע?"
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-slate-400 tracking-wider">קבצים ונספחים</label>
        <div className="flex flex-wrap gap-2">
          {data.images?.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border">
              <img src={img} className="w-full h-full object-cover" alt="attachment" />
              <button 
                onClick={() => updateData({ images: data.images?.filter((_, idx) => idx !== i) })}
                className="absolute inset-0 bg-red-500/80 text-white opacity-0 active:opacity-100 flex items-center justify-center font-bold text-[10px]"
              >
                הסר
              </button>
            </div>
          ))}
          <label className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-white text-slate-300 cursor-pointer active:bg-slate-50">
            <span className="text-xl">+</span>
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
          </label>
        </div>
      </div>

      <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-50 pointer-events-auto">
        <button 
          onClick={onNext}
          disabled={!isComplete}
          className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-2 ${
            isComplete ? 'bg-slate-900 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          ניתוח פערים חכם 🤖
        </button>
      </div>
    </div>
  );
};

export default Step1Input;
