import React, { useState } from 'react';
import { 
  Calculator, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Grid3X3, 
  Superscript, 
  Percent, 
  Triangle, 
  Binary, 
  Infinity as InfinityIcon,
  Copy,
  Check
} from 'lucide-react';

export interface UnicodeSymbolCategory {
  id: 'matrix_vector' | 'powers_indices' | 'operations_fractions' | 'relations_geometry' | 'sets_logic' | 'calculus_limits';
  name: string;
  iconName: string;
  symbols: Array<{
    char: string;
    label: string;
    tooltip?: string;
  }>;
}

export const UNICODE_MATH_CATEGORIES: UnicodeSymbolCategory[] = [
  {
    id: 'matrix_vector',
    name: 'Matriks & Vektor',
    iconName: 'Grid3X3',
    symbols: [
      { char: '[ ᵃ  ᵇ / ᶜ  ᵈ ]', label: 'Matriks 2x2', tooltip: 'Template Matriks 2x2 Baris 1: ᵃ ᵇ, Baris 2: ᶜ ᵈ' },
      { char: '[ ᵃ  ᵇ ; ᶜ  ᵈ ]', label: '[a b ; c d]', tooltip: 'Format Matriks Siku' },
      { char: '| ᵃ  ᵇ / ᶜ  ᵈ |', label: 'Det 2x2', tooltip: 'Determinan Matriks 2x2' },
      { char: '[ ˣ / ʸ ]', label: 'Vektor Kolom 2x1', tooltip: 'Vektor Kolom 2x1' },
      { char: '|A|', label: '|A|', tooltip: 'Determinan Matriks A' },
      { char: 'det(A)', label: 'det(A)', tooltip: 'Determinan A' },
      { char: 'A⁻¹', label: 'A⁻¹', tooltip: 'Invers Matriks A' },
      { char: 'Aᵀ', label: 'Aᵀ', tooltip: 'Transpose Matriks A' },
      { char: '[ ]', label: '[ ]', tooltip: 'Kurung Siku' },
      { char: '{ }', label: '{ }', tooltip: 'Kurung Kurawal' },
      { char: 'a⃗', label: 'a⃗', tooltip: 'Vektor a (Panah Atas)' },
      { char: 'v⃗', label: 'v⃗', tooltip: 'Vektor Kecepatan v⃗' },
      { char: 'F⃗', label: 'F⃗', tooltip: 'Vektor Gaya F⃗' },
      { char: 'r⃗', label: 'r⃗', tooltip: 'Vektor Posisi r⃗' },
      { char: 'x̂', label: 'x̂', tooltip: 'Vektor Satuan x (Topi)' },
      { char: 'ŷ', label: 'ŷ', tooltip: 'Vektor Satuan y (Topi)' },
      { char: 'ẑ', label: 'ẑ', tooltip: 'Vektor Satuan z (Topi)' },
      { char: 'î', label: 'î', tooltip: 'Vektor Basis i' },
      { char: 'ĵ', label: 'ĵ', tooltip: 'Vektor Basis j' },
      { char: 'k̂', label: 'k̂', tooltip: 'Vektor Basis k' },
      { char: '→', label: '→', tooltip: 'Panah Vektor / Arah' },
      { char: '·', label: '·', tooltip: 'Dot Product (Perkalian Titik)' },
    ],
  },
  {
    id: 'powers_indices',
    name: 'Pangkat & Indeks',
    iconName: 'Superscript',
    symbols: [
      // Superscript lengkap
      { char: '⁰', label: '⁰', tooltip: 'Pangkat 0' },
      { char: '¹', label: '¹', tooltip: 'Pangkat 1' },
      { char: '²', label: '²', tooltip: 'Pangkat 2 (Kuadrat)' },
      { char: '³', label: '³', tooltip: 'Pangkat 3 (Kubik)' },
      { char: '⁴', label: '⁴', tooltip: 'Pangkat 4' },
      { char: '⁵', label: '⁵', tooltip: 'Pangkat 5' },
      { char: '⁶', label: '⁶', tooltip: 'Pangkat 6' },
      { char: '⁷', label: '⁷', tooltip: 'Pangkat 7' },
      { char: '⁸', label: '⁸', tooltip: 'Pangkat 8' },
      { char: '⁹', label: '⁹', tooltip: 'Pangkat 9' },
      { char: '⁺', label: '⁺', tooltip: 'Pangkat Plus' },
      { char: '⁻', label: '⁻', tooltip: 'Pangkat Minus' },
      { char: 'ⁿ', label: 'ⁿ', tooltip: 'Pangkat n' },
      { char: 'ˣ', label: 'ˣ', tooltip: 'Pangkat x' },
      { char: 'ʸ', label: 'ʸ', tooltip: 'Pangkat y' },
      // Subscript lengkap
      { char: '₀', label: '₀', tooltip: 'Indeks Bawah 0' },
      { char: '₁', label: '₁', tooltip: 'Indeks Bawah 1' },
      { char: '₂', label: '₂', tooltip: 'Indeks Bawah 2' },
      { char: '₃', label: '₃', tooltip: 'Indeks Bawah 3' },
      { char: '₄', label: '₄', tooltip: 'Indeks Bawah 4' },
      { char: '₅', label: '₅', tooltip: 'Indeks Bawah 5' },
      { char: '₆', label: '₆', tooltip: 'Indeks Bawah 6' },
      { char: '₇', label: '₇', tooltip: 'Indeks Bawah 7' },
      { char: '₈', label: '₈', tooltip: 'Indeks Bawah 8' },
      { char: '₉', label: '₉', tooltip: 'Indeks Bawah 9' },
      { char: '₊', label: '₊', tooltip: 'Indeks Bawah Plus' },
      { char: '₋', label: '₋', tooltip: 'Indeks Bawah Minus' },
      { char: 'ᵢ', label: 'ᵢ', tooltip: 'Indeks Bawah i' },
      { char: 'ⱼ', label: 'ⱼ', tooltip: 'Indeks Bawah j' },
      { char: 'ₓ', label: 'ₓ', tooltip: 'Indeks Bawah x' },
    ],
  },
  {
    id: 'operations_fractions',
    name: 'Operasi & Pecahan',
    iconName: 'Percent',
    symbols: [
      { char: '+', label: '+', tooltip: 'Tambah' },
      { char: '−', label: '−', tooltip: 'Kurang (Minus Simbol Matematika)' },
      { char: '×', label: '×', tooltip: 'Kali' },
      { char: '÷', label: '÷', tooltip: 'Bagi' },
      { char: '±', label: '±', tooltip: 'Plus-Minus' },
      { char: '∓', label: '∓', tooltip: 'Minus-Plus' },
      { char: '·', label: '·', tooltip: 'Titik Kali' },
      { char: '½', label: '½', tooltip: 'Satu Per Dua (Setengah)' },
      { char: '⅓', label: '⅓', tooltip: 'Satu Per Tiga' },
      { char: '⅔', label: '⅔', tooltip: 'Dua Per Tiga' },
      { char: '¼', label: '¼', tooltip: 'Satu Per Empat (Seperempat)' },
      { char: '¾', label: '¾', tooltip: 'Tiga Per Empat' },
      { char: '⅕', label: '⅕', tooltip: 'Satu Per Lima' },
      { char: '⅖', label: '⅖', tooltip: 'Dua Per Lima' },
      { char: '⅗', label: '⅗', tooltip: 'Tiga Per Lima' },
      { char: '⅘', label: '⅘', tooltip: 'Empat Per Lima' },
      { char: '⅙', label: '⅙', tooltip: 'Satu Per Enam' },
      { char: '⅚', label: '⅚', tooltip: 'Lima Per Enam' },
      { char: '⅛', label: '⅛', tooltip: 'Satu Per Delapan' },
      { char: '⅜', label: '⅜', tooltip: 'Tiga Per Delapan' },
      { char: '⅝', label: '⅝', tooltip: 'Lima Per Delapan' },
      { char: '⅞', label: '⅞', tooltip: 'Tujuh Per Delapan' },
      { char: '√', label: '√', tooltip: 'Akar Kuadrat' },
      { char: '∛', label: '∛', tooltip: 'Akar Pangkat 3' },
      { char: '∜', label: '∜', tooltip: 'Akar Pangkat 4' },
      { char: '%', label: '%', tooltip: 'Persen' },
    ],
  },
  {
    id: 'relations_geometry',
    name: 'Relasi & Geometri',
    iconName: 'Triangle',
    symbols: [
      { char: '=', label: '=', tooltip: 'Sama Dengan' },
      { char: '≠', label: '≠', tooltip: 'Tidak Sama Dengan' },
      { char: '≈', label: '≈', tooltip: 'Mendekati / Kira-kira' },
      { char: '≡', label: '≡', tooltip: 'Kongruen / Ekuivalen' },
      { char: '≤', label: '≤', tooltip: 'Kurang Dari atau Sama Dengan' },
      { char: '≥', label: '≥', tooltip: 'Lebih Dari atau Sama Dengan' },
      { char: '<', label: '<', tooltip: 'Kurang Dari' },
      { char: '>', label: '>', tooltip: 'Lebih Dari' },
      { char: '∠', label: '∠', tooltip: 'Sudut' },
      { char: '°', label: '°', tooltip: 'Derajat' },
      { char: '⊥', label: '⊥', tooltip: 'Tegak Lurus (Perpendicular)' },
      { char: '∥', label: '∥', tooltip: 'Sejajar (Parallel)' },
      { char: '△', label: '△', tooltip: 'Segitiga' },
      { char: 'π', label: 'π', tooltip: 'Pi (3.14159)' },
      { char: 'θ', label: 'θ', tooltip: 'Theta (Sudut)' },
      { char: 'α', label: 'α', tooltip: 'Alfa' },
      { char: 'β', label: 'β', tooltip: 'Beta' },
      { char: 'γ', label: 'γ', tooltip: 'Gamma' },
      { char: 'φ', label: 'φ', tooltip: 'Phi' },
      { char: 'rad', label: 'rad', tooltip: 'Radian' },
    ],
  },
  {
    id: 'sets_logic',
    name: 'Himpunan & Logika',
    iconName: 'Binary',
    symbols: [
      { char: '∈', label: '∈', tooltip: 'Elemen dari (Anggota)' },
      { char: '∉', label: '∉', tooltip: 'Bukan Elemen dari' },
      { char: '⊂', label: '⊂', tooltip: 'Himpunan Bagian Murni' },
      { char: '⊆', label: '⊆', tooltip: 'Himpunan Bagian atau Sama' },
      { char: '∪', label: '∪', tooltip: 'Gabungan (Union)' },
      { char: '∩', label: '∩', tooltip: 'Irisan (Intersection)' },
      { char: '∅', label: '∅', tooltip: 'Himpunan Kosong' },
      { char: 'ℝ', label: 'ℝ', tooltip: 'Himpunan Bilangan Riil' },
      { char: 'ℤ', label: 'ℤ', tooltip: 'Himpunan Bilangan Bulat' },
      { char: 'ℕ', label: 'ℕ', tooltip: 'Himpunan Bilangan Asli' },
      { char: 'ℚ', label: 'ℚ', tooltip: 'Himpunan Bilangan Rasional' },
      { char: 'ℂ', label: 'ℂ', tooltip: 'Himpunan Bilangan Kompleks' },
      { char: '⇒', label: '⇒', tooltip: 'Maka / Implikasi' },
      { char: '⇔', label: '⇔', tooltip: 'Jika dan Hanya Jika (Biimplikasi)' },
      { char: '∀', label: '∀', tooltip: 'Untuk Setiap / Semua (Universal)' },
      { char: '∃', label: '∃', tooltip: 'Terdapat / Ada (Eksistensial)' },
      { char: '∴', label: '∴', tooltip: 'Oleh Karena Itu (Kesimpulan)' },
      { char: '∧', label: '∧', tooltip: 'Dan (Konjungsi)' },
      { char: '∨', label: '∨', tooltip: 'Atau (Disjungsi)' },
      { char: '¬', label: '¬', tooltip: 'Negasi / Bukan' },
    ],
  },
  {
    id: 'calculus_limits',
    name: 'Kalkulus & Limit',
    iconName: 'InfinityIcon',
    symbols: [
      { char: '∫', label: '∫', tooltip: 'Integral' },
      { char: '∬', label: '∬', tooltip: 'Integral Lipat Dua' },
      { char: '∑', label: '∑', tooltip: 'Sigma (Jumlah)' },
      { char: '∏', label: '∏', tooltip: 'Pi Besar (Hasil Kali)' },
      { char: 'lim', label: 'lim', tooltip: 'Limit' },
      { char: 'Δ', label: 'Δ', tooltip: 'Delta (Perubahan)' },
      { char: 'dx', label: 'dx', tooltip: 'Diferensial x' },
      { char: 'dy/dx', label: 'dy/dx', tooltip: 'Turunan dy terhadap dx' },
      { char: 'f\'(x)', label: 'f\'(x)', tooltip: 'Turunan Pertama f(x)' },
      { char: 'f\'\'(x)', label: 'f\'\'(x)', tooltip: 'Turunan Kedua f(x)' },
      { char: '∂', label: '∂', tooltip: 'Turunan Parsial' },
      { char: '∞', label: '∞', tooltip: 'Tak Hingga (Infinity)' },
    ],
  },
];

