
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const INITIAL_DATA = [
  { name: 'תכנון', value: 3.5 },
  { name: 'ביצוע', value: 2.8 },
  { name: 'תקשורת', value: 4.2 },
  { name: 'כלים', value: 1.5 },
];

const SurveyEngine: React.FC = () => {
  const [data, setData] = useState(INITIAL_DATA);
  const [comment, setComment] = useState('');

  const handleVote = (index: number, val: number) => {
    const newData = [...data];
    newData[index].value = (newData[index].value + val) / 2;
    setData(newData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800">מנוע סקרים וחוות דעת</h2>
          <p className="text-sm text-slate-500">שתף את הצוות וקבל משוב רוחבי על האירוע</p>
        </div>
        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">פעיל</div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          {data.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>{item.name}</span>
                <span>{item.value.toFixed(1)} / 5</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => handleVote(i, star)}
                    className={`w-full h-8 rounded border transition-all ${Math.round(item.value) >= star ? 'bg-blue-600 border-blue-600 text-white' : 'hover:bg-blue-50 border-slate-200'}`}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4">
            <label className="block text-sm font-bold mb-2">הערות נוספות מגורמים חיצוניים</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border rounded-lg h-24 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="כתוב כאן הערה..."
            />
            <button className="mt-2 w-full bg-slate-100 hover:bg-slate-200 p-2 rounded-lg font-bold text-sm transition-colors">שלח הערה</button>
          </div>
        </div>

        <div className="h-64 md:h-full min-h-[300px]">
          <h3 className="text-center text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">מפת שביעות רצון</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 5]} hide />
              <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value < 2.5 ? '#ef4444' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SurveyEngine;
