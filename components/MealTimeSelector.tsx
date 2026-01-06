
import React from 'react';
import { MealTime } from '../types';

interface Props {
  selected: MealTime;
  onChange: (time: MealTime) => void;
}

const MealTimeSelector: React.FC<Props> = ({ selected, onChange }) => {
  const options = [
    { value: MealTime.BREAKFAST, icon: 'fa-sun', label: '아침', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
    { value: MealTime.LUNCH, icon: 'fa-cloud-sun', label: '점심', color: 'bg-orange-50 text-orange-600 border-orange-200' },
    { value: MealTime.DINNER, icon: 'fa-moon', label: '저녁', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <i className="fas fa-clock text-blue-500"></i>
        식사 시간 선택
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              selected === opt.value
                ? `${opt.color.replace('border-', 'border-')} ring-4 ring-offset-2 ring-opacity-20`
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <i className={`fas ${opt.icon} text-2xl`}></i>
            <span className="font-semibold">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MealTimeSelector;
