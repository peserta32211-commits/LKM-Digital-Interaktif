import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { UNICODE_MATH_CATEGORIES, QUICK_UNICODE_ITEMS } from './UnicodeMathPad';

interface StudentMathToolbarProps {
  onInsert: (char: string) => void;
  className?: string;
}

export const StudentMathToolbar: React.FC<StudentMathToolbarProps> = ({
  onInsert,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('operations_fractions');

  const studentQuickButtons = [
    { char: '½', tooltip: 'Pecahan 1/2' },
    { char: '¼', tooltip: 'Pecahan 1/4' },
    { char: '¾', tooltip: 'Pecahan 3/4' },
    { char: '²', tooltip: 'Pangkat 2 (kuadrat)' },
    { char: '³', tooltip: 'Pangkat 3' },
    { char: 'ⁿ', tooltip: 'Pangkat n' },
    { char: '√', tooltip: 'Akar' },
    { char: '±', tooltip: 'Plus Minus' },
    { char: '×', tooltip: 'Kali' },
    { char: '÷', tooltip: 'Bagi' },
    { char: '−', tooltip: 'Minus' },
    { char: '·', tooltip: 'Titik kali' },
    { char: '≤', tooltip: 'Kurang dari sama dengan' },
    { char: '≥', tooltip: 'Lebih dari sama dengan' },
    { char: '≠', tooltip: 'Tidak sama dengan' },
    { char: 'π', tooltip: 'Pi' },
    { char: '°', tooltip: 'Derajat' },
    { char: 'θ', tooltip: 'Theta' },
    { char: '₁', tooltip: 'Indeks 1' },
    { char: '₂', tooltip: 'Indeks 2' },
    { char: '[ ᵃ  ᵇ / ᶜ  ᵈ ]', tooltip: 'Template Matriks 2x2' },
  ];

  const currentCatObj = UNICODE_MATH_CATEGORIES.find((c) => c.id === activeCategory) || UNICODE_MATH_CATEGORIES[0];

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Student Compact Toolbar */}
      <div className="flex items-center justify-between gap-1 p-1.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-thin max-w-full">
          <span className="text-[10px] uppercase font-black text-amber-900 shrink-0 mr-0.5 flex items-center gap-1">
            <span>🔢 Simbol:</span>
          </span>

          {studentQuickButtons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onInsert(btn.char)}
              className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 hover:border-amber-400 border border-amber-200 text-slate-900 text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer shrink-0 font-sans"
              title={btn.tooltip}
            >
              {btn.char}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-[11px] transition border border-amber-300 shadow-2xs cursor-pointer shrink-0"
          title="Buka pilihan simbol lengkap"
        >
          <Calculator className="w-3 h-3 text-amber-800" />
          <span className="hidden sm:inline">{isOpen ? 'Tutup' : 'Lengkap'}</span>
          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded Student Drawer */}
      {isOpen && (
        <div className="p-2.5 bg-white border-2 border-amber-300 rounded-xl shadow-md space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between flex-wrap gap-1 border-b border-amber-100 pb-1.5">
            <span className="text-[11px] font-black text-amber-900 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>PAPAN KETIK SIMBOL MATEMATIKA UNICODE SISWA:</span>
            </span>

            <div className="flex items-center gap-1 flex-wrap">
              {UNICODE_MATH_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1 max-h-36 overflow-y-auto p-1">
            {currentCatObj.symbols.map((sym, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => onInsert(sym.char)}
                className="p-1.5 rounded-lg bg-amber-50/60 hover:bg-amber-200 border border-amber-200 text-slate-900 text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer"
                title={sym.tooltip || sym.label}
              >
                {sym.char}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
