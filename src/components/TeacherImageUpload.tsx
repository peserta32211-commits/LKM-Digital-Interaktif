import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, Eye, X, Plus, AlertCircle } from 'lucide-react';
import { processImageFile } from '../utils/imageHelper';

interface TeacherImageUploadProps {
  label?: string;
  imageUrl?: string;
  imageCaption?: string;
  onImageChange: (url: string | undefined) => void;
  onCaptionChange?: (caption: string) => void;
  compact?: boolean;
}

export const TeacherImageUpload: React.FC<TeacherImageUploadProps> = ({
  label = 'Unggah Gambar Soal / Petunjuk Visual',
  imageUrl,
  imageCaption,
  onImageChange,
  onCaptionChange,
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const dataUrl = await processImageFile(file, 1200, 1200, 0.85);
      onImageChange(dataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onImageChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  if (!imageUrl) {
    return (
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />

        <div className={`flex flex-wrap items-center gap-2 ${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold cursor-pointer transition shadow-2xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-amber-700" />
            <span>{isProcessing ? 'Memproses Gambar...' : label}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-700 underline cursor-pointer"
          >
            {showUrlInput ? 'Tutup Tautan' : 'Gunakan URL Gambar Web'}
          </button>
        </div>

        {showUrlInput && (
          <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-amber-300">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Tempel tautan gambar https://..."
              className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg outline-hidden"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg cursor-pointer"
            >
              Gunakan
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 bg-white rounded-xl border-2 border-amber-300 space-y-2 shadow-2xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="relative w-16 h-16 rounded-lg overflow-hidden border border-amber-300 group cursor-pointer shrink-0 bg-slate-50"
            title="Klik untuk memperbesar gambar"
          >
            <img src={imageUrl} alt="Petunjuk visual" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
              <Eye className="w-4 h-4" />
            </div>
          </button>
          <div>
            <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Gambar Petunjuk Siswa Terpasang</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Akan tampil di layar lembar kerja siswa
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
          >
            Lihat
          </button>
          <button
            type="button"
            onClick={() => onImageChange(undefined)}
            className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer"
            title="Hapus gambar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {onCaptionChange && (
        <input
          type="text"
          value={imageCaption || ''}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Keterangan gambar (opsional, contoh: Bagan Spektrometri Air)..."
          className="w-full px-2.5 py-1 text-xs border border-amber-200 focus:border-amber-400 rounded-lg outline-hidden bg-amber-50/30"
        />
      )}

      {/* Modal Preview */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-4 relative space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>Pratinjau Gambar Guru</span>
              </span>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-xl bg-slate-900 flex items-center justify-center">
              <img src={imageUrl} alt="Petunjuk" className="max-w-full max-h-[70vh] object-contain" />
            </div>
            {imageCaption && (
              <div className="text-center text-xs font-semibold text-slate-600">
                {imageCaption}
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
