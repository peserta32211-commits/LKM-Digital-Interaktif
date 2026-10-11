import React, { useState, useMemo } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Sliders, 
  ShieldCheck, 
  Edit3, 
  Eye, 
  Sparkles, 
  Play, 
  RotateCcw, 
  PlusCircle, 
  Activity, 
  CheckCircle2, 
  FileSpreadsheet,
  Trash2,
  Lock,
  Image as ImageIcon,
  Table as TableIcon
} from 'lucide-react';
import { 
  AgentRole, 
  AgentTaskConfig, 
  LkmConfig, 
  QuestionConfig, 
  ROLE_METADATA, 
  RoomData, 
  RoomMember, 
  SimulationTrial 
} from '../types';
import { sounds } from '../services/soundEffects';
import { MathText, MathToolbar } from './MathRenderer';
import { MascotCharacter } from './MascotIcons';
import { StudentImageUpload } from './StudentImageUpload';
import { RichWorksheetRenderer } from './RichWorksheetRenderer';
import { StudentMathToolbar } from './StudentMathToolbar';
import { AudioRecorderPlayer } from './AudioRecorderPlayer';
import { VideoEmbedPlayer } from './VideoEmbedPlayer';

interface DynamicAgentWorksheetProps {
  role: AgentRole;
  currentRole: AgentRole;
  room: RoomData;
  taskConfig: AgentTaskConfig;
  member: RoomMember;
  onUpdateAnswers: (role: AgentRole, answers: Record<string, any>, completed?: boolean) => void;
  onUpdateSimParams?: (params: any) => void;
  onAddSimTrial?: (trial: SimulationTrial) => void;
  onClearSimTrials?: () => void;
}

