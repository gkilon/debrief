
import React, { useState } from 'react';
import { DebriefData, DebriefStatus } from '../types';

interface Props {
  onSave: (data: Partial<DebriefData>) => void;
}

const DebriefForm: React.FC<Props> = ({ onSave }) => {
  const [formData, setFormData] = useState<Partial<DebriefData>>({
    title: '',
    whatWasPlanned: '',
    whatHappened: '',
    gaps: [''],
    conclusions: [''],
    images: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleListChange = (index: number, value: string, type: 'gaps' | 'conclusions') => {
    const newList = [...(formData[type] || [])];
    newList[index] = value;
    setFormData({ ...formData, [type]: newList });
  };

  const addItem = (type: 'gaps' | 'conclusions') => {
    setFormData({ ...formData, [type]: [...(formData[type] || []), ''] });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData({
            ...formData,
            images: [...(formData.images || []), event.target.result as string]
          });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-8">
      <div className="space-y-4">
        <label className="block text-sm font-bold text-slate-700">נושא התחקיר</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="למשל: תקלה בתהליך הייצור בקו א'"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-blue-600">מה תוכנן? (שאיפה)</label>
          <textarea
            name="whatWasPlanned"
            value={formData.whatWasPlanned}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="תאר את התכנון המקורי והיעדים..."
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-bold text-green-600">מה היה בפועל?</label>
          <textarea
            name="whatHappened"
            value={formData.whatHappened}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="תאר את השתלשלות האירועים במציאות..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-bold text-red-600">איפה הפערים? (ניתוח)</label>
          <button onClick={() => addItem('gaps')} className="text-xs text-blue-600 font-bold">+ הוסף פער</button>
        </div>
        {formData.gaps?.map((gap, i) => (
          <input
            key={i}
            value={gap}
            onChange={(e) => handleListChange(i, e.target.value, 'gaps')}
            className="w-full p-2 border-b focus:border-blue-500 outline-none transition-all"
            placeholder={`פער ${i + 1}`}
          />
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-bold text-slate-800">תובנות ומסקנות אופרטיביות</label>
          <button onClick={() => addItem('conclusions')} className="text-xs text-blue-600 font-bold">+ הוסף מסקנה</button>
        </div>
        {formData.conclusions?.map((conc, i) => (
          <input
            key={i}
            value={conc}
            onChange={(e) => handleListChange(i, e.target.value, 'conclusions')}
            className="w-full p-2 border-b focus:border-blue-500 outline-none transition-all"
            placeholder={`מסקנה ${i + 1}`}
          />
        ))}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-bold text-slate-700">צירוף קבצים ותמונות</label>
        <div className="flex flex-wrap gap-4">
          {formData.images?.map((img, i) => (
            <div key={i} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
              <img src={img} alt="Evidence" className="w-full h-full object-cover" />
              <button 
                onClick={() => setFormData({...formData, images: formData.images?.filter((_, idx) => idx !== i)})}
                className="absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold"
              >
                מחק
              </button>
            </div>
          ))}
          <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors bg-slate-50">
            <span className="text-2xl text-slate-400">+</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">העלה</span>
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
          </label>
        </div>
      </div>

      <div className="pt-6 border-t flex justify-end">
        <button 
          onClick={() => onSave(formData)}
          className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-all shadow-md"
        >
          שמירה והמשך לניתוח AI
        </button>
      </div>
    </div>
  );
};

export default DebriefForm;
