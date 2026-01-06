
import React, { useState } from 'react';

interface Props {
  ingredients: string[];
  onAdd: (ingredient: string) => void;
  onRemove: (index: number) => void;
}

const IngredientInput: React.FC<Props> = ({ ingredients, onAdd, onRemove }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <i className="fas fa- refrigerator text-orange-500"></i>
        냉장고 속 재료
      </h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="재료를 입력하세요 (예: 계란)"
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
        <button
          onClick={handleAdd}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          추가
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {ingredients.length === 0 ? (
          <p className="text-slate-400 text-sm italic">재료가 비어있습니다. 요리에 필요한 재료를 추가해주세요.</p>
        ) : (
          ingredients.map((item, index) => (
            <span
              key={index}
              className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm border border-orange-100 flex items-center gap-2 group"
            >
              {item}
              <button
                onClick={() => onRemove(index)}
                className="text-orange-300 hover:text-orange-600 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default IngredientInput;