// Quick bar items always accessible
export const QUICK_UNICODE_ITEMS = [
  { char: '²', tooltip: 'Kuadrat (²)' },
  { char: '³', tooltip: 'Kubik (³)' },
  { char: 'ⁿ', tooltip: 'Pangkat n (ⁿ)' },
  { char: 'x₁', tooltip: 'x₁' },
  { char: 'x₂', tooltip: 'x₂' },
  { char: '√', tooltip: 'Akar (√)' },
  { char: '½', tooltip: 'Setengah (½)' },
  { char: '¼', tooltip: 'Seperempat (¼)' },
  { char: '¾', tooltip: 'Tiga per empat (¾)' },
  { char: '±', tooltip: 'Plus Minus (±)' },
  { char: '×', tooltip: 'Kali (×)' },
  { char: '÷', tooltip: 'Bagi (÷)' },
  { char: '·', tooltip: 'Titik Kali (·)' },
  { char: '≤', tooltip: 'Kurang dari sama dengan (≤)' },
  { char: '≥', tooltip: 'Lebih dari sama dengan (≥)' },
  { char: '≠', tooltip: 'Tidak sama dengan (≠)' },
  { char: '≈', tooltip: 'Mendekati (≈)' },
  { char: 'π', tooltip: 'Pi (π)' },
  { char: 'θ', tooltip: 'Theta (θ)' },
  { char: '°', tooltip: 'Derajat (°)' },
  { char: '[ ᵃ  ᵇ / ᶜ  ᵈ ]', tooltip: 'Template Matriks 2x2' },
];

