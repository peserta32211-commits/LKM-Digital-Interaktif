import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Table as TableIcon, 
  HelpCircle, 
  Image as ImageIcon, 
  UploadCloud, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  Type, 
  ListOrdered, 
  Sliders, 
  FileText,
  X,
  Plus,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Palette,
  Highlighter,
  ChevronDown
} from 'lucide-react';
import { MathToolbar } from './MathRenderer';
import { RichWorksheetRenderer } from './RichWorksheetRenderer';
import { processImageFile } from '../utils/imageHelper';

interface TeacherCanvasEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  roleNickname: string;
  roleName: string;
}

export const TeacherCanvasEditor: React.FC<TeacherCanvasEditorProps> = ({
  content,
  onChange,
  roleNickname,
  roleName,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Table insert dialog state
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableCols, setTableCols] = useState(3);
  const [tableRows, setTableRows] = useState(3);
  const [tableHeaders, setTableHeaders] = useState(['No', 'Parameter / Sampel', 'Hasil Pengamatan']);

  // Preview local answers state so teacher can test interacting
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  // Helper to insert snippet at cursor position
  const insertAtCursor = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(content + '\n' + snippet);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);
    const updated = before + snippet + after;

    onChange(updated);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  // Helper to wrap selected text in formatting tags
  const wrapSelection = (before: string, after: string, defaultText: string = 'teks') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(content + '\n' + `${before}${defaultText}${after}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || defaultText;
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);
    const updated = beforeText + before + selected + after + afterText;

    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  const handleInsertBlank = () => {
    insertAtCursor(' [masukkan jawaban] ');
  };

  const handleInsertPg = () => {
    insertAtCursor(' [pg: Jawaban A | Jawaban B* | Jawaban C] ');
  };

  const handleInsertCb = () => {
    insertAtCursor(' [cb: Pilihan 1 | Pilihan 2* | Pilihan 3] ');
  };

  const handleInsertTable = () => {
    // Generate markdown table
    const headerLine = `| ${tableHeaders.slice(0, tableCols).join(' | ')} |`;
    const dividerLine = `| ${tableHeaders.slice(0, tableCols).map(() => '---').join(' | ')} |`;
    const dataLines: string[] = [];

    for (let r = 1; r <= tableRows; r++) {
      const rowCells = tableHeaders.slice(0, tableCols).map((h, cIdx) => {
        if (cIdx === 0 && h.toLowerCase().includes('no')) return `${r}`;
        return `[isian baris ${r}]`;
      });
      dataLines.push(`| ${rowCells.join(' | ')} |`);
    }

    const tableBlock = `\n${headerLine}\n${dividerLine}\n${dataLines.join('\n')}\n`;
    insertAtCursor(tableBlock);
    setShowTableModal(false);
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await processImageFile(file, 1000, 1000, 0.85);
      insertAtCursor(`\n[img: ${dataUrl} | Bagan / Petunjuk Kasus]\n`);
    } catch (err) {
      console.error(err);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-3 bg-white rounded-2xl border-2 border-amber-300 p-4 sm:p-5 shadow-xs">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFile}
      />

      {/* Editor Header & Tab Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-sm">
            📝
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-amber-950">
              Canvas / Rich Worksheet Builder ({roleNickname})
            </h4>
            <p className="text-[11px] text-amber-800">
              Ketik narasi bebas layaknya MS Word / Google Docs & sisipkan komponen interaktif
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-amber-100/70 rounded-xl border border-amber-200">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-white text-amber-950 shadow-2xs'
                : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>✍️ Tulis Dokumen</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-amber-950 shadow-2xs'
                : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>👁️ Pratinjau Siswa</span>
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <div className="space-y-2.5">
          {/* Quick Insert Toolbar */}
          <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-amber-900 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Toolbar Sisipkan Elemen Interaktif Bebas:</span>
              </span>
              <span className="text-[10px] text-amber-700/80 font-bold hidden sm:inline">
                Klik tombol untuk menyisipkan ke kursor teks
              </span>
            </div>

            {/* Rich Text Styling Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-black text-amber-900 uppercase flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-amber-600" />
                  <span>Format Teks:</span>
                </span>

                <div className="flex items-center bg-white rounded-lg border border-amber-300 p-0.5 shadow-2xs">
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

                  {/* Warna Teks */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="flex items-center gap-0.5 p-1.5 hover:bg-amber-100 rounded text-slate-800 transition cursor-pointer"
                      title="Warna Teks (Merah, Biru, Hijau, Kuning, Hitam)"
                    >
                      <Palette className="w-3.5 h-3.5 text-rose-600" />
                      <span className="text-[11px] font-bold">Warna</span>
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>
                    {showColorPicker && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-amber-300 rounded-xl p-2 shadow-xl flex gap-1.5 z-30 animate-in fade-in zoom-in-95">
                        <button
                          type="button"
                          onClick={() => {
                            wrapSelection('[color:red]', '[/color]', 'variabel merah');
                            setShowColorPicker(false);
                          }}
                          className="w-6 h-6 rounded-full bg-rose-600 border border-slate-300 shadow-2xs hover:scale-110 transition cursor-pointer"
                          title="Merah"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            wrapSelection('[color:blue]', '[/color]', 'variabel biru');
                            setShowColorPicker(false);
                          }}
                          className="w-6 h-6 rounded-full bg-blue-600 border border-slate-300 shadow-2xs hover:scale-110 transition cursor-pointer"
                          title="Biru"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            wrapSelection('[color:green]', '[/color]', 'variabel hijau');
                            setShowColorPicker(false);
                          }}
                          className="w-6 h-6 rounded-full bg-emerald-600 border border-slate-300 shadow-2xs hover:scale-110 transition cursor-pointer"
                          title="Hijau"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            wrapSelection('[color:amber]', '[/color]', 'variabel kuning');
                            setShowColorPicker(false);
                          }}
                          className="w-6 h-6 rounded-full bg-amber-500 border border-slate-300 shadow-2xs hover:scale-110 transition cursor-pointer"
                          title="Kuning / Oranye"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            wrapSelection('[color:black]', '[/color]', 'variabel hitam');
                            setShowColorPicker(false);
                          }}
                          className="w-6 h-6 rounded-full bg-slate-900 border border-slate-300 shadow-2xs hover:scale-110 transition cursor-pointer"
                          title="Hitam"
                        />
                      </div>
                    )}
                  </div>

                  {/* Highlight Stabilo */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                      className="flex items-center gap-0.5 p-1.5 hover:bg-amber-100 rounded text-slate-800 transition cursor-pointer"
                      title="Sorot / Stabilo Background"
                    >
                      <Highlighter className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[11px] font-bold">Stabilo</span>
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>
                    {showHighlightPicker && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-amber-300 rounded-xl p-2 shadow-xl flex gap-1.5 z-30 animate-in fade-in zoom-in-95">
                        <button
                          type="button"
                          onClick={() => {
                            wrapSelection('[hl:yellow]', '[/hl]', 'sorot instruksi');
                            setShowHighlightPicker(false);
                          }}
                          className="px-2 py-1 rounded text-xs font-bold bg-yellow-200 text-yellow-950 border border-yellow-400 hover:scale-105 transition cursor-pointer"
                        >
                          Kuning
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            wrapSelection('[hl:green]', '[/hl]', 'sorot penting');
                            setShowHighlightPicker(false);
                          }}
                          className="px-2 py-1 rounded text-xs font-bold bg-emerald-200 text-emerald-950 border border-emerald-400 hover:scale-105 transition cursor-pointer"
                        >
                          Hijau
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            wrapSelection('[hl:blue]', '[/hl]', 'sorot data');
                            setShowHighlightPicker(false);
                          }}
                          className="px-2 py-1 rounded text-xs font-bold bg-sky-200 text-sky-950 border border-sky-400 hover:scale-105 transition cursor-pointer"
                        >
                          Biru
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            wrapSelection('[hl:pink]', '[/hl]', 'sorot peringatan');
                            setShowHighlightPicker(false);
                          }}
                          className="px-2 py-1 rounded text-xs font-bold bg-pink-200 text-pink-950 border border-pink-400 hover:scale-105 transition cursor-pointer"
                        >
                          Pink
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-amber-900/80 font-bold hidden md:inline">
                🎨 Sorot variabel, rumus, & instruksi penting dengan warna
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleInsertBlank}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300 shadow-2xs cursor-pointer transition"
                title="Sisipkan kotak isian kecil di tengah kalimat"
              >
                <span className="text-amber-600 font-mono font-black">[ ... ]</span>
                <span>Isian Singkat</span>
              </button>

              <button
                type="button"
                onClick={handleInsertPg}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300 shadow-2xs cursor-pointer transition"
                title="Sisipkan pilihan ganda dropdown langsung di teks (beri tanda * pada opsi kunci benar)"
              >
                <span className="text-amber-600 font-bold">🔘</span>
                <span>Pilihan Ganda [pg: ...]</span>
              </button>

              <button
                type="button"
                onClick={handleInsertCb}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300 shadow-2xs cursor-pointer transition"
                title="Sisipkan kotak centang multi-pilihan di teks"
              >
                <span className="text-amber-600 font-bold">☑️</span>
                <span>Centang [cb: ...]</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTableModal(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300 shadow-2xs cursor-pointer transition"
                title="Sisipkan tabel interaktif untuk diketik siswa"
              >
                <TableIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>Tambah Tabel Lembar Kerja</span>
              </button>

              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300 shadow-2xs cursor-pointer transition"
                title="Upload gambar bagan / petunjuk soal langsung ke teks"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>Unggah Gambar Naskah</span>
              </button>
            </div>

            {/* Pure Unicode Math Toolbar */}
            <div className="pt-1 border-t border-amber-200/60">
              <MathToolbar onInsert={(char) => insertAtCursor(char)} label="Papan Simbol Matematika Unicode" />
            </div>
          </div>

          {/* Big Freeform Textarea */}
          <div className="space-y-1">
            <textarea
              ref={textareaRef}
              rows={12}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Tuliskan instruksi, wacana masalah matematika, atau soal mengalir layaknya di Word...\n\nContoh:\n## Eksplorasi Sistem Persamaan Linier Dua Variabel (SPLDV)\nSebuah toko bakery memproduksi dua jenis roti: Roti Cokelat ([color:blue]x[/color]) dan Roti Keju ([color:green]y[/color]).\nPersamaan bahan baku tepung dan mentega:\n2x + 3y = 12.000\n4x + 2y = 16.000\n\nDalam bentuk perkalian matriks:\n[ 2  3 / 4  2 ] [ x / y ] = [ 12.000 / 16.000 ]\n\n1. Nilai determinan matriks koefisien adalah [hl:yellow]|A| = [masukkan det*][/hl] dan tergolong [pg: Memiliki Solusi Unik* | Tak Hingga Solusi | Tidak Ada Solusi].\n2. Variabel harga yang dihitung antara lain: [cb: Roti Cokelat (x)* | Roti Keju (y)* | Biaya Listrik].\n\nIsikan data langkah eliminasi pada tabel di bawah ini:\n| No | Metode | Persamaan Hasil |\n|---|---|---|\n| 1 | Eliminasi x | y = [isian] |\n| 2 | Substitusi y | x = [isian] |`}
              className="w-full p-4 rounded-xl border-2 border-amber-300 focus:border-amber-500 text-xs sm:text-sm font-sans leading-relaxed bg-amber-50/20 outline-hidden shadow-inner resize-y"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
              <span>Tips: Gunakan tanda bintang <code>*</code> pada opsi pilihan untuk menandai Kunci Jawaban Benar (contoh: <code>[pg: A | B*]</code>)</span>
              <span>{content.length} karakter</span>
            </div>
          </div>
        </div>
      ) : (
        /* Live Preview Tab */
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50/30 border-2 border-amber-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
            <span className="text-xs font-black text-amber-900 uppercase flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-600" />
              <span>Pratinjau Nyata di Layar Siswa ({roleName})</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Mode Interaktif (Coba ketik di bawah!)
            </span>
          </div>

          <RichWorksheetRenderer
            content={content}
            rolePrefix="preview"
            answers={previewAnswers}
            onAnswerChange={(key, val) => setPreviewAnswers((prev) => ({ ...prev, [key]: val }))}
            disabled={false}
            allowPhotoUpload={true}
          />
        </div>
      )}

      {/* Modal Dialog: Tambah Tabel */}
      {showTableModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowTableModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border-2 border-amber-400"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-black text-amber-950 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-amber-600" />
                <span>Atur Format Tabel Lembar Kerja</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Jumlah Kolom:
                </label>
                <select
                  value={tableCols}
                  onChange={(e) => {
                    const count = Number(e.target.value);
                    setTableCols(count);
                    while (tableHeaders.length < count) {
                      tableHeaders.push(`Kolom ${tableHeaders.length + 1}`);
                    }
                    setTableHeaders([...tableHeaders]);
                  }}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300"
                >
                  <option value={2}>2 Kolom</option>
                  <option value={3}>3 Kolom</option>
                  <option value={4}>4 Kolom</option>
                  <option value={5}>5 Kolom</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Jumlah Baris Isian:
                </label>
                <select
                  value={tableRows}
                  onChange={(e) => setTableRows(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300"
                >
                  <option value={2}>2 Baris</option>
                  <option value={3}>3 Baris</option>
                  <option value={4}>4 Baris</option>
                  <option value={5}>5 Baris</option>
                  <option value={6}>6 Baris</option>
                </select>
              </div>
            </div>

            {/* Header Titles */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Judul Header Kolom:
              </label>
              {Array.from({ length: tableCols }).map((_, cIdx) => (
                <div key={cIdx} className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400 w-16">
                    Kolom {cIdx + 1}:
                  </span>
                  <input
                    type="text"
                    value={tableHeaders[cIdx] || ''}
                    onChange={(e) => {
                      const next = [...tableHeaders];
                      next[cIdx] = e.target.value;
                      setTableHeaders(next);
                    }}
                    placeholder={`Header ${cIdx + 1}`}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-bold"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shadow-md cursor-pointer"
              >
                Sisipkan Tabel ke Naskah ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
