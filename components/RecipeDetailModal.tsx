
import React, { useState } from 'react';
import { Recipe, Store } from '../types';
import { searchNearbyMarts } from '../services/geminiService';

interface Props {
  recipe: Recipe | null;
  onClose: () => void;
  onSave?: (recipe: Recipe) => void;
  isSaved?: boolean;
}

const RecipeDetailModal: React.FC<Props> = ({ recipe, onClose, onSave, isSaved = false }) => {
  const [nearbyStores, setNearbyStores] = useState<Store[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  if (!recipe) return null;

  const missingIngredients = recipe.ingredients.filter(ing => !ing.isAvailable);
  const availableIngredients = recipe.ingredients.filter(ing => ing.isAvailable);

  const findStores = () => {
    setIsSearching(true);
    if (!navigator.geolocation) {
      alert("위치 정보를 지원하지 않는 브라우저입니다.");
      setIsSearching(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const stores = await searchNearbyMarts(pos.coords.latitude, pos.coords.longitude);
      setNearbyStores(stores);
      setIsSearching(false);
    }, (err) => {
      console.error(err);
      alert("위치 정보를 가져올 수 없습니다. 권한을 확인해 주세요.");
      setIsSearching(false);
    });
  };

  const copyShoppingList = () => {
    const list = missingIngredients.map(ing => `- ${ing.name}`).join('\n');
    const text = `[셰프의 장바구니 리스트]\n요리: ${recipe.recipeName}\n필요한 재료:\n${list}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const getOnlineLinks = (name: string) => [
    { label: '쿠팡', url: `https://www.coupang.com/np/search?q=${encodeURIComponent(name)}`, icon: 'fa-shopping-cart' },
    { label: '컬리', url: `https://www.kurly.com/search?searchTerm=${encodeURIComponent(name)}`, icon: 'fa-leaf' },
    { label: 'SSG', url: `https://www.ssg.com/search.ssg?query=${encodeURIComponent(name)}`, icon: 'fa-truck' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/80 backdrop-blur-md overflow-hidden">
      <div className="bg-[#fdfcf9] rounded-[2.5rem] shadow-2xl w-full max-w-5xl h-[92vh] overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-10 duration-500">
        
        {/* Left Side: Visuals & Quick Info */}
        <div className="md:w-5/12 h-64 md:h-full relative bg-[#e0dcd0]">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.recipeName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#95a5a6]"><i className="fas fa-hat-chef text-6xl"></i></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
          
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <div className="mb-2 inline-flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest">Master Recipe</span>
              <span className="bg-[#4a5d4e] px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest">{recipe.cuisineType}</span>
            </div>
            <h2 className="text-3xl font-serif-kr font-black mb-4 leading-tight">{recipe.recipeName}</h2>
            <div className="flex gap-3">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold"><i className="fas fa-clock mr-1 text-[#f1c40f]"></i> {recipe.cookingTime}</span>
              {recipe.calories && <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold"><i className="fas fa-fire mr-1 text-[#e67e22]"></i> {recipe.calories}</span>}
            </div>
          </div>

          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white transition-all border border-white/20"><i className="fas fa-times"></i></button>
        </div>

        {/* Right Side: Detailed Content */}
        <div className="md:w-7/12 flex flex-col h-full bg-white relative">
          <div className="overflow-y-auto p-8 md:p-12 custom-scrollbar flex-1 bg-white">
            
            {/* Header description */}
            <div className="mb-10">
              <p className="text-[#4a5d4e] font-serif-kr italic text-lg leading-relaxed mb-6">"{recipe.description}"</p>
              <div className="flex justify-between items-center gap-4">
                {onSave && (
                  <button onClick={() => onSave(recipe)} className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${isSaved ? 'bg-[#4a5d4e] text-white shadow-lg shadow-[#4a5d4e]/30' : 'border-2 border-[#4a5d4e] text-[#4a5d4e] hover:bg-[#4a5d4e] hover:text-white'}`}>
                    <i className={`${isSaved ? 'fas' : 'far'} fa-bookmark`}></i> {isSaved ? '셰프의 비밀 노트에 보관 중' : '비밀 레시피북에 저장'}
                  </button>
                )}
                {missingIngredients.length > 0 && (
                  <button onClick={copyShoppingList} className={`text-xs font-bold flex items-center gap-2 transition-all ${copyFeedback ? 'text-green-600' : 'text-[#95a5a6] hover:text-[#4a5d4e]'}`}>
                    <i className={`fas ${copyFeedback ? 'fa-check' : 'fa-copy'}`}></i> {copyFeedback ? '리스트 복사됨!' : '장바구니 리스트 복사'}
                  </button>
                )}
              </div>
            </div>

            {/* Missing Ingredients Section */}
            {missingIngredients.length > 0 && (
              <section className="mb-12">
                <h3 className="text-xl font-serif-kr font-bold text-[#c0392b] mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-[#c0392b] rounded-full"></span> Grocery List <span className="text-xs text-[#bdc3c7] font-sans font-normal uppercase tracking-widest">(준비가 필요한 재료)</span>
                </h3>
                <div className="space-y-4">
                  {missingIngredients.map((ing, i) => (
                    <div key={i} className="bg-[#fff5f5] border border-[#fbeaea] p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-[#c0392b] flex items-center gap-2">
                          <i className="fas fa-shopping-basket"></i> {ing.name}
                        </span>
                        <span className="text-[10px] text-[#e74c3c] font-bold uppercase tracking-widest">부족함</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getOnlineLinks(ing.name).map((link, idx) => (
                          <a 
                            key={idx} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white border border-[#fbeaea] hover:border-[#e74c3c] px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#7f8c8d] hover:text-[#e74c3c] transition-all flex items-center gap-2"
                          >
                            <i className={`fas ${link.icon}`}></i> {link.label}에서 찾기
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-6 bg-[#f8f9fa] rounded-3xl border-2 border-dashed border-[#e9ecef] text-center">
                  <p className="text-sm text-[#7f8c8d] mb-4 font-serif-kr italic">"신선한 재료는 최고의 요리를 만드는 첫 번째 비법입니다."</p>
                  <button 
                    onClick={findStores} 
                    disabled={isSearching}
                    className="bg-[#2c3e50] hover:bg-[#1a252f] text-white px-8 py-3 rounded-full text-sm font-bold transition-all shadow-lg shadow-[#2c3e50]/20 flex items-center gap-2 mx-auto"
                  >
                    {isSearching ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-map-marker-alt"></i>}
                    내 주변 신선 매장 찾기 (오프라인)
                  </button>

                  {nearbyStores.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 gap-2 text-left">
                      {nearbyStores.map((s, i) => (
                        <a 
                          key={i} 
                          href={s.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#e9ecef] hover:border-[#4a5d4e] hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#f4f7f5] rounded-full flex items-center justify-center text-[#4a5d4e] group-hover:bg-[#4a5d4e] group-hover:text-white transition-colors">
                              <i className="fas fa-store text-xs"></i>
                            </div>
                            <span className="text-sm font-bold text-[#2c3e50]">{s.name}</span>
                          </div>
                          <i className="fas fa-external-link-alt text-[#bdc3c7] group-hover:text-[#4a5d4e] text-xs transition-colors"></i>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Available Ingredients Section */}
            {availableIngredients.length > 0 && (
              <section className="mb-12">
                <h3 className="text-xl font-serif-kr font-bold text-[#4a5d4e] mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-[#4a5d4e] rounded-full"></span> Mise en place <span className="text-xs text-[#bdc3c7] font-sans font-normal uppercase tracking-widest">(준비된 재료)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableIngredients.map((ing, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#e0e8e2] bg-[#f4f7f5] text-[#2c3e50] text-sm">
                      <i className="fas fa-check-circle text-[#4a5d4e]"></i>
                      <span className="font-medium">{ing.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Chef's Tips Section */}
            {recipe.chefTips && recipe.chefTips.length > 0 && (
              <section className="mb-12 p-6 bg-[#fdfaf0] border border-[#f5eeda] rounded-3xl relative overflow-hidden">
                <div className="absolute -top-4 -right-4 text-[#f5eeda] opacity-50"><i className="fas fa-quote-right text-6xl"></i></div>
                <h3 className="text-lg font-serif-kr font-bold text-[#856404] mb-4 flex items-center gap-2">
                  <i className="fas fa-lightbulb"></i> Chef's Secret Tips (셰프의 조언)
                </h3>
                <ul className="space-y-3">
                  {recipe.chefTips.map((tip, i) => (
                    <li key={i} className="text-[#856404] text-sm flex gap-3 leading-relaxed">
                      <span className="text-[#d4ac0d] flex-shrink-0 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Steps Section */}
            <section className="pb-12">
              <h3 className="text-xl font-serif-kr font-bold text-[#2c3e50] mb-8 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-[#4a5d4e] rounded-full"></span> Detailed Method <span className="text-xs text-[#bdc3c7] font-sans font-normal uppercase tracking-widest">(상세 조리 가이드)</span>
              </h3>
              <div className="space-y-12">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                      <span className="flex-shrink-0 w-12 h-12 rounded-[1.25rem] bg-[#f4f7f5] text-[#4a5d4e] flex items-center justify-center font-serif-kr font-black text-xl group-hover:bg-[#4a5d4e] group-hover:text-white transition-all duration-300 shadow-sm">
                        {i + 1}
                      </span>
                      {i < recipe.steps.length - 1 && <div className="w-0.5 flex-1 bg-[#f0f1f2] my-3"></div>}
                    </div>
                    <p className="text-[#576574] leading-relaxed pt-2 text-base group-hover:text-[#2c3e50] transition-colors">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
          <div className="p-8 border-t border-[#f0f1f2] flex justify-center bg-white/95 backdrop-blur sticky bottom-0 z-10">
            <button onClick={onClose} className="bg-[#2c3e50] text-white px-20 py-4 rounded-full font-bold text-base hover:bg-[#1a252f] transition-all shadow-xl shadow-[#2c3e50]/20 active:scale-95">셰프의 지침을 완벽히 이해했습니다</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailModal;