interface UnicodeMathPadProps {
  onInsert: (char: string) => void;
  className?: string;
  label?: string;
  compact?: boolean;
}

export const UnicodeMathPad: React.FC<UnicodeMathPadProps> = ({
  onInsert,
  className = '',
  label,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<UnicodeSymbolCategory['id']>('matrix_vector');
  const [copiedChar, setCopiedChar] = useState<string | null>(null);

  const handleSymbolClick = (char: string) => {
    onInsert(char);
    setCopiedChar(char);
    setTimeout(() => setCopiedChar(null), 1200);
  };

  const activeCategory = UNICODE_MATH_CATEGORIES.find((c) => c.id === activeTab) || UNICODE_MATH_CATEGORIES[0];

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Quick Visual Row */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl text-xs shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-xs active:scale-95 cursor-pointer"
            title="Klik untuk membuka papan tombol simbol matematika Unicode lengkap"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{label || (isOpen ? 'Tutup Papan Simbol' : '✨ Simbol Matematika')}</span>
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Quick Clickable Symbols */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full scrollbar-thin">
            {QUICK_UNICODE_ITEMS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSymbolClick(item.char)}
                className="px-2 py-1 rounded-md bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-100 text-slate-800 text-xs font-semibold transition active:scale-95 shadow-2xs cursor-pointer shrink-0 font-sans tracking-wide"
                title={item.tooltip}
              >
                {item.char}
              </button>
            ))}
          </div>
        </div>

        <span className="text-[11px] text-amber-900/80 font-bold hidden sm:inline">
          {copiedChar ? `✅ Disisipkan: ${copiedChar}` : '💡 Murni Unicode Math — Langsung aktif tanpa render KaTeX!'}
        </span>
      </div>

      {/* Expanded Categorized Unicode MathPad Drawer */}
      {isOpen && (
        <div className="bg-white border-2 border-amber-300 rounded-2xl p-3.5 space-y-3 shadow-lg animate-in fade-in zoom-in-95 duration-150">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-2.5">
            <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>TOOLBAR SIMBOL MATEMATIKA UNICODE (KLIK LANGSUNG):</span>
            </span>

            {/* Category Selector Tabs */}
            <div className="flex items-center gap-1 flex-wrap">
              {UNICODE_MATH_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTab === cat.id
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-amber-100/70 text-amber-950 hover:bg-amber-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of buttons for the active category */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-1.5 max-h-56 overflow-y-auto p-1">
            {activeCategory.symbols.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSymbolClick(item.char)}
                className="flex items-center justify-center p-2 rounded-xl bg-amber-50/60 hover:bg-amber-200/80 border border-amber-200 text-slate-900 text-sm font-bold transition active:scale-95 shadow-2xs cursor-pointer hover:border-amber-400 group"
                title={item.tooltip || item.label}
              >
                <span className="font-sans group-hover:scale-110 transition-transform">{item.char}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 bg-amber-50/50 p-2 rounded-xl border border-amber-200">
            <span>
              Kategori Terpilih: <strong>{activeCategory.name}</strong> ({activeCategory.symbols.length} simbol)
            </span>
            <span>Simbol berupa karakter teks Unicode asli (dapat dicopy-paste ke Word, Spreadsheet, atau WA).</span>
          </div>
        </div>
      )}
    </div>
  );
};
