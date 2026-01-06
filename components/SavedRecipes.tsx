
import React from 'react';
import { Recipe } from '../types';

interface Props {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onDelete: (recipeName: string) => void;
}

const SavedRecipes: React.FC<Props> = ({ recipes, onSelect, onDelete }) => {
  if (recipes.length === 0) return null;

  return (
    <section className="mt-32 pb-20 animate-in fade-in duration-1000">
      <div className="flex items-center justify-between mb-12 border-b border-[#e0dcd0] pb-6">
        <h2 className="text-3xl font-serif-kr font-black text-[#2c3e50] flex items-center gap-4">
          <i className="fas fa-book-bookmark text-[#4a5d4e]"></i> Chef's Secret Book
        </h2>
        <span className="text-xs font-bold text-[#bdc3c7] uppercase tracking-widest">{recipes.length} Saved Creations</span>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {recipes.map((recipe, index) => (
          <div key={index} className="group relative bg-[#fdfcf9] p-4 rounded-3xl border border-[#f0eee4] shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="aspect-square rounded-2xl overflow-hidden mb-4 cursor-pointer" onClick={() => onSelect(recipe)}>
              {recipe.imageUrl ? (
                <img src={recipe.imageUrl} alt={recipe.recipeName} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
              ) : (
                <div className="w-full h-full bg-[#f4f6f7] flex items-center justify-center text-[#bdc3c7]"><i className="fas fa-hat-chef text-2xl"></i></div>
              )}
            </div>
            <h3 className="font-serif-kr font-bold text-[#2c3e50] text-sm mb-2 truncate cursor-pointer" onClick={() => onSelect(recipe)}>{recipe.recipeName}</h3>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#bdc3c7] font-bold uppercase tracking-tighter">{recipe.cookingTime}</span>
              <button onClick={() => onDelete(recipe.recipeName)} className="text-[#bdc3c7] hover:text-red-400 transition-colors"><i className="far fa-trash-alt text-xs"></i></button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SavedRecipes;
