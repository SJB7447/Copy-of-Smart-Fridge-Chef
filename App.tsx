
import React, { useState, useEffect } from 'react';
import { MealTime, Recipe } from './types';
import IngredientInput from './components/IngredientInput';
import MealTimeSelector from './components/MealTimeSelector';
import RecipeList from './components/RecipeList';
import RecipeDetailModal from './components/RecipeDetailModal';
import ImageCapture from './components/ImageCapture';
import SavedRecipes from './components/SavedRecipes';
import { generateRecipes, identifyIngredientsFromImage, generateRecipeImage } from './services/geminiService';

const SAVED_RECIPES_KEY = 'smart_fridge_saved_recipes';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [mealTime, setMealTime] = useState<MealTime>(MealTime.LUNCH);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(SAVED_RECIPES_KEY);
    if (stored) setSavedRecipes(JSON.parse(stored));
  }, []);

  const handleSuggest = async () => {
    if (ingredients.length === 0) return alert("재료를 선택해 주세요.");
    setLoading(true);
    setLoadingMessage("셰프가 식재료의 조화를 고민하고 있습니다...");
    setError(null);
    setRecipes([]);

    try {
      const textRecipes = await generateRecipes(ingredients, mealTime);
      setRecipes(textRecipes);
      setLoadingMessage("요리의 완성된 모습을 캔버스에 담고 있습니다...");
      const withImages = await Promise.all(textRecipes.map(async r => ({
        ...r, imageUrl: await generateRecipeImage(r.recipeName, r.description)
      })));
      setRecipes(withImages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    if (savedRecipes.some(r => r.recipeName === recipe.recipeName)) return;
    const newList = [recipe, ...savedRecipes];
    setSavedRecipes(newList);
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(newList));
  };

  const handleDeleteSaved = (name: string) => {
    const newList = savedRecipes.filter(r => r.recipeName !== name);
    setSavedRecipes(newList);
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(newList));
  };

  const handleIngredientsFound = (newIngs: string[], imageUrl: string) => {
    setIngredients(prev => [...new Set([...prev, ...newIngs])]);
    setCapturedImage(imageUrl);
  };

  return (
    <div className="min-h-screen">
      {/* Scanning Overlay */}
      {scanning && (
        <div className="fixed inset-0 z-[100] bg-[#1a1a1a]/90 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <div className="w-24 h-24 border-2 border-white/20 rounded-full flex items-center justify-center animate-pulse">
            <i className="fas fa-hat-chef text-4xl"></i>
          </div>
          <p className="mt-6 text-xl font-serif-kr">셰프가 냉장고를 살피고 있습니다...</p>
        </div>
      )}

      {/* Hero Section */}
      <header className="pt-16 pb-12 px-4 text-center">
        <div className="inline-block px-4 py-1 bg-[#4a5d4e] text-white rounded-full text-xs font-bold mb-4 tracking-widest uppercase">
          Gourmet Secret Guide
        </div>
        <h1 className="text-5xl font-serif-kr font-black text-[#2c3e50] mb-4">Gourmet Chef's Atelier</h1>
        <p className="text-[#7f8c8d] max-w-xl mx-auto italic">"평범한 냉장고 속 재료들이 셰프의 손길을 만나 마법 같은 요리로 탄생합니다."</p>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        {/* Workspace Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-[#e0dcd0]/50 p-8 mb-12 border border-[#f0eee4]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 h-full min-h-[300px]">
              <ImageCapture 
                onIngredientsFound={handleIngredientsFound} 
                onScanningStateChange={setScanning}
                identifyIngredientsFromImage={identifyIngredientsFromImage}
                currentImage={capturedImage}
              />
            </div>
            <div className="lg:col-span-8 space-y-8">
              <IngredientInput
                ingredients={ingredients}
                onAdd={(v) => setIngredients([...ingredients, v])}
                onRemove={(i) => setIngredients(ingredients.filter((_, idx) => idx !== i))}
              />
              <MealTimeSelector
                selected={mealTime}
                onChange={setMealTime}
              />
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <button
              onClick={handleSuggest}
              disabled={loading}
              className={`
                group relative px-16 py-5 rounded-full font-serif-kr text-xl font-bold text-white transition-all duration-500
                ${loading ? 'bg-[#95a5a6] cursor-not-allowed' : 'bg-[#4a5d4e] hover:bg-[#3a4a3e] hover:scale-105 active:scale-95 shadow-lg shadow-[#4a5d4e]/30'}
              `}
            >
              {loading ? (
                <span className="flex items-center gap-3"><i className="fas fa-circle-notch fa-spin"></i> {loadingMessage}</span>
              ) : (
                <span className="flex items-center gap-3"><i className="fas fa-feather-pointed"></i> 셰프의 제안 받기</span>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {recipes.length > 0 && (
          <section className="mb-20 animate-in fade-in duration-1000">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-serif-kr font-bold text-[#2c3e50] mb-2">오늘의 특선 레시피</h2>
              <div className="w-20 h-1 bg-[#4a5d4e] mx-auto rounded-full"></div>
            </div>
            <RecipeList recipes={recipes} onSelect={setSelectedRecipe} />
          </section>
        )}

        <SavedRecipes 
          recipes={savedRecipes} 
          onSelect={setSelectedRecipe} 
          onDelete={handleDeleteSaved} 
        />
      </main>

      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onSave={handleSaveRecipe}
        isSaved={selectedRecipe ? savedRecipes.some(r => r.recipeName === selectedRecipe.recipeName) : false}
      />

      <footer className="py-20 text-center border-t border-[#e0dcd0]">
        <p className="text-[#95a5a6] text-sm font-serif-kr">Master Chef's Atelier © 2024</p>
      </footer>
    </div>
  );
};

export default App;
