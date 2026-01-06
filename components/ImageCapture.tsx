
import React, { useRef, useState } from 'react';

interface Props {
  onIngredientsFound: (ingredients: string[]) => void;
  onScanningStateChange: (isScanning: boolean) => void;
  identifyIngredientsFromImage: (base64: string, mime: string) => Promise<string[]>;
}

const ImageCapture: React.FC<Props> = ({ onIngredientsFound, onScanningStateChange, identifyIngredientsFromImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onScanningStateChange(true);
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      const cleanedBase64 = base64.split(',')[1];
      const ingredients = await identifyIngredientsFromImage(cleanedBase64, file.type);
      onIngredientsFound(ingredients);
    } catch (err: any) {
      setError("이미지 분석에 실패했습니다.");
      console.error(err);
    } finally {
      onScanningStateChange(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col justify-center items-center text-center">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <i className="fas fa-camera text-blue-500"></i>
        냉장고 사진 촬영/분석
      </h2>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-full aspect-video border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all group"
      >
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-100 transition-colors">
          <i className="fas fa-cloud-upload-alt text-2xl text-slate-400 group-hover:text-orange-500"></i>
        </div>
        <p className="font-bold text-slate-600 group-hover:text-orange-600">냉장고 사진 찍기</p>
        <p className="text-xs text-slate-400 mt-1">파일을 선택하거나 직접 촬영하세요</p>
      </div>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-xs text-red-500 font-medium">
          <i className="fas fa-exclamation-triangle mr-1"></i>
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageCapture;