export const DynamicAgentWorksheet: React.FC<DynamicAgentWorksheetProps> = ({
  role,
  currentRole,
  room,
  taskConfig,
  member,
  onUpdateAnswers,
  onUpdateSimParams,
  onAddSimTrial,
  onClearSimTrials,
}) => {
  const isMyRole = currentRole === role;
  const isLocked = room.status === 'submitted' || (!room.timerRunning && room.timerRemainingSeconds <= 0);
  const meta = ROLE_METADATA[role];

  // Get current answers for this role from room
  const agentDataKey = `${role}Data` as keyof RoomData;
  const agentData = (room[agentDataKey] as any) || { answers: {}, completed: false };
  const answers: Record<string, any> = agentData.answers || {};
  const isCompleted: boolean = !!agentData.completed;

  // Zoom image modal state
  const [zoomImage, setZoomImage] = useState<{ src: string; caption?: string } | null>(null);

  // Local simulation state if this task is an experiment simulator
  const [param1, setParam1] = useState(room.simulationParams?.bioremediatorDose ?? 40);
  const [param2, setParam2] = useState(room.simulationParams?.aerationRate ?? 5.5);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simDay, setSimDay] = useState(10);

  const hasSimulation = taskConfig.simulationType && taskConfig.simulationType !== 'none';

  // Simulation calculations (for Bioremediation / Physics / Economics)
  const simResults = useMemo(() => {
    const dose = param1;
    const aeration = param2;

    const days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const initialTox = 68;

    const doseEfficacy = Math.max(0, 100 - Math.abs(dose - 45) * 2.2);
    const aerationEfficacy = Math.max(0, 100 - Math.abs(aeration - 6.0) * 16);
    const overallScore = Math.round((doseEfficacy * 0.6) + (aerationEfficacy * 0.4));

    const toxicityPoints = days.map((d) => {
      const decay = (overallScore / 100) * 0.85 * (d / 10);
      return Math.max(4, Math.round(initialTox * (1 - decay)));
    });

    const fishPopulation = days.map((d) => {
      const tox = toxicityPoints[d - 1];
      const pop = Math.min(100, Math.max(5, Math.round(15 + (100 - tox) * 0.85 * (d / 10))));
      return pop;
    });

    return {
      recoveryScore: overallScore,
      finalToxicity: toxicityPoints[9],
      finalFishPop: fishPopulation[9],
      toxicityPoints,
      fishPopulation,
    };
  }, [param1, param2]);

  // Handler for updating a single answer field
  const handleAnswerChange = (questionId: string, value: any) => {
    if (!isMyRole || isLocked) return;
    const updated = {
      ...answers,
      [questionId]: value,
    };
    onUpdateAnswers(role, updated);
  };

  // Toggle checkbox option
  const handleToggleCheckbox = (questionId: string, optionValue: string) => {
    if (!isMyRole || isLocked) return;
    const currentList: string[] = Array.isArray(answers[questionId]) ? answers[questionId] : [];
    let updatedList: string[];
    if (currentList.includes(optionValue)) {
      updatedList = currentList.filter((item) => item !== optionValue);
    } else {
      updatedList = [...currentList, optionValue];
    }
    handleAnswerChange(questionId, updatedList);
  };

  // Toggle completed status
  const handleToggleComplete = () => {
    if (!isMyRole || isLocked) return;
    sounds.playSuccess();
    onUpdateAnswers(role, answers, !isCompleted);
  };

  // Run simulation trial
  const handleRunSimulation = () => {
    if (!isMyRole || isLocked) return;
    sounds.playSimulate();
    setIsSimulating(true);

    if (onUpdateSimParams) {
      onUpdateSimParams({
        bioremediatorDose: param1,
        aerationRate: param2,
      });
    }

    setTimeout(() => {
      setIsSimulating(false);
      sounds.playSuccess();

      if (onAddSimTrial) {
        const newTrial: SimulationTrial = {
          id: `trial_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          pollutantLevel: simResults.finalToxicity,
          bioremediatorDose: param1,
          reactorTemp: 28.5,
          aerationRate: param2,
          recoveryIndex: simResults.recoveryScore,
          producersPop: Math.round(simResults.finalFishPop * 0.9),
          consumers1Pop: Math.round(simResults.finalFishPop * 0.8),
          consumers2Pop: simResults.finalFishPop,
          notes: `Dosis ${param1} CFU/ml, Aerasi ${param2} mg/L -> Pemulihan ${simResults.recoveryScore}%`,
        };
        onAddSimTrial(newTrial);
      }
    }, 700);
  };

  // Render inline blank prompt
  const renderInlineBlankPrompt = (qId: string, promptText: string) => {
    // Splits text by [token]
    const parts = promptText.split(/(\[[^\]]+\])/g);
    let blankIndex = 0;

    return (
      <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
        {parts.map((part, pIdx) => {
          if (!part) return null;
          if (part.startsWith('[') && part.endsWith(']')) {
            const tokenKey = `${qId}_blank_${blankIndex}`;
            blankIndex++;
            const placeholder = part.slice(1, -1).replace(/\*$/, '');
            const cellVal = answers[tokenKey] || '';
            const widthCh = Math.max(10, Math.min(30, placeholder.length + 3));

            return (
              <span key={pIdx} className="inline-block mx-1.5 my-1 align-middle">
                <input
                  type="text"
                  value={cellVal}
                  disabled={!isMyRole || isLocked}
                  placeholder={placeholder || '...'}
                  style={{ width: `${widthCh}ch` }}
                  onChange={(e) => handleAnswerChange(tokenKey, e.target.value)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-black rounded-xl border-2 transition outline-hidden shadow-2xs ${
                    cellVal
                      ? 'bg-amber-100 border-amber-500 text-amber-950 font-black'
                      : 'bg-white border-amber-300 text-slate-800 placeholder:text-amber-700/50 hover:border-amber-400 focus:border-amber-500'
                  } ${!isMyRole || isLocked ? 'bg-slate-50 cursor-not-allowed opacity-90' : ''}`}
                />
              </span>
            );
          }
          return <MathText key={pIdx} text={part} inline />;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className={`p-4 sm:p-5 rounded-3xl border-3 ${meta.borderLight} ${meta.bgLight} shadow-sm space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MascotCharacter role={role} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  {meta.badge}
                </span>
                {isCompleted && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500 text-white flex items-center gap-1 shadow-2xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>LKM Selesai</span>
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {taskConfig.roleName || meta.name} ({taskConfig.roleNickname || meta.nickname})
              </h3>
              <p className="text-xs font-semibold text-slate-600">
                {taskConfig.title || meta.title} {taskConfig.tagline ? `· ${taskConfig.tagline}` : ''}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-500">Penanggung Jawab:</div>
            <div className="text-xs sm:text-sm font-black text-slate-800">
              {member.name || '(Belum Ada Anggota)'}
            </div>
          </div>
        </div>

        {/* Task Instructions */}
        {taskConfig.instructions && (
          <div className="p-3 bg-white/90 rounded-2xl border border-amber-200/80 text-xs sm:text-sm text-slate-700 font-medium">
            <span className="font-black text-amber-900">🎯 Misi Khusus: </span>
            <MathText text={taskConfig.instructions} inline />
          </div>
        )}
      </div>

      {/* SIMULATOR (If agent has simulation enabled) */}
      {hasSimulation && (
        <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/70 border-3 border-emerald-300 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                🧪
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-emerald-950 uppercase tracking-wide">
                  Laboratorium Simulator Interaktif
                </h4>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  Uji coba parameter lingkungan & lihat efeknya pada ekosistem danau
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!isMyRole || isLocked || isSimulating}
                onClick={handleRunSimulation}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSimulating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{isSimulating ? 'Menjalankan...' : 'Jalankan Uji Coba!'}</span>
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>{taskConfig.param1Label || 'Dosis Bakteri Pengurai'}:</span>
                <span className="text-emerald-700 font-black">{param1} CFU/ml</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={param1}
                disabled={!isMyRole || isLocked}
                onChange={(e) => setParam1(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>10 CFU</span>
                <span>Optimal ~45 CFU</span>
                <span>90 CFU</span>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>{taskConfig.param2Label || 'Laju Aerasi Injeksi Oksigen'}:</span>
                <span className="text-emerald-700 font-black">{param2} mg/L</span>
              </div>
              <input
                type="range"
                min={2.0}
                max={9.0}
                step={0.5}
                value={param2}
                disabled={!isMyRole || isLocked}
                onChange={(e) => setParam2(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>2.0 mg/L</span>
                <span>Optimal ~6.0 mg/L</span>
                <span>9.0 mg/L</span>
              </div>
            </div>
          </div>

          {/* Live Outcome Indicators */}
          <div className="p-3 bg-white/90 rounded-2xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Skor Pemulihan Ekosistem:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                simResults.recoveryScore >= 75
                  ? 'bg-emerald-100 text-emerald-800'
                  : simResults.recoveryScore >= 50
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {simResults.recoveryScore}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 font-bold text-slate-700">
                <span>Sisa Racun: </span>
                <span className="font-black text-rose-600">{simResults.finalToxicity} ppm</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 font-bold text-slate-700">
                <span>Populasi Ikan: </span>
                <span className="font-black text-sky-600">{simResults.finalFishPop}%</span>
              </div>
            </div>
          </div>

          {/* Trial Log Table (Shared with Team) */}
          {room.simulationTrials && room.simulationTrials.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-black text-emerald-950 uppercase">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Jurnal Catatan Percobaan Tim ({room.simulationTrials.length} Data):</span>
                </span>
                {onClearSimTrials && isMyRole && !isLocked && (
                  <button
                    type="button"
                    onClick={onClearSimTrials}
                    className="text-rose-500 hover:text-rose-700 text-[11px] font-bold cursor-pointer"
                  >
                    Hapus Riwayat
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-emerald-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-emerald-100/70 text-emerald-900 font-bold">
                    <tr>
                      <th className="p-2">Waktu</th>
                      <th className="p-2">Dosis</th>
                      <th className="p-2">Aerasi</th>
                      <th className="p-2">Sisa Racun</th>
                      <th className="p-2">Skor Pemulihan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {room.simulationTrials.map((t) => (
                      <tr key={t.id} className="hover:bg-emerald-50/50">
                        <td className="p-2 font-mono text-[11px] text-slate-500">{t.timestamp}</td>
                        <td className="p-2 font-bold text-slate-800">{t.bioremediatorDose} CFU</td>
                        <td className="p-2 font-bold text-slate-800">{t.aerationRate} mg/L</td>
                        <td className="p-2 text-rose-600 font-bold">{t.pollutantLevel} ppm</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
                            {t.recoveryIndex}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WORKSHEET CONTENT: CHECK IF CANVAS MODE OR CARDS MODE */}
      {taskConfig.worksheetMode === 'canvas' && taskConfig.worksheetContent ? (
        /* CANVAS MODE: Freeform flowing document */
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/40 border-3 border-amber-300 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <span className="text-xs sm:text-sm font-black text-amber-950 uppercase flex items-center gap-1.5">
              <span>📄</span>
              <span>LEMBAR KERJA DOKUMEN MENGALIR ({meta.nickname.toUpperCase()}):</span>
            </span>
            <span className="text-xs text-amber-800 font-semibold">
              {isLocked
                ? 'Misi Terkunci'
                : isMyRole
                ? 'Isi lembar kerja di bawah ini'
                : `Hanya ${member.name || meta.nickname} yang bisa mengisi`}
            </span>
          </div>

          <RichWorksheetRenderer
            content={taskConfig.worksheetContent}
            rolePrefix={role}
            answers={answers}
            onAnswerChange={(key, val) => handleAnswerChange(key, val)}
            disabled={!isMyRole || isLocked}
            allowPhotoUpload={true}
          />
        </div>
      ) : (
        /* STRUCTURED CARDS MODE: Questions array */
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-amber-100 pb-2">
            <span className="text-xs sm:text-sm font-black text-amber-950 uppercase flex items-center gap-1.5">
              <span>📝</span>
              <span>LEMBAR JAWABAN {meta.nickname.toUpperCase()} ({taskConfig.questions.length} SOAL):</span>
            </span>
            <span className="text-xs text-amber-800 font-semibold">
              {isLocked
                ? 'Misi Terkunci / Selesai'
                : isMyRole
                ? 'Ketik jawabanmu di bawah ini'
                : `Hanya ${member.name || meta.nickname} yang bisa mengisi`}
            </span>
          </div>

          {taskConfig.questions.map((q, idx) => {
            const currentVal = answers[q.id];

            return (
              <div
                key={q.id}
                className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border-2 border-amber-200 space-y-3.5 shadow-2xs hover:border-amber-300 transition"
              >
                {/* Question Header & Prompt */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-200 text-amber-900 text-xs font-black">
                      Soal #{idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      {q.type === 'short' && 'Isian Singkat'}
                      {q.type === 'essay' && 'Uraian & Analisis'}
                      {q.type === 'multiple_choice' && 'Pilihan Ganda'}
                      {q.type === 'checkbox' && 'Pilihan Banyak (Checkbox)'}
                      {q.type === 'inline_blank' && 'Isian di Tengah Kalimat'}
                      {q.type === 'table' && 'Tabel Lembar Kerja'}
                    </span>
                  </div>

                  {/* Question visual guide image if uploaded by teacher */}
                  {q.imageUrl && (
                    <div className="my-2">
                      <div className="relative inline-block max-w-full rounded-2xl overflow-hidden border-2 border-amber-300 shadow-xs bg-white">
                        <img
                          src={q.imageUrl}
                          alt="Petunjuk soal"
                          className="max-h-64 w-auto object-contain cursor-pointer hover:opacity-95"
                          onClick={() => setZoomImage({ src: q.imageUrl!, caption: q.imageCaption || `Petunjuk Soal #${idx + 1}` })}
                        />
                        <div className="p-2 bg-amber-50/90 border-t border-amber-200 text-[11px] font-bold text-slate-700 flex items-center justify-between">
                          <span>{q.imageCaption || 'Petunjuk visual soal'}</span>
                          <span className="text-amber-700 cursor-pointer" onClick={() => setZoomImage({ src: q.imageUrl!, caption: q.imageCaption })}>
                            Perbesar 🔍
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Guru Audio Instruksi jika ada */}
                  {q.audioUrl && (
                    <div className="pt-1">
                      <AudioRecorderPlayer
                        audioUrl={q.audioUrl}
                        mode="player_only"
                      />
                    </div>
                  )}

                  {/* Guru Video Pembelajaran jika ada */}
                  {q.videoUrl && (
                    <div className="pt-1">
                      <VideoEmbedPlayer
                        videoUrl={q.videoUrl}
                        title={`Video Pembelajaran Soal #${idx + 1}`}
                      />
                    </div>
                  )}

                  {/* Render Prompt based on type */}
                  {q.type === 'inline_blank' ? (
                    <div className="space-y-2.5">
                      {renderInlineBlankPrompt(q.id, q.prompt)}
                      {isMyRole && !isLocked && (
                        <StudentMathToolbar
                          onInsert={(char) => {
                            const firstBlankKey = `${q.id}_blank_0`;
                            handleAnswerChange(firstBlankKey, (answers[firstBlankKey] || '') + char);
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      <MathText text={q.prompt} inline />
                    </div>
                  )}
                </div>

                {/* 1. Tipe Soal: Isian Singkat */}
                {q.type === 'short' && (
                  <div className="space-y-2">
                    {isMyRole && !isLocked && (
                      <StudentMathToolbar
                        onInsert={(char) =>
                          handleAnswerChange(q.id, (currentVal || '') + char)
                        }
                      />
                    )}
                    <input
                      type="text"
                      value={currentVal || ''}
                      disabled={!isMyRole || isLocked}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder={q.placeholder || 'Ketik jawaban matematika di sini (contoh: x = ½ atau 50%)...'}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-500 text-xs sm:text-sm bg-white font-medium outline-hidden disabled:bg-slate-50 disabled:cursor-not-allowed shadow-2xs"
                    />
                    {currentVal && (
                      <div className="text-xs text-amber-950 bg-white p-2 rounded-xl border border-amber-200 flex items-center gap-2">
                        <span className="font-bold text-amber-800">Jawaban Tercatat: </span>
                        <MathText text={currentVal} inline />
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Tipe Soal: Uraian / Analisis */}
                {q.type === 'essay' && (
                  <div className="space-y-2">
                    {isMyRole && !isLocked && (
                      <StudentMathToolbar
                        onInsert={(char) =>
                          handleAnswerChange(q.id, (currentVal || '') + char)
                        }
                      />
                    )}
                    <textarea
                      rows={3}
                      value={currentVal || ''}
                      disabled={!isMyRole || isLocked}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder={q.placeholder || 'Tuliskan langkah pengerjaan, penalaran rumus, dan kesimpulan tim...'}
                      className="w-full p-3 rounded-xl border-2 border-amber-200 focus:border-amber-500 text-xs sm:text-sm bg-white font-medium outline-hidden disabled:bg-slate-50 disabled:cursor-not-allowed shadow-2xs font-sans"
                    />
                    {currentVal && (
                      <div className="text-xs text-amber-950 bg-white p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
                        <span className="font-bold text-amber-800">Uraian Tercatat: </span>
                        <MathText text={currentVal} inline />
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Tipe Soal: Pilihan Ganda (A, B, C, D) */}
                {q.type === 'multiple_choice' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {(q.options || []).map((opt, optIdx) => {
                      const isSelected = currentVal === opt;
                      const letter = String.fromCharCode(65 + optIdx);

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={!isMyRole || isLocked}
                          onClick={() => {
                            sounds.playClick();
                            handleAnswerChange(q.id, opt);
                          }}
                          className={`text-left p-3 rounded-xl border-2 transition flex items-start gap-2.5 cursor-pointer disabled:cursor-not-allowed ${
                            isSelected
                              ? 'bg-amber-100 border-amber-500 shadow-xs'
                              : 'bg-white border-amber-200 hover:border-amber-400'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-amber-500 text-white'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {letter}
                          </span>
                          <div className="text-xs sm:text-sm font-semibold text-slate-800 grow pt-0.5">
                            <MathText text={opt} inline />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 4. Tipe Soal: Pilihan Banyak / Checkbox */}
                {q.type === 'checkbox' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {(q.options || []).map((opt, optIdx) => {
                      const list: string[] = Array.isArray(currentVal) ? currentVal : [];
                      const isChecked = list.includes(opt);

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={!isMyRole || isLocked}
                          onClick={() => {
                            sounds.playClick();
                            handleToggleCheckbox(q.id, opt);
                          }}
                          className={`text-left p-2.5 rounded-xl border-2 transition flex items-center gap-2.5 cursor-pointer disabled:cursor-not-allowed ${
                            isChecked
                              ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                              : 'bg-white border-amber-200 hover:border-amber-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                              isChecked
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-800">
                            <MathText text={opt} inline />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 5. Tipe Soal: Tabel Dinamis (Worksheet Table) */}
                {q.type === 'table' && (
                  <div className="space-y-2 pt-1">
                    {isMyRole && !isLocked && (
                      <StudentMathToolbar
                        onInsert={(char) => {
                          const targetKey = `${q.id}_r0_c1`;
                          handleAnswerChange(targetKey, (answers[targetKey] || '') + char);
                        }}
                      />
                    )}
                    <div className="overflow-x-auto rounded-2xl border-2 border-amber-200 bg-white shadow-2xs">
                      <table className="w-full text-left text-xs sm:text-sm border-collapse">
                        <thead className="bg-amber-100/80 text-amber-950 font-black border-b-2 border-amber-200">
                          <tr>
                            {(q.tableHeaders || ['No', 'Kolom 1', 'Kolom 2']).map((h, hIdx) => (
                              <th key={hIdx} className="p-2.5 border-r border-amber-200 last:border-r-0">
                                <MathText text={h} inline />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-100">
                          {Array.from({ length: q.tableRowCount || 3 }).map((_, rIdx) => (
                            <tr key={rIdx} className="hover:bg-amber-50/40">
                              {(q.tableHeaders || ['No', 'Kolom 1', 'Kolom 2']).map((h, cIdx) => {
                                const isNoCol = cIdx === 0 && h.toLowerCase().includes('no');
                                const cellKey = `${q.id}_r${rIdx}_c${cIdx}`;
                                const cellVal = answers[cellKey] || '';

                                return (
                                  <td key={cIdx} className="p-2 border-r border-amber-100 last:border-r-0">
                                    {isNoCol ? (
                                      <div className="p-2 font-bold text-center text-slate-600 bg-slate-50 rounded-lg">
                                        {rIdx + 1}
                                      </div>
                                    ) : (
                                      <input
                                        type="text"
                                        value={cellVal}
                                        disabled={!isMyRole || isLocked}
                                        placeholder={`Isi baris ${rIdx + 1}...`}
                                        onChange={(e) => handleAnswerChange(cellKey, e.target.value)}
                                        className={`w-full px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-amber-200 focus:border-amber-500 bg-white outline-hidden ${
                                          cellVal ? 'bg-amber-50/50 font-bold border-amber-400' : ''
                                        } disabled:bg-slate-50 disabled:cursor-not-allowed`}
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
                )}

                {/* Student Photo/Sketch Upload for this specific question */}
                <div className="pt-1 border-t border-amber-100/80">
                  <StudentImageUpload
                    label="📷 Upload Foto Jawaban / Sketsa Soal Ini"
                    sublabel="Ambil foto coretan rumus, sketsa, atau bukti kerja kelompok"
                    imageData={answers[`${q.id}_image`]}
                    disabled={!isMyRole || isLocked}
                    onChange={(dataUrl) => handleAnswerChange(`${q.id}_image`, dataUrl)}
                  />
                </div>

                {/* Student Voice Note / Oral Explanation Response */}
                <div className="pt-1">
                  <AudioRecorderPlayer
                    mode="student_voice_note"
                    label="🎙️ Rekam Penjelasan Lisan Siswa (Voice Note):"
                    sublabel="Jelaskan cara berpikir atau penalaran matematika tim lewat suara"
                    audioUrl={answers[`${q.id}_audio`]}
                    disabled={!isMyRole || isLocked}
                    onAudioChange={(audioData) => handleAnswerChange(`${q.id}_audio`, audioData)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Button */}
      <div className="pt-4 border-t-2 border-amber-100 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-medium">
          {isCompleted ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Bagian {meta.name} sudah ditandai selesai!</span>
            </span>
          ) : (
            <span>Pastikan semua nomor terisi sebelum menandai selesai.</span>
          )}
        </div>

        {isMyRole && !isLocked && (
          <button
            type="button"
            onClick={handleToggleComplete}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition shadow-md active:scale-95 cursor-pointer ${
              isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-2 border-amber-500'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isCompleted ? 'Sudah Selesai (Klik untuk Buka Lagi)' : 'Tandai Bagian Ini Selesai ✨'}</span>
          </button>
        )}
      </div>

      {/* Zoom Image Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full p-4 relative space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>{zoomImage.caption || 'Pratinjau Petunjuk Soal'}</span>
              </span>
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-xl bg-slate-900 flex items-center justify-center">
              <img src={zoomImage.src} alt="Detail" className="max-w-full max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
