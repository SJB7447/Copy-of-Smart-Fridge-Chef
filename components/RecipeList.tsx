
import React from 'react';
import { Recipe } from '../types';

interface Props {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
}

const RecipeList: React.FC<Props> = ({ recipes, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {recipes.map((recipe, index) => (
        <div
          key={index}
          onClick={() => onSelect(recipe)}
          className="group bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="h-48 bg-slate-200 relative overflow-hidden">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.recipeName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                <i className="fas fa-circle-notch fa-spin text-2xl mb-2"></i>
                <span className="text-xs font-semibold">사진 생성 중...</span>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
              <i className="far fa-clock mr-1 text-orange-500"></i>
              {recipe.cookingTime}
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{recipe.recipeName}</h3>
            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">
              {recipe.description}
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-orange-600">
              <span className="bg-orange-50 px-2 py-1 rounded">재료 {recipe.ingredients.length}개</span>
              <span className="text-slate-400 group-hover:text-orange-500 transition-colors">자세히 보기 <i className="fas fa-chevron-right ml-1"></i></span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeList;
