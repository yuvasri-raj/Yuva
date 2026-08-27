import React, { useState, useEffect } from 'react';
import {
  ScanLine,
  ShieldCheck,
  AlertTriangle,
  History,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FlaskConical,
  Bug,
  Leaf,
  Layers
} from 'lucide-react';
import { DiseaseDetection, PageId } from '../types.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { ImageUploader } from '../components/ImageUploader.js';

interface DiseaseDetectionPageProps {
  setCurrentPage?: (page: PageId) => void;
}

export const DiseaseDetectionPage: React.FC<DiseaseDetectionPageProps> = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [cropName, setCropName] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DiseaseDetection | null>(null);
  const [history, setHistory] = useState<DiseaseDetection[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const data = await api.getDiseaseHistory();
      setHistory(data);
    } catch (err) {
      console.warn('Failed to load disease history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleImageSelected = (base64: string, mime: string, filename?: string) => {
    setSelectedImage(base64);
    setMimeType(mime || 'image/jpeg');
    if (filename && !cropName) {
      if (filename.toLowerCase().includes('tomato')) setCropName('Tomato');
      else if (filename.toLowerCase().includes('rice') || filename.toLowerCase().includes('paddy')) setCropName('Paddy');
      else if (filename.toLowerCase().includes('corn') || filename.toLowerCase().includes('maize')) setCropName('Maize');
    }
    setError(null);
  };

  const handleClear = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  const handleDetectDisease = async () => {
    if (!selectedImage) {
      setError(t.disease.noImageSelected);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.detectDisease({
        image: selectedImage,
        mimeType,
        cropName: cropName.trim() || undefined
      });
      setResult(res);
      if (user) fetchHistory();
    } catch (err: any) {
      setError(err.message || 'Disease detection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="disease-detection-root" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold mb-2">
            <ScanLine className="w-3.5 h-3.5 text-teal-700" />
            <span>{language === 'ta' ? 'தாவர நோயியல் AI விஷன்' : 'Plant Pathology AI Vision'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            {t.disease.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            {t.disease.subtitle}
          </p>
        </div>

        {user && (
          <button
            id="btn-toggle-disease-history"
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <History className="w-4 h-4 text-teal-700" />
            <span>{showHistory ? 'Hide History' : `History (${history.length})`}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Upload & Controls + Diagnostic Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Column */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ta' ? 'பாதிக்கப்பட்ட தாவர இலையைப் பதிவேற்றவும்' : 'Upload or Capture Foliage Photo'}</span>
          </h2>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Crop hint selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {language === 'ta' ? 'பயிர் வகை (விரும்பினால்)' : 'Crop Species Hint (Optional)'}
            </label>
            <select
              id="select-disease-crop-hint"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Auto-Detect from Foliage Photo</option>
              <option value="Tomato">Tomato (தக்காளி)</option>
              <option value="Paddy / Rice">Paddy / Rice (நெல்)</option>
              <option value="Maize / Corn">Maize / Corn (மக்காச்சோளம்)</option>
              <option value="Potato">Potato (உருளைக்கிழங்கு)</option>
              <option value="Cotton">Cotton (பருத்தி)</option>
              <option value="Sugarcane">Sugarcane (கரும்பு)</option>
              <option value="Turmeric">Turmeric (மஞ்சள்)</option>
            </select>
          </div>

          <ImageUploader
            selectedImage={selectedImage}
            onImageSelected={handleImageSelected}
            onClear={handleClear}
            isLoading={loading}
          />

          <button
            id="btn-detect-disease-submit"
            type="button"
            onClick={handleDetectDisease}
            disabled={loading || !selectedImage}
            className="w-full py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-teal-800/20 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <span>{t.disease.analyzing}</span>
            ) : (
              <>
                <ScanLine className="w-5 h-5" />
                <span>{t.disease.detectBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* Diagnosis Report Column */}
        <div className="lg:col-span-6">
          {result ? (
            <div id="disease-diagnosis-result" className="bg-white rounded-3xl border border-teal-300 shadow-md p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                    <ScanLine className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-teal-950">{t.disease.detectedDisease}</span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    result.isDemo ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {result.isDemo ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  {result.isDemo ? 'Rule-based Pathology Fallback' : 'Gemini AI Vision Verified'}
                </span>
              </div>

              {/* Main Disease Hero Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-900 via-stone-900 to-emerald-950 text-white">
                <p className="text-[11px] text-teal-300 font-semibold">{result.cropName}</p>
                <h3 className="text-2xl font-black tracking-tight mt-0.5">{result.diseaseName}</h3>

                <div className="mt-3 flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded-lg bg-white/20 text-white text-xs font-bold">
                    {result.confidence}% Match Confidence
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      result.severity === 'Severe' || result.severity === 'High'
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-400/30'
                        : 'bg-amber-500/30 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    Severity: {result.severity}
                  </span>
                </div>
              </div>

              {/* Symptoms Checklist */}
              {result.symptoms && result.symptoms.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.disease.symptoms}</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {result.symptoms.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Organic Remedies */}
              {result.treatment?.organic && result.treatment.organic.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.disease.organicTreatments}</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-emerald-950 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80">
                    {result.treatment.organic.map((o, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chemical Remedies */}
              {result.treatment?.chemical && result.treatment.chemical.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t.disease.chemicalTreatments}</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-blue-950 bg-blue-50/70 p-3 rounded-xl border border-blue-200/80">
                    {result.treatment.chemical.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200 p-8 text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                <ScanLine className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">No leaf scan analyzed yet</h3>
              <p className="text-xs text-stone-500 max-w-xs mt-1">
                Upload or capture an infected plant foliage photo on the left, or select one of the quick test sample photos to test the AI vision pipeline.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* History Drawer */}
      {showHistory && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <History className="w-4 h-4 text-teal-700" />
            <span>Your Previous Plant Disease Scans</span>
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 col-span-full">No previous scans found.</p>
            ) : (
              history.map(item => (
                <div
                  key={item._id}
                  onClick={() => setResult(item)}
                  className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-teal-500 hover:bg-teal-50/20 transition-all cursor-pointer flex items-center gap-3"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.diseaseName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900 truncate">{item.diseaseName}</p>
                    <p className="text-[11px] text-teal-700 font-medium truncate">{item.cropName}</p>
                    <span className="text-[10px] text-stone-400">
                      {new Date(item.detectedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
