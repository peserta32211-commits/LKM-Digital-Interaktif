import React, { useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Volume2, ArrowRight } from 'lucide-react';
import { sounds, speakIndonesianWarning } from '../services/soundEffects';

interface AntiCheatModalProps {
  isOpen: boolean;
  infractionCount: number;
  onClose: () => void;
}

export const AntiCheatModal: React.FC<AntiCheatModalProps> = ({
  isOpen,
  infractionCount,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      // 1. Play audio alarm beep / siren
      sounds.playSiren();
      // 2. Play Text-to-Speech in Indonesian
      speakIndonesianWarning(
        `Peringatan! Dilarang meninggalkan halaman LKM. Kamu tercatat melakukan pelanggaran ke-${infractionCount}. Harap fokus mengerjakan!`
      );
    }
  }, [isOpen, infractionCount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="max-w-md w-full bg-white rounded-3xl border-4 border-rose-500 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="alertdialog"
        aria-modal="true"
      >
        {/* Urgent Red Bar Header */}
        <div className="bg-gradient-to-r from-rose-600 to-red-600 px-6 py-4 text-white flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-white animate-bounce" />
            <h3 className="text-base font-black tracking-wide uppercase">
              ⚠️ PERINGATAN INTEGRITAS MISI
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-black">
            Anti-Cheat
          </span>
        </div>

        {/* Warning Content */}
        <div className="p-6 space-y-5 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-3xl shadow-xs">
            🚨
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Pelanggaran Pindah Tab Tercatat: Ke-{infractionCount}</span>
            </div>

            <p className="text-sm sm:text-base font-black text-slate-900 leading-snug">
              Kamu terdeteksi meninggalkan halaman pengerjaan LKM (Pelanggaran ke-{infractionCount}).
            </p>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Harap fokus menyelesaikan soal di lembar kerja ini. Seluruh perpindahan tab, window, atau membuka aplikasi lain terekam secara otomatis dalam laporan kedisiplinan guru.
            </p>
          </div>

          {/* Sound indicator badge */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center gap-2 text-xs font-bold text-amber-900">
            <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Peringatan suara otomatis dibunyikan</span>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full py-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Saya Mengerti, Kembali Mengerjakan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
