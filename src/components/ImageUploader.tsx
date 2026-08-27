import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string, filename?: string) => void;
  selectedImage: string | null;
  onClear: () => void;
  isLoading?: boolean;
}

const SAMPLE_LEAF_IMAGES = [
  {
    name: 'Tomato Blight',
    crop: 'Tomato',
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Rice Leaf Blast',
    crop: 'Paddy / Rice',
    url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Corn Armyworm',
    crop: 'Maize / Corn',
    url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=80'
  }
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  selectedImage,
  onClear,
  isLoading
}) => {
  const { language } = useLanguage();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onImageSelected(base64, file.type, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = async (sample: typeof SAMPLE_LEAF_IMAGES[0]) => {
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onImageSelected(base64, blob.type || 'image/jpeg', `${sample.crop}_Sample.jpg`);
      };
      reader.readAsDataURL(blob);
    } catch {
      onImageSelected(sample.url, 'image/jpeg', `${sample.crop}_Sample.jpg`);
    }
  };

  return (
    <div id="image-uploader-module" className="space-y-4">
      {/* Upload Box or Preview */}
      {!selectedImage ? (
        <div
          id="dropzone-area"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-emerald-600 bg-emerald-50/50 scale-[1.01]'
              : 'border-stone-300 hover:border-emerald-500 bg-stone-50/60 hover:bg-stone-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="text-sm font-bold text-stone-900">
            {language === 'ta' ? 'இலை புகைப்படத்தைப் பதிவேற்ற கிளிக் செய்யவும் அல்லது இழுத்துப் போடவும்' : 'Click to upload or drag and drop leaf photo'}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {language === 'ta' ? 'PNG, JPG அல்லது WEBP (அதிகபட்சம் 10MB)' : 'PNG, JPG or WEBP (Max 10MB)'}
          </p>

          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'ta' ? 'கேமரா / கோப்பு' : 'Camera / Browse'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div id="image-preview-container" className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-950 flex items-center justify-center max-h-80">
          <img
            src={selectedImage}
            alt="Uploaded leaf"
            referrerPolicy="no-referrer"
            className="w-full h-80 object-contain"
          />

          {!isLoading && (
            <button
              id="btn-clear-image"
              type="button"
              onClick={onClear}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-900/80 hover:bg-rose-600 text-white shadow-md transition-colors"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ta' ? 'படம் பகுப்பாய்விற்கு தயார்' : 'Leaf image ready for AI vision analysis'}</span>
          </div>
        </div>
      )}

      {/* Quick Sample Leaf Selection for Instant Testing */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {language === 'ta' ? 'விரைவு சோதனை மாதிரி படங்கள்:' : 'Quick Test Sample Photos:'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {SAMPLE_LEAF_IMAGES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              id={`btn-sample-leaf-${idx}`}
              onClick={() => handleSampleClick(sample)}
              className="p-2 rounded-xl bg-stone-50 border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group flex items-center gap-2"
            >
              <img
                src={sample.url}
                alt={sample.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-lg object-cover border border-stone-200 group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-stone-900 truncate leading-tight">{sample.name}</p>
                <p className="text-[9px] text-emerald-700 truncate">{sample.crop}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
