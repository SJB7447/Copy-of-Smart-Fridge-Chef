
import React, { useState } from 'react';
import { Recipe, Store } from '../types';
import { searchNearbyMarts } from '../services/geminiService';

interface Props {
  recipe: Recipe | null;
  onClose: () => void;
}

const RecipeDetailModal: React.FC<Props> = ({ recipe, onClose }) => {
  const [nearbyStores, setNearbyStores] = useState<Store[]>([]);
  const [isSearchingStores, setIsSearchingStores] = useState(false);

  if (!recipe) return null;

  const handleOnlineBuy = (ingredientName: string) => {
    const url = `https://www.coupang.com/np/search?q=${encodeURIComponent(ingredientName)}`;
    window.open(url, '_blank');
  };

  const handleFindNearbyMarts = () => {
    setIsSearchingStores(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const stores = await searchNearbyMarts(position.coords.latitude, position.coords.longitude);
          setNearbyStores(stores);
          setIsSearchingStores(false);
        },
        (error) => {
          console.error(error);
          alert("위치 정보를 가져올 수 없습니다.");
          setIsSearchingStores(false);
        }
      );
    } else {
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
      setIsSearchingStores(false);
    }
  };

  const missingIngredients = recipe.ingredients.filter(ing => !ing.isAvailable);
  const availableIngredients = recipe.ingredients.filter(ing => ing.isAvailable);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header Image */}
        <div className="relative h-64 flex-shrink-0 bg-slate-200">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.recipeName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <i className="fas fa-utensils text-4xl"></i>
            </div>
          )}
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center">
            <i className="fas fa-times text-lg"></i>
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent">
            <h2 className="text-2xl font-bold text-white leading-tight">{recipe.recipeName}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
          <div className="flex gap-3 mb-6">
            <div className="flex items-center gap-2 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-100 text-sm">
              <i className="fas fa-hourglass-half text-orange-500"></i>
              <span>{recipe.cookingTime}</span>
            </div>
            {recipe.calories && (
              <div className="flex items-center gap-2 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-100 text-sm">
                <i className="fas fa-fire text-red-500"></i>
                <span>{recipe.calories}</span>
              </div>
            )}
          </div>

          {/* Ingredients Section */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-shopping-basket text-green-600"></i>
              식재료 현황
            </h3>
            
            <div className="space-y-4">
              {/* Available */}
              {availableIngredients.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">냉장고에 있어요</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availableIngredients.map((ing, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-600 bg-green-50/50 p-2 rounded-lg text-sm border border-green-100">
                        <i className="fas fa-check-circle text-green-500"></i>
                        {ing.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing */}
              {missingIngredients.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">구매가 필요해요</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {missingIngredients.map((ing, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 text-red-700 bg-red-50/50 p-2 pl-3 rounded-lg text-sm border border-red-100">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-exclamation-circle text-red-500"></i>
                          {ing.name}
                        </div>
                        <button 
                          onClick={() => handleOnlineBuy(ing.name)}
                          className="bg-white hover:bg-red-100 text-red-600 text-[10px] font-bold py-1 px-2 rounded border border-red-200 transition-colors flex items-center gap-1"
                        >
                          <i className="fas fa-shopping-cart"></i> 온라인 구매
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={handleFindNearbyMarts}
                    disabled={isSearchingStores}
                    className="w-full mt-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-100 transition-all flex items-center justify-center gap-2"
                  >
                    {isSearchingStores ? (
                      <><i className="fas fa-spinner fa-spin"></i> 주변 마트 찾는 중...</>
                    ) : (
                      <><i className="fas fa-map-marker-alt"></i> 내 주변 마트/슈퍼 찾기</>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Nearby Stores Result */}
            {nearbyStores.length > 0 && (
              <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <i className="fas fa-store text-indigo-500"></i> 검색된 주변 매장
                </h4>
                <div className="space-y-2">
                  {nearbyStores.map((store, i) => (
                    <a 
                      key={i} 
                      href={store.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 hover:border-indigo-300 hover:shadow-sm transition-all text-sm group"
                    >
                      <span className="font-medium text-slate-600">{store.name}</span>
                      <i className="fas fa-external-link-alt text-slate-300 group-hover:text-indigo-500"></i>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Steps Section */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-orange-500 pl-3">조리 순서</h3>
            <div className="space-y-4">
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                    {i + 1}
                  </span>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-8 rounded-xl transition-colors">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailModal;
