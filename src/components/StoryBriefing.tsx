import React, { useState } from 'react';
import { 
  FileText, 
  Droplets, 
  Network, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  BookOpen,
  Info
} from 'lucide-react';
import { LkmConfig } from '../types';
import { sounds } from '../services/soundEffects';
import { MathText } from './MathRenderer';
import { AudioRecorderPlayer } from './AudioRecorderPlayer';
import { VideoEmbedPlayer } from './VideoEmbedPlayer';

interface StoryBriefingProps {
  lkmConfig?: LkmConfig;
}

export const StoryBriefing: React.FC<StoryBriefingProps> = ({ lkmConfig }) => {
  const [activeTab, setActiveTab] = useState<'clue1' | 'clue2' | 'clue3'>('clue1');
  const [isExpanded, setIsExpanded] = useState(true);
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);

  const clues = [
    {
      id: 'clue1' as const,
      label: lkmConfig?.clues?.[0]?.title || 'Petunjuk 1: Uji Laboratorium Air',
      icon: Droplets,
      badge: lkmConfig?.clues?.[0]?.badge || 'SPEKTROMETRI',
      content: lkmConfig?.clues?.[0]?.content || 'pH danau 5.2 (asam). DO 1.8 mg/L (kritis). Racun organo-fosfat terdeteksi 68 ppm.',
    },
    {
      id: 'clue2' as const,
      label: lkmConfig?.clues?.[1]?.title || 'Petunjuk 2: Rantai Makanan & Toksin',
      icon: Network,
      badge: lkmConfig?.clues?.[1]?.badge || 'PIRAMIDA TROFIK',
      content: lkmConfig?.clues?.[1]?.content || 'Racun terakumulasi berlipat: Fitoplankton (1x) -> Zooplankton (4x) -> Ikan Kecil (8x) -> Predator (16x).',
    },
    {
      id: 'clue3' as const,
      label: lkmConfig?.clues?.[2]?.title || 'Petunjuk 3: Peta Aliran Danau',
      icon: MapPin,
      badge: lkmConfig?.clues?.[2]?.badge || 'PETA ZONASI',
      content: lkmConfig?.clues?.[2]?.content || 'Zona 1 (Hulu Pabrik) -> Zona 2 (Tengah Danau) -> Zona 3 (Suaka Hewan Hilir Danau).',
    },
  ];

  const storyText = lkmConfig?.storyBriefing || (
    'Penyelidikan Matematika Terpadu: Memecahkan tantangan pemodelan matematis berbasis kehidupan nyata, menganalisis data, dan merumuskan keputusan bersama tim Anda!'
  );

  return (
    <section className="bg-white/95 backdrop-blur-md border-3 border-sky-300 rounded-3xl overflow-hidden shadow-lg mb-6">
      {/* Header Bar */}
      <div 
        onClick={() => {
          sounds.playClick();
          setIsExpanded(!isExpanded);
        }}
        className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-sky-100 via-teal-50 to-emerald-100 border-b-2 border-sky-200 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 border border-amber-500 flex items-center justify-center text-lg shadow-xs">
            📖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-sky-800 uppercase tracking-wide">
                CATATAN MISI PETUALANGAN
              </span>
              <span className="px-2 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                BACA BERSAMA TIM
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
              {lkmConfig?.title || 'Eksplorasi Matematika Terpadu'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-sky-800 hidden sm:inline">
            {isExpanded ? 'Sembunyikan' : 'Buka Cerita & Petunjuk'}
          </span>
          <div className="p-1 rounded-xl bg-white border border-sky-300 text-sky-700">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-5">
          {/* Story Narrative Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-2xs space-y-2">
            <div className="flex items-center gap-2 font-black text-amber-900 text-xs uppercase">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Narasi Misi Tantangan:</span>
            </div>
            {/* Audio Narasi Guru jika ada */}
            {lkmConfig?.storyAudioUrl && (
              <div className="pt-1">
                <AudioRecorderPlayer
                  audioUrl={lkmConfig.storyAudioUrl}
                  mode="player_only"
                />
              </div>
            )}

            <div className="text-slate-800 font-medium">
              <MathText text={storyText} />
            </div>

            {/* Video Pembelajaran / Simulasi Cerita Kasus */}
            {lkmConfig?.storyVideoUrl && (
              <div className="pt-2">
                <VideoEmbedPlayer
                  videoUrl={lkmConfig.storyVideoUrl}
                  title="Video Pengantar Kasus Matematika"
                />
              </div>
            )}

            {/* Case Illustration Image if provided by Teacher */}
            {lkmConfig?.storyBriefingImage && (
              <div className="pt-2">
                <div className="p-3 bg-white rounded-2xl border-2 border-amber-200 flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-amber-300">
                    <img
                      src={lkmConfig.storyBriefingImage}
                      alt="Ilustrasi Kasus"
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                      onClick={() => setZoomedImg(lkmConfig.storyBriefingImage || null)}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <span>🖼️</span>
                      <span>Bagan / Diagram Konsep Masalah Matematika</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Klik gambar untuk memperbesar dan mencermati data visual yang disediakan guru.
                    </p>
                    <button
                      type="button"
                      onClick={() => setZoomedImg(lkmConfig.storyBriefingImage || null)}
                      className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg border border-amber-300 cursor-pointer transition"
                    >
                      Perbesar Gambar 🔍
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3 Interactive Clues Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-sky-950 flex items-center gap-1.5">
                <span>🔍</span>
                <span>3 PETUNJUK KONTEKSTUAL MATERI (KLIK UNTUK MEMBUKA FAKTA):</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {clues.map((clue) => {
                const isSelected = activeTab === clue.id;
                const Icon = clue.icon;

                return (
                  <button
                    key={clue.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setActiveTab(clue.id);
                    }}
                    className={`text-left p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-sky-100 border-sky-500 shadow-sm scale-101'
                        : 'bg-slate-50 border-slate-200 hover:border-sky-300 hover:bg-sky-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-white border border-sky-200 text-[10px] font-black text-sky-800">
                        {clue.badge}
                      </span>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">
                      {clue.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Clue Content Box */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border-2 border-sky-200 space-y-2">
              {(() => {
                const currentClue = clues.find((c) => c.id === activeTab);
                if (!currentClue) return null;

                return (
                  <div>
                    <div className="text-xs font-black text-sky-900 flex items-center gap-1.5 mb-1">
                      <span>📌</span>
                      <span>{currentClue.label}:</span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-800 font-medium">
                      <MathText text={currentClue.content} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal Zoom Gambar Kasus */}
      {zoomedImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setZoomedImg(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full p-4 relative space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>🖼️</span>
                <span>Ilustrasi Masalah & Bagan Konsep Matematika</span>
              </span>
              <button
                type="button"
                onClick={() => setZoomedImg(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-xl bg-slate-900 flex items-center justify-center">
              <img src={zoomedImg} alt="Ilustrasi Kasus" className="max-w-full max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
