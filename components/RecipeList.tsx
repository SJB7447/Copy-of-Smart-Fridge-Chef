
import React from 'react';
import { Recipe } from '../types';

interface Props {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
}

const RecipeList: React.FC<Props> = ({ recipes, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {recipes.map((recipe, index) => (
        <div
          key={index}
          onClick={() => onSelect(recipe)}
          className="group cursor-pointer"
        >
          <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden mb-4 shadow-xl shadow-[#e0dcd0]/50 transition-transform duration-500 group-hover:-translate-y-2">
            {recipe.imageUrl ? (
              <img src={recipe.imageUrl} alt={recipe.recipeName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#f0eee4] flex flex-col items-center justify-center text-[#bdc3c7]">
                <i className="fas fa-hat-chef text-4xl mb-3 animate-bounce"></i>
                <span className="text-xs font-bold tracking-widest uppercase">Preparing...</span>
              </div>
            )}
            {/* Cuisine Type Badge */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-[#4a5d4e] shadow-sm uppercase tracking-tighter">
                Chef's Pick
              </div>
              <div className="bg-[#2c3e50]/80 backdrop-blur px-3 py-1 rounded-full text-[9px] font-bold text-white shadow-sm tracking-wide">
                {recipe.cuisineType}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
              <span className="text-white font-serif-kr text-lg">레시피 보기 <i className="fas fa-arrow-right ml-2 text-sm"></i></span>
            </div>
          </div>
          <h3 className="text-xl font-serif-kr font-bold text-[#2c3e50] group-hover:text-[#4a5d4e] transition-colors mb-1 truncate px-2">
            {recipe.recipeName}
          </h3>
          <p className="text-[#95a5a6] text-sm line-clamp-2 px-2 italic">"{recipe.description}"</p>
        </div>
      ))}
    </div>
  );
};

export default RecipeList;
