import React, { useState, useRef } from 'react';
import { 
  Calculator, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Eye, 
  Type,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Palette,
  Highlighter
} from 'lucide-react';
import { UNICODE_MATH_CATEGORIES, QUICK_UNICODE_ITEMS } from './UnicodeMathPad';
import { MathText } from './MathRenderer';

interface VisualMathEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
  allowShortcodes?: boolean;
  onInsertShortcode?: () => void;
  shortcodeButtonLabel?: string;
  className?: string;
}

export const VisualMathEditor: React.FC<VisualMathEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tuliskan teks matematika murni Unicode di sini...',
  label,
  rows = 3,
  allowShortcodes = false,
  onInsertShortcode,
  shortcodeButtonLabel = '+ Sisipkan [isian]',
  className = '',
}) => {
  const [isMathPadOpen, setIsMathPadOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('matrix_vector');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert text/character at current cursor position
  const insertAtCursor = (insertion: string) => {
    if (!textareaRef.current) {
      onChange((value || '') + insertion);
      return;
    }
    const el = textareaRef.current;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const current = value || '';
    const updated = current.substring(0, start) + insertion + current.substring(end);
    onChange(updated);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 20);
  };

  // Wrap selected text or insert formatting tags
  const wrapSelection = (before: string, after: string, defaultText: string = 'teks') => {
    if (!textareaRef.current) {
      onChange((value || '') + `${before}${defaultText}${after}`);
      return;
    }
    const el = textareaRef.current;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const current = value || '';
    const selected = current.substring(start, end) || defaultText;
    const updated = current.substring(0, start) + before + selected + after + current.substring(end);
    onChange(updated);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 20);
  };

  const handleInsertSymbol = (char: string) => {
    insertAtCursor(char);
  };

  const handleInsertBlank = () => {
    if (onInsertShortcode) {
      onInsertShortcode();
    } else {
      insertAtCursor(' [isian] ');
    }
  };

  const currentCatObj = UNICODE_MATH_CATEGORIES.find((c) => c.id === activeCategory) || UNICODE_MATH_CATEGORIES[0];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Editor Header & Unicode MathPad Toolbar */}
      <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-orange-50 p-2.5 rounded-xl border border-amber-300 shadow-2xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {label && (
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {label}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-200/90 text-amber-950 text-[11px] font-bold">
              <Type className="w-3 h-3 text-amber-800" />
              Murni Unicode Math
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Rich Text Formatting Toolbar */}
            <div className="flex items-center bg-white rounded-lg border border-amber-200 p-0.5 text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => wrapSelection('**', '**', 'teks tebal')}
                className="p-1.5 hover:bg-amber-100 rounded text-slate-800 font-bold transition cursor-pointer"
                title="Tebal (Bold)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => wrapSelection('*', '*', 'teks miring')}
                className="p-1.5 hover:bg-amber-100 rounded text-slate-800 italic transition cursor-pointer"
                title="Miring (Italic)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => wrapSelection('<u>', '</u>', 'teks garis bawah')}
                className="p-1.5 hover:bg-amber-100 rounded text-slate-800 underline transition cursor-pointer"
                title="Garis Bawah (Underline)"
              >
                <UnderlineIcon className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-px bg-amber-200 mx-0.5" />

              {/* Color dropdown button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex items-center gap-0.5 p-1.5 hover:bg-amber-100 rounded text-slate-800 transition cursor-pointer"
                  title="Warna Teks"
                >
                  <Palette className="w-3.5 h-3.5 text-rose-600" />
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-amber-300 rounded-lg p-1.5 shadow-lg flex gap-1 z-30">
                    <button
                      type="button"
                      onClick={() => {
                        wrapSelection('[color:red]', '[/color]', 'variabel merah');
                        setShowColorPicker(false);
                      }}
                      className="w-5 h-5 rounded-full bg-rose-600 border border-slate-300 shadow-2xs"
                      title="Warna Merah"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        wrapSelection('[color:blue]', '[/color]', 'variabel biru');
                        setShowColorPicker(false);
                      }}
                      className="w-5 h-5 rounded-full bg-blue-600 border border-slate-300 shadow-2xs"
                      title="Warna Biru"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        wrapSelection('[color:green]', '[/color]', 'variabel hijau');
                        setShowColorPicker(false);
                      }}
                      className="w-5 h-5 rounded-full bg-emerald-600 border border-slate-300 shadow-2xs"
                      title="Warna Hijau"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        wrapSelection('[color:amber]', '[/color]', 'variabel kuning');
                        setShowColorPicker(false);
                      }}
                      className="w-5 h-5 rounded-full bg-amber-500 border border-slate-300 shadow-2xs"
                      title="Warna Kuning/Oranye"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        wrapSelection('[color:black]', '[/color]', 'variabel hitam');
                        setShowColorPicker(false);
                      }}
                      className="w-5 h-5 rounded-full bg-slate-900 border border-slate-300 shadow-2xs"
                      title="Warna Hitam"
                    />
                  </div>
                )}
              </div>

              {/* Stabilo Highlight button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                  className="flex items-center gap-0.5 p-1.5 hover:bg-amber-100 rounded text-slate-800 transition cursor-pointer"
                  title="Stabilo / Sorot Latar Belakang"
                >
                  <Highlighter className="w-3.5 h-3.5 text-amber-600" />
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
                {showHighlightPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-amber-300 rounded-lg p-1.5 shadow-lg flex gap-1 z-30">
                    <button
                      type="button"
                      onClick={() => {
                        wrapSelection('[hl:yellow]', '[/hl]', 'sorot kuning');
                        setShowHighlightPicker(false);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-yellow-200 text-yellow-950 border border-yellow-400"
                    >
                      Kuning
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        wrapSelection('[hl:green]', '[/hl]', 'sorot hijau');
                        setShowHighlightPicker(false);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-200 text-emerald-950 border border-emerald-400"
                    >
                      Hijau
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        wrapSelection('[hl:blue]', '[/hl]', 'sorot biru');
                        setShowHighlightPicker(false);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-200 text-sky-950 border border-sky-400"
                    >
                      Biru
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        wrapSelection('[hl:pink]', '[/hl]', 'sorot pink');
                        setShowHighlightPicker(false);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-pink-200 text-pink-950 border border-pink-400"
                    >
                      Pink
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sisipkan Isian Button */}
            {allowShortcodes && (
              <button
                type="button"
                onClick={handleInsertBlank}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Plus className="w-3 h-3" />
                <span>{shortcodeButtonLabel}</span>
              </button>
            )}

            {/* Toggle Full Unicode MathPad */}
            <button
              type="button"
              onClick={() => setIsMathPadOpen(!isMathPadOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition border border-amber-600 shadow-2xs cursor-pointer active:scale-95"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{isMathPadOpen ? 'Tutup Simbol' : '✨ Papan Simbol Unicode'}</span>
              {isMathPadOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Quick Clickable Unicode Row */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-thin">
          <span className="text-[10px] uppercase font-black text-amber-900 shrink-0 mr-1 flex items-center gap-1">
            <span>🔢 Klik Langsung:</span>
          </span>
          {QUICK_UNICODE_ITEMS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleInsertSymbol(item.char)}
              className="px-2 py-1 rounded-lg bg-white hover:bg-amber-200 hover:border-amber-400 border border-amber-200 text-slate-900 text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer shrink-0 font-sans tracking-wide"
              title={item.tooltip}
            >
              {item.char}
            </button>
          ))}
        </div>

        {/* Expanded Categorized Unicode MathPad Drawer */}
        {isMathPadOpen && (
          <div className="bg-white border-2 border-amber-300 rounded-xl p-3 space-y-2.5 shadow-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-amber-100 pb-2">
              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                PILIH SIMBOL UNICODE LENGKAP (LANGSUNG TERTULIS KE KURSOR):
              </span>

              <div className="flex items-center gap-1 flex-wrap">
                {UNICODE_MATH_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-amber-100 text-amber-950 hover:bg-amber-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-1.5 max-h-48 overflow-y-auto p-1">
              {currentCatObj.symbols.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInsertSymbol(item.char)}
                  className="flex items-center justify-center p-2 rounded-lg bg-amber-50/70 hover:bg-amber-200/80 border border-amber-200 text-slate-900 text-sm font-bold transition active:scale-95 shadow-2xs cursor-pointer group hover:border-amber-400"
                  title={item.tooltip || item.label}
                >
                  <span className="font-sans group-hover:scale-110 transition-transform">{item.char}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Typing Area: Textarea with Rich Unicode Math Display */}
      <div className="relative border-2 border-amber-200 hover:border-amber-400 focus-within:border-amber-500 rounded-xl bg-white shadow-2xs transition">
        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 rounded-xl text-xs sm:text-sm text-slate-900 bg-white outline-hidden leading-relaxed font-sans resize-y"
        />

        {/* Live Visual Styling Preview if text has formatting tags */}
        {value && (value.includes('[color:') || value.includes('[hl:') || value.includes('**') || value.includes('*') || value.includes('<u>')) && (
          <div className="px-3 py-2 bg-amber-50/60 border-t border-amber-200 rounded-b-xl text-xs text-slate-800 flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-amber-800 shrink-0">Tampilan Format:</span>
            <div className="flex-1 overflow-x-auto">
              <MathText text={value} inline />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
