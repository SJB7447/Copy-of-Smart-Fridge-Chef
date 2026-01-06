
import React from 'react';
import { MealTime } from '../types';

interface Props {
  selected: MealTime;
  onChange: (time: MealTime) => void;
}

const MealTimeSelector: React.FC<Props> = ({ selected, onChange }) => {
  const options = [
    { value: MealTime.BREAKFAST, icon: 'fa-sun', label: 'Sunrise', sub: '아침', active: 'bg-[#fef9e7] border-[#f9e79f] text-[#d4ac0d]' },
    { value: MealTime.LUNCH, icon: 'fa-cloud-sun', label: 'Midday', sub: '점심', active: 'bg-[#f4f7f5] border-[#4a5d4e] text-[#4a5d4e]' },
    { value: MealTime.DINNER, icon: 'fa-moon', label: 'Twilight', sub: '저녁', active: 'bg-[#f4f6f7] border-[#2c3e50] text-[#2c3e50]' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-[#bdc3c7] uppercase tracking-[0.2em] mb-4">Select Timing</h3>
      <div className="grid grid-cols-3 gap-4">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all duration-500 ${
              selected === opt.value
                ? `${opt.active} scale-105 shadow-lg shadow-black/5`
                : 'bg-white border-[#f0eee4] text-[#bdc3c7] hover:border-[#d5d2c1] hover:bg-[#fcfbf7]'
            }`}
          >
            <i className={`fas ${opt.icon} text-xl`}></i>
            <div className="text-center">
              <div className="font-serif-kr font-black text-sm">{opt.label}</div>
              <div className="text-[10px] opacity-60 font-bold">{opt.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MealTimeSelector;
