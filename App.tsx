
import React, { useState } from 'react';
import { MealTime, Recipe } from './types';
import IngredientInput from './components/IngredientInput';
import MealTimeSelector from './components/MealTimeSelector';
import RecipeList from './components/RecipeList';
import RecipeDetailModal from './components/RecipeDetailModal';
import ImageCapture from './components/ImageCapture';
import { generateRecipes, identifyIngredientsFromImage, generateRecipeImage } from './services/geminiService';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [mealTime, setMealTime] = useState<MealTime>(MealTime.LUNCH);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("레시피 생성 중...");

  const handleAddIngredient = (item: string) => {
    if (!ingredients.includes(item)) {
      setIngredients([...ingredients, item]);
    }
  };

  const handleBatchAddIngredients = (newIngredients: string[]) => {
    const uniqueNewOnes = newIngredients.filter(item => !ingredients.includes(item));
    if (uniqueNewOnes.length > 0) {
      setIngredients(prev => [...prev, ...uniqueNewOnes]);
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSuggest = async () => {
    if (ingredients.length === 0) {
      alert("냉장고 재료를 하나 이상 입력해주세요!");
      return;
    }

    setLoading(true);
    setLoadingMessage("AI가 맛있는 레시피를 구상하고 있습니다...");
    setError(null);
    setRecipes([]);

    try {
      // Step 1: Generate text recipes
      const textRecipes = await generateRecipes(ingredients, mealTime);
      setRecipes(textRecipes); // Show text early if possible or wait

      // Step 2: Generate images for each recipe
      setLoadingMessage("요리 완성 사진을 생성하고 있습니다...");
      const recipesWithImages = await Promise.all(
        textRecipes.map(async (recipe) => {
          const imageUrl = await generateRecipeImage(recipe.recipeName, recipe.description);
          return { ...recipe, imageUrl };
        })
      );
      
      setRecipes(recipesWithImages);
    } catch (err: any) {
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Scanning Overlay */}
      {scanning && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-4 border-orange-500 rounded-2xl animate-pulse"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-orange-400 animate-[bounce_2s_infinite] shadow-[0_0_15px_rgba(251,146,60,0.8)]"></div>
            <div className="flex items-center justify-center h-full">
              <i className="fas fa-search text-5xl text-orange-400"></i>
            </div>
          </div>
          <h2 className="text-2xl font-black mb-2">냉장고 스캔 중...</h2>
          <p className="text-slate-300 font-medium">AI가 식재료를 파악하고 있습니다.</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
              <i className="fas fa-utensils text-lg"></i>
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">스마트 냉장고 셰프</h1>
          </div>
          <div className="hidden sm:block text-slate-400 text-sm font-medium">실시간 AI 요리 사진 생성</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
             <ImageCapture 
                onIngredientsFound={handleBatchAddIngredients} 
                onScanningStateChange={setScanning}
                identifyIngredientsFromImage={identifyIngredientsFromImage}
              />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <IngredientInput
              ingredients={ingredients}
              onAdd={handleAddIngredient}
              onRemove={handleRemoveIngredient}
            />
            <MealTimeSelector
              selected={mealTime}
              onChange={setMealTime}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSuggest}
            disabled={loading || scanning}
            className={`
              relative overflow-hidden group px-12 py-5 rounded-2xl font-bold text-white text-lg shadow-xl transition-all duration-300
              ${loading || scanning ? 'bg-slate-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 hover:scale-105 active:scale-95 shadow-orange-200'}
            `}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <i className="fas fa-spinner fa-spin"></i>
                {loadingMessage}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <i className="fas fa-magic"></i>
                AI 맞춤 레시피 및 사진 생성하기
              </div>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center font-medium">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        {recipes.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-slate-800 mt-12 mb-2 flex items-center gap-3">
              <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
              찾아낸 최고의 레시피
            </h2>
            <p className="text-slate-500 mb-6 font-medium">냉장고 속 재료로 만든 실제 요리 완성 예상 모습입니다.</p>
            <RecipeList recipes={recipes} onSelect={setSelectedRecipe} />
          </div>
        )}

        {!loading && !scanning && recipes.length === 0 && !error && (
          <div className="mt-20 text-center py-12 px-4">
            <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <i className="fas fa-camera-retro text-4xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-600 mb-2">냉장고 사진을 찍어보세요!</h3>
            <p className="text-slate-400 max-w-sm mx-auto">카메라로 냉장고 안을 촬영하면 AI가 자동으로 재료를 분석하고 완성 요리 사진까지 보여드립니다.</p>
          </div>
        )}
      </main>

      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />

      <footer className="mt-20 border-t border-slate-100 py-10 text-center">
        <p className="text-slate-400 text-sm">© 2024 Smart Fridge Chef AI. Powered by Gemini Multimodal & Image Generation.</p>
      </footer>
    </div>
  );
};

export default App;
