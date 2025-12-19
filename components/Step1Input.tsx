
import React from 'react';
import { DebriefData } from '../types';

interface Props {
  data: Partial<DebriefData>;
  updateData: (updates: Partial<DebriefData>) => void;
  onNext: () => void;
}

const Step1Input: React.FC<Props> = ({ data, updateData, onNext }) => {
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

  const isComplete = data.title && data.whatWasPlanned && data.whatHappened;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-slate-400 tracking-wider">נושא האירוע</label>
        <input
          value={data.title || ''}
          onChange={(e) => updateData({ title: e.target.value })}
          className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-bold text-slate-800 shadow-sm"
          placeholder="מה קרה?"
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-blue-500 tracking-wider">מה תוכנן?</label>
          <textarea
            value={data.whatWasPlanned || ''}
            onChange={(e) => updateData({ whatWasPlanned: e.target.value })}
            rows={4}
            className="w-full p-4 bg-white border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 shadow-sm"
            placeholder="היעד, הזמנים, המשאבים..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-emerald-500 tracking-wider">מה היה בפועל?</label>
          <textarea
            value={data.whatHappened || ''}
            onChange={(e) => updateData({ whatHappened: e.target.value })}
            rows={4}
            className="w-full p-4 bg-white border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-700 shadow-sm"
            placeholder="מה קרה באמת?"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-slate-400 tracking-wider">קבצים ונספחים</label>
        <div className="flex flex-wrap gap-2">
          {data.images?.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border">
              <img src={img} className="w-full h-full object-cover" />
              <button 
                onClick={() => updateData({ images: data.images?.filter((_, idx) => idx !== i) })}
                className="absolute inset-0 bg-red-500/80 text-white opacity-0 active:opacity-100 flex items-center justify-center font-bold text-[10px]"
              >
                הסר
              </button>
            </div>
          ))}
          <label className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-white text-slate-300">
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
            isComplete ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'
          }`}
        >
          ניתוח פערים בבינה מלאכותית 🤖
        </button>
      </div>
    </div>
  );
};

export default Step1Input;
