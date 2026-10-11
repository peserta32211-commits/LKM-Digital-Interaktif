import React, { useState } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  Eye, 
  Table as TableIcon, 
  Image as ImageIcon,
  Check,
  ChevronDown
} from 'lucide-react';
import { MathText } from './MathRenderer';
import { StudentImageUpload } from './StudentImageUpload';
import { StudentMathToolbar } from './StudentMathToolbar';
import { sounds } from '../services/soundEffects';

interface RichWorksheetRendererProps {
  content: string;
  rolePrefix: string;
  answers: Record<string, any>;
  onAnswerChange: (key: string, value: any) => void;
  disabled?: boolean;
  allowPhotoUpload?: boolean;
}

/**
 * Parses freeform text and renders inline interactive components:
 * - [table: Header 1 | Header 2; Row1 Col1 | Row1 Col2; ...] or markdown tables
 * - [img: URL | Caption]
 * - [pg: Option 1 | Option 2* | Option 3]
 * - [cb: Option 1 | Option 2* | Option 3]
 * - [blank text] -> inline text input
 * - Pure Unicode Math & Rich Text Styling
 */
export const RichWorksheetRenderer: React.FC<RichWorksheetRendererProps> = ({
  content,
  rolePrefix,
  answers,
  onAnswerChange,
  disabled = false,
  allowPhotoUpload = true,
}) => {
  const [zoomedImage, setZoomedImage] = useState<{ src: string; caption?: string } | null>(null);
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const handleInsertMathChar = (char: string) => {
    // If user has focused a specific input, insert into it
    if (lastFocusedField) {
      const current = answers[lastFocusedField] || '';
      onAnswerChange(lastFocusedField, current + char);
      return;
    }
    // Fallback: insert into first available blank
    const fallbackKey = `${rolePrefix}_inline_blank_1`;
    const current = answers[fallbackKey] || '';
    onAnswerChange(fallbackKey, current + char);
  };

  if (!content || !content.trim()) {
    return (
      <div className="p-6 text-center text-slate-400 font-semibold italic bg-amber-50/40 rounded-2xl border-2 border-dashed border-amber-200">
        Belum ada lembar kerja yang ditulis oleh guru.
      </div>
    );
  }

  // Split into lines/paragraphs or special blocks (tables, images, text)
  const lines = content.split('\n');
  const blocks: Array<{ type: 'paragraph' | 'table' | 'image' | 'heading'; content: string; extra?: any }> = [];

  let currentPara: string[] = [];
  let inMarkdownTable = false;
  let markdownTableLines: string[] = [];

  const flushParagraph = () => {
    if (currentPara.length > 0) {
      const text = currentPara.join('\n').trim();
      if (text) {
        if (text.startsWith('### ')) {
          blocks.push({ type: 'heading', content: text.replace('### ', ''), extra: { level: 3 } });
        } else if (text.startsWith('## ')) {
          blocks.push({ type: 'heading', content: text.replace('## ', ''), extra: { level: 2 } });
        } else if (text.startsWith('# ')) {
          blocks.push({ type: 'heading', content: text.replace('# ', ''), extra: { level: 1 } });
        } else {
          blocks.push({ type: 'paragraph', content: text });
        }
      }
      currentPara = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Markdown table detection: lines with |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushParagraph();
      inMarkdownTable = true;
      markdownTableLines.push(trimmed);
      continue;
    } else if (inMarkdownTable) {
      // End of markdown table
      blocks.push({ type: 'table', content: '', extra: { markdownLines: [...markdownTableLines] } });
      markdownTableLines = [];
      inMarkdownTable = false;
    }

    // Shortcode table: [table: Header 1 | Header 2; Row1 ... ]
    if (trimmed.startsWith('[table:') && trimmed.endsWith(']')) {
      flushParagraph();
      const raw = trimmed.slice(7, -1).trim();
      blocks.push({ type: 'table', content: raw, extra: { shortcode: true } });
      continue;
    }

    // Image shortcode: [img: URL | Caption]
    if (trimmed.startsWith('[img:') && trimmed.endsWith(']')) {
      flushParagraph();
      const raw = trimmed.slice(5, -1).trim();
      const [src, ...capParts] = raw.split('|');
      blocks.push({
        type: 'image',
        content: src.trim(),
        extra: { caption: capParts.join('|').trim() },
      });
      continue;
    }

    // Blank line -> paragraph boundary
    if (!trimmed) {
      flushParagraph();
    } else {
      currentPara.push(line);
    }
  }

  // Flush remaining
  if (inMarkdownTable && markdownTableLines.length > 0) {
    blocks.push({ type: 'table', content: '', extra: { markdownLines: markdownTableLines } });
  }
  flushParagraph();

  let fieldCounter = 0;

  // Render inline tokens within a paragraph string
  const renderInlineTokens = (text: string, blockIndex: number) => {
    // Regex matches:
    // 1. [pg: Opt1 | Opt2 | ...]
    // 2. [cb: Opt1 | Opt2 | ...]
    // 3. [img: URL | Caption]
    // 4. [anything_else] -> inline blank
    const tokenRegex = /(\[pg:[^\]]+\]|\[cb:[^\]]+\]|\[img:[^\]]+\]|\[[^\]]+\])/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, pIdx) => {
      if (!part) return null;

      // 1. Inline Multiple Choice: [pg: Opt1 | Opt2* | Opt3]
      if (part.startsWith('[pg:') && part.endsWith(']')) {
        fieldCounter++;
        const fieldKey = `${rolePrefix}_inline_pg_${fieldCounter}`;
        const rawOptions = part.slice(4, -1).split('|').map((s) => s.trim()).filter(Boolean);
        const options = rawOptions.map((opt) => opt.replace(/\*$/, ''));
        const currentVal = answers[fieldKey] || '';

        return (
          <span key={`pg-${blockIndex}-${pIdx}`} className="inline-flex items-center gap-1 mx-1 my-0.5 align-middle">
            <select
              value={currentVal}
              disabled={disabled}
              onChange={(e) => {
                sounds.playClick();
                onAnswerChange(fieldKey, e.target.value);
              }}
              className={`text-xs sm:text-sm font-bold px-2.5 py-1.5 rounded-xl border-2 transition outline-hidden cursor-pointer shadow-2xs ${
                currentVal
                  ? 'bg-amber-100 border-amber-500 text-amber-950'
                  : 'bg-white border-amber-300 text-slate-700 hover:border-amber-400'
              } ${disabled ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              <option value="">-- Pilih Jawaban --</option>
              {options.map((opt, oIdx) => (
                <option key={oIdx} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </span>
        );
      }

      // 2. Inline Checkbox: [cb: Opt1 | Opt2* | Opt3]
      if (part.startsWith('[cb:') && part.endsWith(']')) {
        fieldCounter++;
        const fieldKey = `${rolePrefix}_inline_cb_${fieldCounter}`;
        const rawOptions = part.slice(4, -1).split('|').map((s) => s.trim()).filter(Boolean);
        const options = rawOptions.map((opt) => opt.replace(/\*$/, ''));
        const currentList: string[] = Array.isArray(answers[fieldKey]) ? answers[fieldKey] : [];

        return (
          <span key={`cb-${blockIndex}-${pIdx}`} className="inline-flex flex-wrap items-center gap-1.5 mx-1 my-1 align-middle">
            {options.map((opt, oIdx) => {
              const isChecked = currentList.includes(opt);
              return (
                <button
                  key={oIdx}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    sounds.playClick();
                    const next = isChecked ? currentList.filter((x) => x !== opt) : [...currentList, opt];
                    onAnswerChange(fieldKey, next);
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border-2 transition cursor-pointer shadow-2xs ${
                    isChecked
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                      : 'bg-white border-amber-200 text-slate-700 hover:border-amber-400'
                  } ${disabled ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>
                  <span>{opt}</span>
                </button>
              );
            })}
          </span>
        );
      }

      // 3. Inline Image shortcode: [img: URL | Caption]
      if (part.startsWith('[img:') && part.endsWith(']')) {
        const raw = part.slice(5, -1).trim();
        const [src, ...cap] = raw.split('|');
        const caption = cap.join('|').trim();

        return (
          <div key={`img-${blockIndex}-${pIdx}`} className="my-3 block">
            <div className="relative inline-block max-w-full rounded-2xl overflow-hidden border-2 border-amber-200 shadow-md bg-white">
              <img
                src={src.trim()}
                alt={caption || 'Gambar LKM'}
                className="max-h-80 w-auto object-contain cursor-pointer hover:opacity-95 transition"
                onClick={() => setZoomedImage({ src: src.trim(), caption })}
              />
              {caption && (
                <div className="p-2 bg-amber-50/90 border-t border-amber-200 text-xs font-bold text-slate-700 text-center">
                  {caption}
                </div>
              )}
            </div>
          </div>
        );
      }

      // 4. Inline Blank: [isinya / placeholder]
      if (part.startsWith('[') && part.endsWith(']')) {
        fieldCounter++;
        const fieldKey = `${rolePrefix}_inline_blank_${fieldCounter}`;
        const rawToken = part.slice(1, -1).trim();
        // Placeholder text (strip asterisk key if any)
        const placeholder = rawToken.replace(/\*$/, '') || '...';
        const currentVal = answers[fieldKey] || '';

        // Estimate width based on placeholder length
        const minWidthCh = Math.max(10, Math.min(32, placeholder.length + 3));

        return (
          <span key={`blank-${blockIndex}-${pIdx}`} className="inline-block mx-1 my-0.5 align-middle">
            <input
              type="text"
              value={currentVal}
              disabled={disabled}
              placeholder={placeholder}
              style={{ width: `${minWidthCh}ch` }}
              onFocus={() => setLastFocusedField(fieldKey)}
              onChange={(e) => onAnswerChange(fieldKey, e.target.value)}
              className={`px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-lg border-2 transition outline-hidden shadow-2xs ${
                currentVal
                  ? 'bg-amber-100/70 border-amber-500 text-amber-950 font-bold'
                  : 'bg-white border-amber-300 text-slate-800 placeholder:text-amber-600/50 hover:border-amber-400 focus:border-amber-500 focus:bg-amber-50'
              } ${disabled ? 'opacity-85 cursor-not-allowed bg-slate-50' : ''}`}
            />
          </span>
        );
      }

      // Normal text with potential math formulas
      return <MathText key={`txt-${blockIndex}-${pIdx}`} text={part} inline />;
    });
  };

  return (
    <div className="space-y-4">
      {/* Student Math Toolbar for typing Unicode in worksheet */}
      {!disabled && (
        <div className="sticky top-2 z-20 bg-white/95 backdrop-blur-xs p-2 rounded-2xl border-2 border-amber-300 shadow-sm space-y-1">
          <div className="text-[11px] font-black text-amber-900 flex items-center justify-between">
            <span>⌨️ Papan Ketik Simbol Matematika Siswa (Pilih isian lalu klik simbol):</span>
            {lastFocusedField && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Kolom Aktif: {lastFocusedField.replace(`${rolePrefix}_`, '')}
              </span>
            )}
          </div>
          <StudentMathToolbar onInsert={handleInsertMathChar} />
        </div>
      )}

      {blocks.map((block, idx) => {
        // Heading block
        if (block.type === 'heading') {
          const level = block.extra?.level || 2;
          return (
            <div
              key={`h-${idx}`}
              className={`font-black text-amber-950 tracking-tight pt-2 border-b border-amber-100 pb-1 ${
                level === 1 ? 'text-lg sm:text-xl' : level === 2 ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
              }`}
            >
              <MathText text={block.content} inline />
            </div>
          );
        }

        // Image block
        if (block.type === 'image') {
          return (
            <div key={`img-blk-${idx}`} className="my-3 flex flex-col items-center">
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-200 shadow-md bg-white max-w-full">
                <img
                  src={block.content}
                  alt={block.extra?.caption || 'Petunjuk visual'}
                  className="max-h-80 w-auto object-contain cursor-pointer hover:opacity-95 transition"
                  onClick={() => setZoomedImage({ src: block.content, caption: block.extra?.caption })}
                />
                {block.extra?.caption && (
                  <div className="p-2 bg-amber-50/90 border-t border-amber-200 text-xs font-bold text-slate-700 text-center">
                    {block.extra.caption}
                  </div>
                )}
              </div>
            </div>
          );
        }

        // Table block
        if (block.type === 'table') {
          fieldCounter++;
          const tableKey = `${rolePrefix}_table_${fieldCounter}`;

          let headers: string[] = [];
          let rows: string[][] = [];

          if (block.extra?.markdownLines) {
            const rawLines = block.extra.markdownLines as string[];
            if (rawLines.length > 0) {
              // Row 0 is header
              headers = rawLines[0]
                .split('|')
                .map((s) => s.trim())
                .filter(Boolean);
              // Row 1 is divider |---|---|, skip it
              // Rows 2+ are data
              const dataLines = rawLines.slice(1).filter((l) => !l.replace(/[\s|:-]/g, '').trim().length ? false : true);
              rows = dataLines.map((line) =>
                line
                  .split('|')
                  .map((s) => s.trim())
                  .filter((s, cIdx, arr) => !(cIdx === 0 && s === '') && !(cIdx === arr.length - 1 && s === ''))
              );
            }
          } else if (block.extra?.shortcode) {
            // [table: H1 | H2; R1C1 | R1C2; R2C1 | R2C2]
            const parts = block.content.split(';').map((s) => s.trim()).filter(Boolean);
            if (parts.length > 0) {
              headers = parts[0].split('|').map((s) => s.trim()).filter(Boolean);
              rows = parts.slice(1).map((r) => r.split('|').map((s) => s.trim()));
            }
          }

          if (headers.length === 0) return null;

          return (
            <div key={`tbl-${idx}`} className="my-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-amber-950 uppercase">
                <TableIcon className="w-4 h-4 text-amber-600" />
                <span>Tabel Lembar Kerja Siswa:</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border-2 border-amber-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead className="bg-amber-100/80 text-amber-950 font-black border-b-2 border-amber-200">
                    <tr>
                      {headers.map((h, hIdx) => (
                        <th key={hIdx} className="p-3 border-r border-amber-200 last:border-r-0">
                          <MathText text={h} inline />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-amber-50/40">
                        {headers.map((_, cIdx) => {
                          const cellTemplate = row[cIdx] || '';
                          const cellFieldKey = `${tableKey}_r${rIdx}_c${cIdx}`;
                          const cellVal = answers[cellFieldKey] !== undefined ? answers[cellFieldKey] : '';

                          // If the teacher wrote fixed text (e.g. "Sampel 1" without [isian]), show it as fixed label
                          const isFixedLabel = cellTemplate && !cellTemplate.includes('[') && !cellTemplate.includes('isian');

                          return (
                            <td key={cIdx} className="p-2 sm:p-2.5 border-r border-amber-100 last:border-r-0 align-top">
                              {isFixedLabel ? (
                                <div className="p-2 font-bold text-slate-800 bg-slate-50/60 rounded-lg">
                                  <MathText text={cellTemplate} inline />
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  value={cellVal}
                                  disabled={disabled}
                                  placeholder={cellTemplate ? cellTemplate.replace(/[\[\]]/g, '') : `Isi data baris ${rIdx + 1}...`}
                                  onFocus={() => setLastFocusedField(cellFieldKey)}
                                  onChange={(e) => onAnswerChange(cellFieldKey, e.target.value)}
                                  className={`w-full px-2.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border border-amber-200 focus:border-amber-500 bg-white outline-hidden shadow-2xs ${
                                    cellVal ? 'bg-amber-50/50 font-bold border-amber-400 text-amber-950' : ''
                                  } ${disabled ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                                />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        // Paragraph block
        return (
          <div key={`p-${idx}`} className="text-sm sm:text-base leading-relaxed text-slate-800 font-medium">
            {renderInlineTokens(block.content, idx)}
          </div>
        );
      })}

      {/* Optional Photo/Sketch upload for the whole worksheet/agent */}
      {allowPhotoUpload && (
        <div className="pt-3 border-t border-amber-100">
          <StudentImageUpload
            label="📷 Unggah Foto / Sketsa Jawaban Pendukung"
            sublabel="Lampirkan foto hitungan di kertas, bagan, atau sketsa kerja tim"
            imageData={answers[`${rolePrefix}_worksheet_image`]}
            disabled={disabled}
            onChange={(img) => onAnswerChange(`${rolePrefix}_worksheet_image`, img)}
          />
        </div>
      )}

      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full p-4 relative space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>{zoomedImage.caption || 'Pratinjau Gambar Petunjuk LKM'}</span>
              </span>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-xl bg-slate-900 flex items-center justify-center">
              <img src={zoomedImage.src} alt="Detail" className="max-w-full max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
