import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Table, 
  Code2, 
  Send,
  Sparkles
} from 'lucide-react';
import { SubmissionRecord } from '../types';
import { sounds } from '../services/soundEffects';

interface TeacherGuideModalProps {
  onClose: () => void;
}

export const TeacherGuideModal: React.FC<TeacherGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'submissions' | 'tester'>('guide');
  const [copiedScript, setCopiedScript] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [testWebhookUrl, setTestWebhookUrl] = useState(localStorage.getItem('teacher_webhook_url') || '');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const googleAppsScriptCode = `// KODE GOOGLE APPS SCRIPT UNTUK REKAP OTOMATIS APLIKASI PETUALANGAN BELAJAR (LKM)
// 1. Buka Google Spreadsheet baru di browser Anda
// 2. Klik menu: Ekstensi -> Apps Script
// 3. Hapus kode lama, tempel kode di bawah ini, lalu klik Simpan (ikon disket)
// 4. Klik tombol "Deploy" (Terapkan) -> "New deployment" (Deployment baru)
// 5. Pilih jenis "Web app" (Aplikasi web)
//    - Description: Rekap LKM Siswa
//    - Execute as: Me (email Anda)
//    - Who has access: Anyone (Siapa saja)
// 6. Klik "Deploy" -> Salin "Web app URL" dan tempel ke Aplikasi LKM!

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Buat baris judul kolom jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Waktu Kirim",
        "Nama Kelompok",
        "Kode Ruang",
        "PIN LKM",
        "Mata Pelajaran",
        "Topik",
        "Jumlah Agen",
        "Agen 1",
        "Agen 2",
        "Agen 3",
        "Agen 4",
        "Agen 5",
        "Sisa Waktu",
        "Skor Misi",
        "Detail Jawaban Lengkap (JSON)"
      ]);
      // Format header cerah
      var headerRange = sheet.getRange(1, 1, 1, 15);
      headerRange.setBackground("#38bdf8");
      headerRange.setFontColor("#082f49");
      headerRange.setFontWeight("bold");
    }
    
    var anggota = data.anggota || {};
    
    // Tambahkan data baris baru
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString("id-ID"),
      data.kelompok || "-",
      data.kode_ruang || "-",
      data.pin_lkm || "-",
      data.mata_pelajaran || "-",
      data.topik || "-",
      data.jumlah_agen || 3,
      anggota.agen1 || "-",
      anggota.agen2 || "-",
      anggota.agen3 || "-",
      anggota.agen4 || "-",
      anggota.agen5 || "-",
      data.sisa_waktu || "-",
      data.skor_misi || 0,
      JSON.stringify(data.jawaban_kelompok || {})
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
`;

  const copyScript = () => {
    sounds.playClick();
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const loadSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch {} finally {
      setIsLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'submissions') {
      loadSubmissions();
    }
  }, [activeTab]);

  const handleTestWebhook = async () => {
    if (!testWebhookUrl.trim()) {
      setTestStatus('Masukkan URL Webhook Google Apps Script terlebih dahulu.');
      return;
    }
    sounds.playClick();
    setIsTesting(true);
    setTestStatus('Mengirim data uji coba ke Spreadsheet...');

    try {
      const res = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: testWebhookUrl.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        sounds.playSuccess();
        setTestStatus('Sukses! Data uji coba telah berhasil masuk ke baris Spreadsheet Anda! ✨');
        localStorage.setItem('teacher_webhook_url', testWebhookUrl.trim());
      } else {
        setTestStatus(`Gagal: ${data.message || 'Periksa kembali izin Web App Google Apps Script'}`);
      }
    } catch (err: any) {
      setTestStatus(`Error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const downloadCsv = () => {
    sounds.playClick();
    if (submissions.length === 0) return;

    const headers = ['ID', 'Waktu', 'Kelompok', 'Ruang', 'Sisa Waktu', 'Skor', 'Agen 1', 'Agen 2', 'Agen 3', 'Agen 4', 'Agen 5'];
    const rows = submissions.map((s) => [
      s.id,
      s.submittedAt,
      `"${s.teamName}"`,
      s.roomId,
      s.timeRemainingFormatted,
      s.score,
      `"${s.members.agent1 || ''}"`,
      `"${s.members.agent2 || ''}"`,
      `"${s.members.agent3 || ''}"`,
      `"${s.members.agent4 || ''}"`,
      `"${s.members.agent5 || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_lkm_petualangan_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border-4 border-amber-300 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-100 via-teal-50 to-sky-100 border-b-2 border-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-xs">
              📊
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-900">
                PANDUAN GURU & INTEGRASI DATA
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Pusat Rekapitulasi & Google Spreadsheet
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-t-2xl font-black text-xs transition cursor-pointer border-t-2 border-x-2 ${
              activeTab === 'guide'
                ? 'bg-white border-amber-300 text-amber-950 shadow-xs'
                : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Cara Pasang Google Sheets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-t-2xl font-black text-xs transition cursor-pointer border-t-2 border-x-2 ${
              activeTab === 'submissions'
                ? 'bg-white border-amber-300 text-amber-950 shadow-xs'
                : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            📥 Rekap Nilai Siswa Langsung ({submissions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tester')}
            className={`px-4 py-2 rounded-t-2xl font-black text-xs transition cursor-pointer border-t-2 border-x-2 ${
              activeTab === 'tester'
                ? 'bg-white border-amber-300 text-amber-950 shadow-xs'
                : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            🧪 Uji Koneksi Webhook
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 grow">
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 space-y-2 text-xs leading-relaxed">
                <span className="font-black text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>3 LANGKAH MUDAH MENGHUBUNGKAN GOOGLE SPREADSHEET:</span>
                </span>
                <ol className="list-decimal pl-5 space-y-1.5 text-amber-950 font-medium">
                  <li>Buat Spreadsheet baru di Google Drive Anda.</li>
                  <li>Buka menu <strong>Ekstensi &gt; Apps Script</strong>, hapus kode yang ada, lalu tempelkan kode di bawah ini.</li>
                  <li>Klik tombol biru <strong>Deploy (Terapkan) &gt; New deployment (Deployment baru)</strong>, pilih tipe <strong>Web app</strong>, ubah <i>Who has access</i> menjadi <strong>Anyone (Siapa saja)</strong>, lalu salin URL yang diberikan!</li>
                </ol>
              </div>

              {/* Code Box */}
              <div className="rounded-2xl border-2 border-slate-300 overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-800 text-slate-200 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <span>GoogleAppsScript_LKM_Recap.js</span>
                  </span>
                  <button
                    type="button"
                    onClick={copyScript}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition text-[11px] cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-72">
                  {googleAppsScriptCode}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-black uppercase text-slate-700">
                  Daftar Tugas yang Telah Dikirimkan Siswa:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadSubmissions}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
                    <span>Muat Ulang</span>
                  </button>
                  {submissions.length > 0 && (
                    <button
                      type="button"
                      onClick={downloadCsv}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Excel/CSV</span>
                    </button>
                  )}
                </div>
              </div>

              {submissions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl space-y-2">
                  <span className="text-3xl">📭</span>
                  <h4 className="font-bold text-sm text-slate-700">Belum ada pengiriman dari murid</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Ketika murid mengklik tombol [KIRIM MISI] di lembar kerja kelompok, laporan terpadu akan otomatis muncul di sini secara real-time.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-slate-200 overflow-hidden shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Waktu</th>
                        <th className="p-2.5">Kelompok</th>
                        <th className="p-2.5">Ruang</th>
                        <th className="p-2.5">Skor</th>
                        <th className="p-2.5">Status Webhook</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {submissions.map((s) => (
                        <tr key={s.id} className="hover:bg-amber-50/50">
                          <td className="p-2.5 font-mono text-[11px] text-slate-500">{s.submittedAt}</td>
                          <td className="p-2.5 font-bold text-slate-900">{s.teamName}</td>
                          <td className="p-2.5 font-mono text-slate-600">{s.roomId}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
                              {s.score}
                            </span>
                          </td>
                          <td className="p-2.5">
                            {s.webhookStatus === 'sent' ? (
                              <span className="text-emerald-600 font-bold">✓ Terkirim ke Sheet</span>
                            ) : s.webhookStatus === 'failed' ? (
                              <span className="text-rose-500 font-bold">✗ Gagal Kirim</span>
                            ) : (
                              <span className="text-slate-400 font-medium">Tersimpan Lokal</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tester' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 space-y-3">
                <span className="text-xs font-black uppercase text-sky-950">
                  Uji Coba Kirim Data ke Spreadsheet Guru:
                </span>
                <input
                  type="url"
                  value={testWebhookUrl}
                  onChange={(e) => setTestWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sky-300 text-xs font-mono bg-white outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={isTesting}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isTesting ? 'Menguji...' : 'Kirim Baris Uji Coba Sekarang'}
                </button>
              </div>

              {testStatus && (
                <div className={`p-4 rounded-2xl border-2 text-xs font-bold ${
                  testStatus.includes('Sukses')
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                    : 'bg-amber-100 border-amber-300 text-amber-900'
                }`}>
                  {testStatus}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
