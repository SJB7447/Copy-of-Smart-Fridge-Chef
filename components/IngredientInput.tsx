
import React, { useState } from 'react';

interface Props {
  ingredients: string[];
  onAdd: (ingredient: string) => void;
  onRemove: (index: number) => void;
}

const IngredientInput: React.FC<Props> = ({ ingredients, onAdd, onRemove }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-[#bdc3c7] uppercase tracking-[0.2em] mb-4">Mise en place (재료 준비)</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter' && inputValue.trim()) { onAdd(inputValue.trim()); setInputValue(''); } }}
          placeholder="오늘 어떤 재료가 준비되어 있나요?"
          className="flex-1 bg-[#f9f7f2] px-6 py-4 rounded-2xl border-2 border-transparent focus:border-[#4a5d4e] focus:bg-white outline-none transition-all text-sm font-serif-kr"
        />
        <button
          onClick={() => { if (inputValue.trim()) { onAdd(inputValue.trim()); setInputValue(''); } }}
          className="bg-[#2c3e50] hover:bg-[#1a252f] text-white w-14 rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-[#2c3e50]/20"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        {ingredients.length === 0 ? (
          <p className="text-[#bdc3c7] text-xs italic py-4">식재료를 추가하거나 냉장고를 스캔해 보세요.</p>
        ) : (
          ingredients.map((item, index) => (
            <span
              key={index}
              className="bg-white text-[#4a5d4e] px-4 py-2 rounded-full text-xs font-bold border border-[#f0eee4] shadow-sm flex items-center gap-2 animate-in zoom-in duration-300"
            >
              {item}
              <button onClick={() => onRemove(index)} className="hover:text-red-500 transition-colors"><i className="fas fa-times"></i></button>
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default IngredientInput;
