
import React, { useRef, useState } from 'react';

interface Props {
  onIngredientsFound: (ingredients: string[], imageUrl: string) => void;
  onScanningStateChange: (isScanning: boolean) => void;
  identifyIngredientsFromImage: (base64: string, mime: string) => Promise<string[]>;
  currentImage: string | null;
}

const ImageCapture: React.FC<Props> = ({ 
  onIngredientsFound, 
  onScanningStateChange, 
  identifyIngredientsFromImage,
  currentImage 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onScanningStateChange(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        const ingredients = await identifyIngredientsFromImage(base64, file.type);
        onIngredientsFound(ingredients, dataUrl);
        onScanningStateChange(false);
      };
    } catch (err: any) {
      setError("이미지를 분석할 수 없습니다.");
      onScanningStateChange(false);
    }
  };

  if (currentImage) {
    return (
      <div className="relative h-full min-h-[300px] w-full group rounded-3xl overflow-hidden shadow-inner border border-[#e0dcd0]">
        <img 
          src={currentImage} 
          alt="Captured Fridge" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
          <p className="text-white text-sm font-serif-kr italic mb-4">"이 식재료들을 바탕으로 레시피를 제안합니다"</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-white hover:text-[#2c3e50] transition-all"
          >
            <i className="fas fa-redo-alt mr-2"></i> 사진 다시 찍기
          </button>
        </div>
        <div className="absolute top-4 left-4 bg-[#4a5d4e] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
          Chef's View
        </div>
        <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      </div>
    );
  }

  return (
    <div 
      className="h-full min-h-[300px] bg-[#fcfbf7] rounded-3xl border-2 border-dashed border-[#e0dcd0] flex flex-col items-center justify-center p-8 transition-all hover:bg-white hover:border-[#4a5d4e] group cursor-pointer" 
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg shadow-black/5 mb-6 group-hover:scale-110 transition-transform duration-500">
        <i className="fas fa-camera text-2xl text-[#4a5d4e]"></i>
      </div>
      <h3 className="font-serif-kr font-black text-[#2c3e50] text-lg mb-2">냉장고 스캔</h3>
      <p className="text-[#95a5a6] text-xs leading-relaxed text-center px-4 italic">"셰프의 예리한 시선으로<br/>재료를 파악해 드립니다"</p>
      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      {error && <p className="mt-4 text-[10px] text-red-500 font-bold">{error}</p>}
    </div>
  );
};

export default ImageCapture;
