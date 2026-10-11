import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  FileSpreadsheet, 
  Printer, 
  Copy, 
  Check, 
  AlertCircle, 
  Award, 
  Sparkles, 
  Loader2,
  Users
} from 'lucide-react';
import { AgentRole, ROLE_METADATA, RoomData, SubmissionRecord } from '../types';
import { sounds } from '../services/soundEffects';
import { MathText } from './MathRenderer';
import { MascotCharacter } from './MascotIcons';
import { calculateRoomScore } from '../services/scoreCalculator';

interface SubmitMissionModalProps {
  room: RoomData;
  onClose: () => void;
  onSubmitToBackend: (webhookUrl: string) => Promise<SubmissionRecord | null>;
  onOpenTeacherGuide: () => void;
}

export const SubmitMissionModal: React.FC<SubmitMissionModalProps> = ({
  room,
  onClose,
  onSubmitToBackend,
  onOpenTeacherGuide,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(room.webhookUrl || localStorage.getItem('teacher_webhook_url') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<SubmissionRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const agentCount = room.agentCount || 3;
  const visibleRoles: AgentRole[] = (
    agentCount === 3
      ? ['agent1', 'agent2', 'agent3']
      : agentCount === 4
      ? ['agent1', 'agent2', 'agent3', 'agent4']
      : ['agent1', 'agent2', 'agent3', 'agent4', 'agent5']
  );

  // Calculate score with auto-grader
  const scoreDetail = calculateRoomScore(room);
  const score = scoreDetail.calculatedScore;

  const seconds = room.timerRemainingSeconds;
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;

  const handleSubmit = async () => {
    sounds.playClick();
    setIsSubmitting(true);
    setErrorMsg('');

    if (webhookUrl) {
      localStorage.setItem('teacher_webhook_url', webhookUrl);
    }

    try {
      const record = await onSubmitToBackend(webhookUrl);
      if (record) {
        sounds.playSuccess();
        setSubmittedRecord(record);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim laporan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyMarkdown = () => {
    sounds.playClick();
    let text = `# LAPORAN PETUALANGAN BELAJAR KELOMPOK
**Tim**: ${room.teamName} | **Ruang**: ${room.roomId}
**Mata Pelajaran**: ${room.subject} - ${room.topic}
**Sisa Waktu**: ${timeFormatted} | **Skor Otomatis**: ${score}/100
**Pelanggaran Pindah Tab**: ${room.tabSwitchCount || 0}x

### ANGGOTA KELOMPOK (${agentCount} Agen):
`;

    visibleRoles.forEach((role) => {
      const meta = ROLE_METADATA[role];
      const member = room.members[role];
      const task = room.lkmConfig?.agentTasks?.[role];
      const data = (room[`${role}Data` as keyof RoomData] as any) || {};
      text += `\n- **${task?.roleNickname || meta.nickname}: ${task?.roleName || meta.name}** (${member?.name || '-'})`;
      text += `\n  Tugas: ${task?.title || meta.title}`;
      if (data.answers) {
        Object.entries(data.answers).forEach(([qId, ans]) => {
          text += `\n  * ${qId}: ${Array.isArray(ans) ? ans.join(', ') : ans}`;
        });
      }
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border-4 border-amber-300 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 border-b-2 border-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 border border-amber-500 flex items-center justify-center text-xl shadow-xs">
              📜
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-900">
                PENGIRIMAN MISI KELOMPOK TERPADU
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Rekapitulasi Laporan Petualangan Belajar
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800">
          {/* Mission Score & Status Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                🏆
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800">
                  Perhitungan Nilai Otomatis Tim:
                </span>
                <div className="text-2xl font-black text-emerald-950 flex items-baseline gap-2">
                  <span>{score} / 100</span>
                  {scoreDetail.autoGradedQuestions > 0 && (
                    <span className="text-xs font-semibold text-emerald-700">
                      ({scoreDetail.correctCount} dari {scoreDetail.autoGradedQuestions} Soal Objektif Tepat)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black">
                ⏱️ Sisa Waktu: {timeFormatted}
              </span>
            </div>
          </div>

          {/* Anti-Cheat Discipline Status */}
          <div className={`p-3 rounded-2xl border-2 flex items-center justify-between text-xs font-bold ${
            (room.tabSwitchCount || 0) === 0
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            <span className="flex items-center gap-1.5 font-black">
              <span>🛡️ Catatan Integritas & Kedisiplinan Pengerjaan:</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white border border-slate-300">
              {(room.tabSwitchCount || 0) === 0
                ? 'Sempurna (0x Pindah Tab) 🌟'
                : `Terdeteksi ${(room.tabSwitchCount || 0)}x Pindah Tab ⚠️`}
            </span>
          </div>

          {/* Success Banner if Submitted */}
          {submittedRecord && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-emerald-900 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Misi Berhasil Dikirimkan ke Guru! 🎉</span>
              </div>
              <p className="text-xs text-emerald-800">
                Laporan kelompok telah dibukukan dengan ID:{' '}
                <strong className="font-mono">{submittedRecord.id}</strong>. 
                {submittedRecord.webhookStatus === 'sent' && (
                  <span className="ml-1 text-emerald-900 font-bold">
                    ✓ Data berhasil dikirimkan ke Google Sheets Guru!
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Team Members Grid */}
          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-600" />
              <span>ANGGOTA KELOMPOK ({agentCount} AGEN):</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {visibleRoles.map((role) => {
                const meta = ROLE_METADATA[role];
                const customTask = room.lkmConfig?.agentTasks?.[role];
                const displayRole = customTask?.roleName || meta.name;
                const displayNick = customTask?.roleNickname || meta.nickname;
                const member = room.members[role];
                const b = scoreDetail.agentBreakdown[role];

                return (
                  <div
                    key={role}
                    className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center gap-2.5"
                  >
                    <MascotCharacter role={role} size="sm" className="w-8 h-8" />
                    <div className="leading-tight text-xs">
                      <div className="font-black text-slate-900">{displayNick}: {displayRole}</div>
                      <div className="text-slate-600 font-medium">
                        {member?.name || '(Belum bergabung)'}
                      </div>
                      <div className="text-[10px] text-amber-800 font-bold mt-0.5">
                        {b.filled} dari {b.total} Soal Terisi
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Answers Summary per Agent */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase text-amber-900">
              📋 IKHTISAR JAWABAN LEMBAR KERJA SEMUA AGEN:
            </span>

            <div className="space-y-3">
              {visibleRoles.map((role) => {
                const meta = ROLE_METADATA[role];
                const task = room.lkmConfig?.agentTasks?.[role];
                const data = (room[`${role}Data` as keyof RoomData] as any) || {};
                const questions = task?.questions || [];

                return (
                  <div
                    key={role}
                    className="p-3.5 rounded-2xl bg-white border-2 border-amber-100 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-amber-50 pb-1.5">
                      <div className="flex items-center gap-2">
                        <MascotCharacter role={role} size="sm" className="w-5 h-5" />
                        <span className="text-xs font-black text-amber-950">
                          {meta.nickname}: {meta.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">
                        {task?.title || meta.title}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {questions.map((q, idx) => {
                        let ans = data.answers?.[q.id];
                        // If inline blank or table, search for indexed keys
                        if (!ans) {
                          const subKeys = Object.keys(data.answers || {}).filter(k => k.startsWith(`${q.id}_`));
                          if (subKeys.length > 0) {
                            const nonImageKeys = subKeys.filter(k => !k.endsWith('_image'));
                            if (nonImageKeys.length > 0) {
                              ans = nonImageKeys.map(k => data.answers[k]).filter(Boolean).join(' | ');
                            }
                          }
                        }

                        const photoAttachment = data.answers?.[`${q.id}_image`];
                        const hasAns = ans !== undefined && ans !== null && (Array.isArray(ans) ? ans.length > 0 : String(ans).trim() !== '');

                        return (
                          <div key={q.id} className="p-2.5 rounded-xl bg-amber-50/40 border border-amber-100 space-y-1">
                            <div className="text-slate-700 font-bold flex items-start gap-1">
                              <span>#{idx + 1}.</span>
                              <MathText text={q.prompt} inline />
                            </div>
                            <div className="text-slate-900 font-medium pl-3 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                {hasAns ? (
                                  <span className="font-semibold text-emerald-900">
                                    {Array.isArray(ans) ? ans.join('; ') : String(ans)}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">(Belum diisi)</span>
                                )}
                              </div>
                              {photoAttachment && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  <span>📷</span>
                                  <span>Foto Jawaban Terlampir</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Canvas mode answers summary */}
                      {task?.worksheetMode === 'canvas' && (
                        <div className="p-2.5 rounded-xl bg-amber-100/50 border border-amber-200 text-slate-800 space-y-1">
                          <div className="font-black text-amber-950 text-xs">
                            📄 Jawaban Dokumen Mengalir (Canvas):
                          </div>
                          <div className="text-[11px] text-slate-700">
                            Terisi {Object.keys(data.answers || {}).filter(k => k.startsWith(`${role}_`)).length} data isian.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Webhook Configuration for Google Sheets */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-2 border-emerald-300 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>URL WEBHOOK GOOGLE SHEETS GURU (OPSIONAL):</span>
              </label>
              <button
                type="button"
                onClick={onOpenTeacherGuide}
                className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                *Belum punya URL? Buka Panduan Google Sheets
              </button>
            </div>

            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-3 py-2 rounded-xl border border-emerald-300 font-mono text-xs bg-white outline-hidden"
            />
            <p className="text-[11px] text-slate-500">
              *Jika diisi, seluruh jawaban siswa & nilai otomatis langsung tercatat ke Google Sheets Guru.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-amber-50/80 border-t-2 border-amber-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks Laporan'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirimkan...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Laporan Akhir Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
