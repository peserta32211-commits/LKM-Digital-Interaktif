import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, Eye, X, UploadCloud, CheckCircle2 } from 'lucide-react';
import { processImageFile } from '../utils/imageHelper';

interface StudentImageUploadProps {
  label?: string;
  sublabel?: string;
  imageData?: string;
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
}

export const StudentImageUpload: React.FC<StudentImageUploadProps> = ({
  label = 'Unggah Foto Jawaban / Sketsa',
  sublabel = 'Foto lembar coretan, hitungan, atau sketsa kerja kelompok',
  imageData,
  onChange,
  disabled = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const dataUrl = await processImageFile(file, 1200, 1200, 0.82);
      onChange(dataUrl);
    } catch (err) {
      console.error('Failed to load image:', err);
    } finally {
      setIsProcessing(false);
      // Reset input so same file can be re-selected if deleted
      e.target.value = '';
    }
  };

  return (
    <div className="pt-2">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        disabled={disabled || isProcessing}
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled || isProcessing}
        onChange={handleFileChange}
      />

      {!imageData ? (
        <div className="p-3 bg-amber-50/60 rounded-xl border border-dashed border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950">{label}</div>
              <div className="text-[11px] text-amber-700/80">{sublabel}</div>
            </div>
          </div>

          {!disabled && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isProcessing}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:border-amber-400 text-amber-900 text-xs font-bold shadow-2xs hover:bg-amber-100/50 cursor-pointer transition"
              >
                <Camera className="w-3.5 h-3.5 text-amber-600" />
                <span>Kamera HP</span>
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isProcessing}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-2xs cursor-pointer transition"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Pilih Galeri</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 bg-white rounded-xl border-2 border-emerald-300 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFullPreview(true)}
              className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-300 group cursor-pointer shrink-0"
              title="Klik untuk memperbesar"
            >
              <img src={imageData} alt="Jawaban Siswa" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                <Eye className="w-4 h-4" />
              </div>
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Foto Jawaban / Sketsa Terlampir</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Klik gambar untuk memperbesar pratinjau
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFullPreview(true)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Perbesar</span>
            </button>
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 hover:bg-rose-100 cursor-pointer flex items-center gap-1"
                title="Hapus foto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal Full Preview */}
      {showFullPreview && imageData && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowFullPreview(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full p-4 relative space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Pratinjau Foto Jawaban Siswa</span>
              </span>
              <button
                type="button"
                onClick={() => setShowFullPreview(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-xl bg-slate-900 flex items-center justify-center">
              <img src={imageData} alt="Detail Jawaban" className="max-w-full max-h-[70vh] object-contain" />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowFullPreview(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
