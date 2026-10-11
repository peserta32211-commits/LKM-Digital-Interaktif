import { templateMat3, defaultMathTemplates } from '../constants/defaultMathTemplates';
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Save, 
  Copy, 
  Check, 
  Key, 
  BookOpen, 
  Clock, 
  Users, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  HelpCircle, 
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  Link,
  Award,
  Image as ImageIcon,
  Table as TableIcon,
  Edit3,
  FileText,
  Video,
  Mic
} from 'lucide-react';
import { AgentRole, AgentTaskConfig, LkmConfig, QuestionConfig, QuestionType, ROLE_METADATA } from '../types';
import { sounds } from '../services/soundEffects';
import { MathText, MathToolbar } from './MathRenderer';
import { MascotCharacter, DanauCerminCartoonBackground } from './MascotIcons';
import { TeacherImageUpload } from './TeacherImageUpload';
import { TeacherCanvasEditor } from './TeacherCanvasEditor';
import { VisualMathEditor } from './VisualMathEditor';
import { AudioRecorderPlayer } from './AudioRecorderPlayer';
import { VideoEmbedPlayer } from './VideoEmbedPlayer';

interface TeacherLkmGeneratorProps {
  onBackToStudentPortal: () => void;
  onSelectLkmForStudent: (config: LkmConfig) => void;
  onOpenTeacherGuide: () => void;
}

export const TeacherLkmGenerator: React.FC<TeacherLkmGeneratorProps> = ({
  onBackToStudentPortal,
  onSelectLkmForStudent,
  onOpenTeacherGuide,
}) => {
  const [configs, setConfigs] = useState<LkmConfig[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [createdPin, setCreatedPin] = useState('');
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form States (Initialized to templateMat3 Mathematics)
  const [pinInput, setPinInput] = useState(templateMat3.pin);
  const [title, setTitle] = useState(templateMat3.title);
  const [subject, setSubject] = useState(templateMat3.subject);
  const [topic, setTopic] = useState(templateMat3.topic);
  const [grade, setGrade] = useState(templateMat3.grade);
  const [timerMinutes, setTimerMinutes] = useState<number>(templateMat3.timerMinutes);
  const [agentCount, setAgentCount] = useState<3 | 4 | 5>((templateMat3.agentCount as 3) || 3);
  const [storyBriefing, setStoryBriefing] = useState(templateMat3.storyBriefing);
  const [storyBriefingImage, setStoryBriefingImage] = useState<string | undefined>(templateMat3.storyBriefingImage);
  const [storyAudioUrl, setStoryAudioUrl] = useState<string | undefined>(templateMat3.storyAudioUrl);
  const [storyVideoUrl, setStoryVideoUrl] = useState<string>(templateMat3.storyVideoUrl || '');

  const [clues, setClues] = useState<[any, any, any]>(templateMat3.clues as any);

  // Tasks for Agents
  const [agentTasks, setAgentTasks] = useState<Record<AgentRole, AgentTaskConfig>>(templateMat3.agentTasks as any);

  const [webhookUrl, setWebhookUrl] = useState(
    localStorage.getItem('teacher_webhook_url') || ''
  );
  const [activeTabAgent, setActiveTabAgent] = useState<AgentRole>('agent1');

  // Load existing LKM configs on mount
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const res = await fetch('/api/lkm');
      if (res.ok) {
        const data = await res.json();
        if (data.configs) {
          setConfigs(data.configs && data.configs.length > 0 ? data.configs : defaultMathTemplates);
        }
      }
    } catch (err) {
      console.error('Failed to load configs', err);
      setConfigs(defaultMathTemplates);
    }
  };

  const handleSelectPreset = (preset: LkmConfig) => {
    sounds.playClick();
    setPinInput(preset.pin);
    setTitle(preset.title);
    setSubject(preset.subject);
    setTopic(preset.topic);
    setGrade(preset.grade);
    setTimerMinutes(preset.timerMinutes);
    setAgentCount(preset.agentCount || 3);
    setStoryBriefing(preset.storyBriefing);
    setStoryBriefingImage(preset.storyBriefingImage);
    setStoryAudioUrl(preset.storyAudioUrl);
    setStoryVideoUrl(preset.storyVideoUrl || '');
    if (preset.clues) {
      setClues(preset.clues);
    }
    if (preset.agentTasks) {
      setAgentTasks(preset.agentTasks);
    }
    if (preset.webhookUrl) {
      setWebhookUrl(preset.webhookUrl);
    }
    setStatusMsg(`Template "${preset.title}" (PIN: ${preset.pin}) berhasil dimuat ke formulir!`);
  };

  // Update Agent Task field
  const handleUpdateTaskField = (agentRole: AgentRole, field: keyof AgentTaskConfig, val: any) => {
    setAgentTasks((prev) => ({
      ...prev,
      [agentRole]: {
        ...prev[agentRole],
        [field]: val,
      },
    }));
  };

  // Add Question to Agent
  const handleAddQuestion = (agentRole: AgentRole) => {
    sounds.playClick();
    const currentQuestions = agentTasks[agentRole].questions || [];
    const newId = `q_${agentRole}_${Date.now().toString(36)}`;
    const newQ: QuestionConfig = {
      id: newId,
      type: 'essay',
      prompt: 'Tuliskan pertanyaan / tugas baru untuk agen ini...',
      placeholder: 'Jawaban murid...',
    };
    setAgentTasks((prev) => ({
      ...prev,
      [agentRole]: {
        ...prev[agentRole],
        questions: [...currentQuestions, newQ],
      },
    }));
  };

  // Remove Question
  const handleRemoveQuestion = (agentRole: AgentRole, qId: string) => {
    sounds.playClick();
    setAgentTasks((prev) => ({
      ...prev,
      [agentRole]: {
        ...prev[agentRole],
        questions: prev[agentRole].questions.filter((q) => q.id !== qId),
      },
    }));
  };

  // Update Question Field
  const handleUpdateQuestion = (agentRole: AgentRole, qId: string, field: keyof QuestionConfig, val: any) => {
    setAgentTasks((prev) => ({
      ...prev,
      [agentRole]: {
        ...prev[agentRole],
        questions: prev[agentRole].questions.map((q) => {
          if (q.id === qId) {
            const updated = { ...q, [field]: val };
            if (field === 'type') {
              if (val === 'multiple_choice' || val === 'checkbox') {
                if (!updated.options || updated.options.length === 0) {
                  updated.options = ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'];
                }
              }
              if (val === 'checkbox') {
                updated.correctAnswer = [];
              } else if (val === 'multiple_choice') {
                updated.correctAnswer = updated.options?.[0] || '';
              } else if (val === 'table') {
                updated.tableHeaders = updated.tableHeaders || ['No', 'Parameter / Sampel', 'Hasil Uji', 'Keterangan'];
                updated.tableRowCount = updated.tableRowCount || 3;
              } else if (val === 'inline_blank') {
                if (!updated.prompt.includes('[')) {
                  updated.prompt = 'Nilai pengamatan adalah [masukkan nilai] dan berstatus [normal/kritis].';
                }
              }
            }
            return updated;
          }
          return q;
        }),
      },
    }));
  };

  // Update Option in multiple choice / checkbox
  const handleUpdateOption = (agentRole: AgentRole, qId: string, optIndex: number, text: string) => {
    setAgentTasks((prev) => ({
      ...prev,
      [agentRole]: {
        ...prev[agentRole],
        questions: prev[agentRole].questions.map((q) => {
          if (q.id === qId && q.options) {
            const oldVal = q.options[optIndex];
            const newOpts = [...q.options];
            newOpts[optIndex] = text;
            
            let newCorrectAnswer = q.correctAnswer;
            if (q.type === 'multiple_choice' && q.correctAnswer === oldVal) {
              newCorrectAnswer = text;
            } else if (q.type === 'checkbox' && Array.isArray(q.correctAnswer)) {
              newCorrectAnswer = q.correctAnswer.map((item) => (item === oldVal ? text : item));
            }

            return { ...q, options: newOpts, correctAnswer: newCorrectAnswer };
          }
          return q;
        }),
      },
    }));
  };

  // Add Option to question
  const handleAddOption = (agentRole: AgentRole, qId: string) => {
    sounds.playClick();
    setAgentTasks((prev) => ({
      ...prev,
      [agentRole]: {
        ...prev[agentRole],
        questions: prev[agentRole].questions.map((q) => {
          if (q.id === qId) {
            const newOpts = [...(q.options || []), `Pilihan Baru ${(q.options?.length || 0) + 1}`];
            return { ...q, options: newOpts };
          }
          return q;
        }),
      },
    }));
  };

  // Remove Option from question
  const handleRemoveOption = (agentRole: AgentRole, qId: string, optIndex: number) => {
    sounds.playClick();
    setAgentTasks((prev) => ({
      ...prev,
      [agentRole]: {
        ...prev[agentRole],
        questions: prev[agentRole].questions.map((q) => {
          if (q.id === qId && q.options) {
            const removedVal = q.options[optIndex];
            const newOpts = q.options.filter((_, idx) => idx !== optIndex);
            
            let newCorrectAnswer = q.correctAnswer;
            if (q.type === 'multiple_choice' && q.correctAnswer === removedVal) {
              newCorrectAnswer = newOpts[0] || '';
            } else if (q.type === 'checkbox' && Array.isArray(q.correctAnswer)) {
              newCorrectAnswer = q.correctAnswer.filter((item) => item !== removedVal);
            }

            return { ...q, options: newOpts, correctAnswer: newCorrectAnswer };
          }
          return q;
        }),
      },
    }));
  };

  // Toggle correct answer for multiple_choice or checkbox
  const handleToggleCorrectAnswer = (agentRole: AgentRole, qId: string, optVal: string, type: QuestionType) => {
    sounds.playClick();
    setAgentTasks((prev) => ({
      ...prev,
      [agentRole]: {
        ...prev[agentRole],
        questions: prev[agentRole].questions.map((q) => {
          if (q.id === qId) {
            if (type === 'multiple_choice') {
              return { ...q, correctAnswer: optVal };
            } else if (type === 'checkbox') {
              const currentList = Array.isArray(q.correctAnswer) ? [...q.correctAnswer] : [];
              const exists = currentList.includes(optVal);
              const nextList = exists 
                ? currentList.filter(item => item !== optVal)
                : [...currentList, optVal];
              return { ...q, correctAnswer: nextList };
            }
          }
          return q;
        }),
      },
    }));
  };

  // Save LKM
  const handleSaveLkm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Judul LKM harus diisi!');
      return;
    }
    sounds.playClick();
    setIsSaving(true);
    setStatusMsg('');

    try {
      const payload: Partial<LkmConfig> = {
        pin: pinInput.trim().toUpperCase() || undefined,
        title: title.trim(),
        subject: subject.trim(),
        topic: topic.trim(),
        grade: grade.trim(),
        timerMinutes: Number(timerMinutes),
        agentCount,
        storyBriefing: storyBriefing.trim(),
        storyBriefingImage: storyBriefingImage || undefined,
        storyAudioUrl: storyAudioUrl || undefined,
        storyVideoUrl: storyVideoUrl.trim() || undefined,
        clues,
        agentTasks,
        webhookUrl: webhookUrl.trim() || undefined,
      };

      const res = await fetch('/api/lkm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        sounds.playSuccess();
        setCreatedPin(json.pin);
        setPinInput(json.pin);
        setStatusMsg(`LKM Berhasil Disimpan! Kode PIN: ${json.pin}`);
        if (webhookUrl) {
          localStorage.setItem('teacher_webhook_url', webhookUrl);
        }
        loadConfigs();
      } else {
        alert('Gagal menyimpan LKM. Silakan coba kembali.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyPinToClipboard = (pinToCopy: string) => {
    sounds.playClick();
    navigator.clipboard.writeText(pinToCopy);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const copyDirectLinkToClipboard = (pin: string) => {
    sounds.playClick();
    const url = `${window.location.origin}${window.location.pathname}?pin=${pin}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const visibleRoles: AgentRole[] = (
    agentCount === 3
      ? ['agent1', 'agent2', 'agent3']
      : agentCount === 4
      ? ['agent1', 'agent2', 'agent3', 'agent4']
      : ['agent1', 'agent2', 'agent3', 'agent4', 'agent5']
  );

  return (
    <div className="relative min-h-screen bg-sky-50 text-slate-800 pb-16 font-sans">
      <DanauCerminCartoonBackground />

      {/* Top Navbar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-amber-200 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToStudentPortal}
              className="px-3.5 py-1.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black text-xs sm:text-sm cursor-pointer transition shadow-2xs flex items-center gap-1.5"
            >
              <span>← Masuk Portal Siswa</span>
            </button>
            <div className="h-5 w-px bg-amber-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center text-amber-950 font-black text-sm shadow-2xs">
                🎓
              </span>
              <div>
                <h1 className="text-sm sm:text-base font-black text-amber-950 leading-tight">
                  Portal Guru: Pembuat LKM Interaktif
                </h1>
                <p className="text-[11px] text-amber-800 font-semibold">
                  Ketik Dokumen Bebas, Sisipkan Rumus, Tabel & Kunci Jawaban
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenTeacherGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs border border-sky-300 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>Panduan Guru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-6 relative z-10">
        {/* Banner Status Success */}
        {statusMsg && (
          <div className="p-4 rounded-2xl bg-emerald-100/90 border-2 border-emerald-400 text-emerald-950 font-bold text-xs sm:text-sm flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{statusMsg}</span>
            </div>
            {createdPin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyPinToClipboard(createdPin)}
                  className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs flex items-center gap-1"
                >
                  {copiedPin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPin ? 'PIN Tersalin!' : 'Salin PIN'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyDirectLinkToClipboard(createdPin)}
                  className="px-3 py-1 rounded-xl bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 font-black text-xs cursor-pointer shadow-xs flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Tersalin!' : 'Salin Direct Link'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Form Grid */}
        <form onSubmit={handleSaveLkm} className="space-y-6">
          {/* Card 1: Informasi Dasar LKM */}
          <div className="bg-white/95 backdrop-blur-md border-3 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 border-b border-amber-100 pb-3">
              <span className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center font-black">
                1
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Identitas LKM & Jumlah Anggota Tim Siswa
                </h3>
                <p className="text-xs text-slate-500">
                  Tentukan tema materi, durasi pengerjaan, dan jumlah agen dalam satu kelompok (3, 4, atau 5).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mata Pelajaran:
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Matematika"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 focus:border-amber-400 text-xs sm:text-sm bg-white font-medium outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topik / Bab Materi:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Matriks & Sistem Persamaan Linier"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 focus:border-amber-400 text-xs sm:text-sm bg-white font-medium outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jenjang / Kelas:
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Contoh: SMA Kelas 10 (Fase E)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 focus:border-amber-400 text-xs sm:text-sm bg-white font-medium outline-hidden"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Petualangan Belajar:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Eksplorasi Matriks & Sistem Persamaan Linier (SPLDV)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 focus:border-amber-400 text-xs sm:text-sm bg-white font-bold text-slate-800 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Durasi Pengerjaan (Menit):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 focus:border-amber-400 text-xs sm:text-sm bg-white font-bold outline-hidden"
                    required
                  />
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Menit</span>
                </div>
              </div>
            </div>

            {/* Jumlah Agen / Anggota Kelompok Selector */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-200 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-black text-amber-950 uppercase flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>Jumlah Agen / Anggota Tim per Kelompok:</span>
                </label>
                <span className="text-xs text-amber-800 font-semibold">
                  Pilih formasi kelompok sesuai jumlah siswa di kelas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {[
                  {
                    count: 3 as const,
                    title: '3 Agen (Formasi Inti)',
                    desc: 'Agen 1 (Data), Agen 2 (Uji Coba), Agen 3 (Keputusan)',
                    color: 'border-sky-300 hover:border-sky-400',
                  },
                  {
                    count: 4 as const,
                    title: '4 Agen (Plus Komunikasi)',
                    desc: 'Ditambah Agen 4: Si Pembawa Cerita (Sosialisasi)',
                    color: 'border-rose-300 hover:border-rose-400',
                  },
                  {
                    count: 5 as const,
                    title: '5 Agen (Tim Lengkap)',
                    desc: 'Ditambah Agen 5: Si Penjaga Kualitas (Audit Mutu)',
                    color: 'border-purple-300 hover:border-purple-400',
                  },
                ].map((item) => {
                  const isSelected = agentCount === item.count;
                  return (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setAgentCount(item.count);
                      }}
                      className={`p-3 rounded-2xl text-left border-2 transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-100 border-amber-500 shadow-sm scale-101'
                          : `bg-white ${item.color}`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-slate-900">{item.title}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-tight">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Cerita Kasus & Fakta Petunjuk */}
          <div className="bg-white/95 backdrop-blur-md border-3 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 border-b border-amber-100 pb-3">
              <span className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center font-black">
                2
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Cerita Kasus & Fakta Petunjuk (Story Briefing)
                </h3>
                <p className="text-xs text-slate-500">
                  Kisah pemantik masalah dengan format ramah anak, simbol matematika Unicode interaktif, dan gambar ilustrasi kasus.
                </p>
              </div>
            </div>

            <div>
              <VisualMathEditor
                label="Naskah Cerita Pembuka Kasus"
                value={storyBriefing}
                onChange={setStoryBriefing}
                rows={3}
                placeholder="Ceritakan latar belakang misteri atau tantangan yang dihadapi siswa..."
              />
            </div>

            {/* Upload Gambar, Audio Narasi & Video Cerita Kasus */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <TeacherImageUpload
                  label="Unggah Gambar / Bagan Diagram Matematika (Opsional)"
                  imageUrl={storyBriefingImage}
                  onImageChange={setStoryBriefingImage}
                />
              </div>

              <div>
                <AudioRecorderPlayer
                  label="Rekaman Suara Guru (Narasi Kasus)"
                  sublabel="Rekam suara penjelasan langsung via mic atau unggah audio (.mp3)"
                  audioUrl={storyAudioUrl}
                  onAudioChange={setStoryAudioUrl}
                />
              </div>
            </div>

            {/* Video Pengantar Kasus */}
            <div className="p-3 bg-white rounded-2xl border border-amber-300 space-y-2">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-amber-950 font-black">
                  <Video className="w-4 h-4 text-amber-600" />
                  <span>Sematkan Video Pembelajaran / Pengantar Kasus (Opsional):</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">YouTube / Google Drive / MP4</span>
              </label>
              <input
                type="url"
                value={storyVideoUrl}
                onChange={(e) => setStoryVideoUrl(e.target.value)}
                placeholder="Contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs bg-amber-50/40 font-medium"
              />
              {storyVideoUrl.trim() && (
                <div className="pt-1">
                  <VideoEmbedPlayer videoUrl={storyVideoUrl} title="Pratinjau Video Cerita Kasus" />
                </div>
              )}
            </div>

            {/* 3 Clues Editor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {clues.map((clue, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                    Petunjuk {idx + 1}:
                  </span>
                  <input
                    type="text"
                    value={clue.title}
                    onChange={(e) => {
                      const newClues = [...clues] as typeof clues;
                      newClues[idx].title = e.target.value;
                      setClues(newClues);
                    }}
                    placeholder="Judul Petunjuk..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 text-xs font-bold bg-white"
                  />
                  <textarea
                    rows={3}
                    value={clue.content}
                    onChange={(e) => {
                      const newClues = [...clues] as typeof clues;
                      newClues[idx].content = e.target.value;
                      setClues(newClues);
                    }}
                    placeholder="Isi fakta atau rumus..."
                    className="w-full p-2 rounded-lg border border-emerald-300 text-xs bg-white"
                  />
                  <div className="text-[11px] text-emerald-950 bg-white p-1.5 rounded border border-emerald-200 line-clamp-2">
                    <MathText text={clue.content} inline />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Lembar Kerja & Tipe Soal untuk Masing-masing Agen */}
          <div className="bg-white/95 backdrop-blur-md border-3 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center font-black">
                  3
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Konfigurasi Tugas, Editor Canvas & Kunci Jawaban ({agentCount} Agen)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih antara Canvas Bebas (Word-Style) atau Kartu Soal Terstruktur dengan 6 tipe soal dan gambar visual!
                  </p>
                </div>
              </div>
            </div>

            {/* Agent Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {visibleRoles.map((role) => {
                const meta = ROLE_METADATA[role];
                const isActive = activeTabAgent === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setActiveTabAgent(role);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer border-2 ${
                      isActive
                        ? 'bg-amber-400 border-amber-600 text-amber-950 shadow-md scale-102'
                        : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <MascotCharacter role={role} size="sm" className="w-6 h-6" />
                    <span>
                      {(agentTasks[role]?.roleNickname || meta.nickname)}: {(agentTasks[role]?.roleName || meta.name)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Agent Task Config Form */}
            {(() => {
              const currentTask = agentTasks[activeTabAgent];
              const meta = ROLE_METADATA[activeTabAgent];

              return (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border-2 border-amber-200 space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <MascotCharacter role={activeTabAgent} size="md" className="w-16 h-16" />
                      <div>
                        <div className="text-xs font-black uppercase text-amber-800">
                          {currentTask.roleNickname || meta.nickname} · {meta.badge}
                        </div>
                        <h4 className="text-lg font-black text-slate-900">
                          {currentTask.roleName || meta.name} ({currentTask.title || meta.title})
                        </h4>
                      </div>
                    </div>

                    {/* Mode Switcher: Canvas / Word vs Structured Cards */}
                    <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border-2 border-amber-300 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          handleUpdateTaskField(activeTabAgent, 'worksheetMode', 'canvas');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                          currentTask.worksheetMode === 'canvas'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-amber-900 hover:bg-amber-100'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>📄 Mode Canvas Bebas (Word Style)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          handleUpdateTaskField(activeTabAgent, 'worksheetMode', 'cards');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                          currentTask.worksheetMode !== 'canvas'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-amber-900 hover:bg-amber-100'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>🗂️ Mode Kartu Soal Terstruktur</span>
                      </button>
                    </div>
                  </div>

                  {/* KUSTOMISASI NAMA & PERAN AGEN OLEH GURU */}
                  <div className="p-3.5 bg-white rounded-2xl border-2 border-amber-300 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                        <span>👤 Kustomisasi Nama & Peran Agen oleh Guru:</span>
                      </span>
                      <span className="text-[10px] text-amber-800 font-bold">
                        Sinkron otomatis ke Portal Siswa
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nama Peran Agen:
                        </label>
                        <input
                          type="text"
                          value={currentTask.roleName || ''}
                          onChange={(e) =>
                            handleUpdateTaskField(activeTabAgent, 'roleName', e.target.value)
                          }
                          placeholder="Contoh: Analis Data Matriks"
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-bold bg-amber-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Panggilan Singkat Agen:
                        </label>
                        <input
                          type="text"
                          value={currentTask.roleNickname || ''}
                          onChange={(e) =>
                            handleUpdateTaskField(activeTabAgent, 'roleNickname', e.target.value)
                          }
                          placeholder="Contoh: Agen 1 / Analis 1"
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-bold bg-amber-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Gelar Keahlian / Tagline:
                        </label>
                        <input
                          type="text"
                          value={currentTask.tagline || ''}
                          onChange={(e) =>
                            handleUpdateTaskField(activeTabAgent, 'tagline', e.target.value)
                          }
                          placeholder="Contoh: Ahli SPLDV & Invers"
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-amber-50/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role Title & Instructions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Judul Tugas Agen:
                      </label>
                      <input
                        type="text"
                        value={currentTask.title}
                        onChange={(e) =>
                          handleUpdateTaskField(activeTabAgent, 'title', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-bold bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Instruksi Singkat untuk Murid:
                      </label>
                      <input
                        type="text"
                        value={currentTask.instructions}
                        onChange={(e) =>
                          handleUpdateTaskField(activeTabAgent, 'instructions', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* RENDER WORKSHEET MODE CONTENT */}
                  {currentTask.worksheetMode === 'canvas' ? (
                    /* 1. CANVAS / RICH WORKSHEET BUILDER */
                    <div className="space-y-3 pt-1">
                      <TeacherCanvasEditor
                        content={currentTask.worksheetContent || ''}
                        onChange={(newContent) =>
                          handleUpdateTaskField(activeTabAgent, 'worksheetContent', newContent)
                        }
                        roleNickname={meta.nickname}
                        roleName={meta.name}
                      />
                    </div>
                  ) : (
                    /* 2. STRUCTURED QUESTION CARDS MODE */
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-black uppercase text-amber-900">
                          📋 DAFTAR SOAL & TIPE SOAL ({currentTask.questions.length} Soal):
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddQuestion(activeTabAgent)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>+ Tambah Nomor Soal Baru</span>
                        </button>
                      </div>

                      {currentTask.questions.map((q, qIndex) => (
                        <div
                          key={q.id}
                          className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-amber-200 shadow-sm space-y-3.5"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-black">
                              Nomor {qIndex + 1}
                            </span>

                            {/* Pilihan 6 Tipe Soal Lengkap */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-600">Tipe Soal:</span>
                              <select
                                value={q.type}
                                onChange={(e) =>
                                  handleUpdateQuestion(
                                    activeTabAgent,
                                    q.id,
                                    'type',
                                    e.target.value as QuestionType
                                  )
                                }
                                className="px-3 py-1.5 rounded-xl border-2 border-amber-300 bg-amber-50 text-xs font-bold text-amber-900 outline-hidden cursor-pointer"
                              >
                                <option value="short">✏️ Isian Singkat (Teks Pendek)</option>
                                <option value="essay">📝 Uraian / Analisis (Teks Panjang)</option>
                                <option value="multiple_choice">🔘 Pilihan Ganda (Opsi A, B, C, D)</option>
                                <option value="checkbox">☑️ Pilihan Banyak / Checkbox</option>
                                <option value="inline_blank">💬 Isian di Tengah Kalimat (Inline Blank)</option>
                                <option value="table">📊 Tabel Dinamis (Worksheet Table)</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(activeTabAgent, q.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                                title="Hapus Soal"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Media Soal: Gambar, Audio Suara Guru & Video */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5">
                            <div>
                              <TeacherImageUpload
                                label="Unggah Gambar / Bagan Soal Ini"
                                imageUrl={q.imageUrl}
                                imageCaption={q.imageCaption}
                                onImageChange={(url) =>
                                  handleUpdateQuestion(activeTabAgent, q.id, 'imageUrl', url)
                                }
                                onCaptionChange={(caption) =>
                                  handleUpdateQuestion(activeTabAgent, q.id, 'imageCaption', caption)
                                }
                                compact
                              />
                            </div>

                            <div>
                              <AudioRecorderPlayer
                                label="Rekam Suara Instruksi / Audio Soal"
                                sublabel="Rekam suara guru membaca soal atau unggah file audio"
                                audioUrl={q.audioUrl}
                                onAudioChange={(url) =>
                                  handleUpdateQuestion(activeTabAgent, q.id, 'audioUrl', url)
                                }
                              />
                            </div>
                          </div>

                          {/* Video Embed untuk Soal */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-amber-200 space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-amber-900 font-bold">
                                <Video className="w-3.5 h-3.5 text-amber-600" />
                                <span>URL Video Pembelajaran / Simulasi Soal (Opsional):</span>
                              </span>
                              <span className="text-[10px] text-slate-500">YouTube / Drive / MP4</span>
                            </label>
                            <input
                              type="url"
                              value={q.videoUrl || ''}
                              onChange={(e) =>
                                handleUpdateQuestion(activeTabAgent, q.id, 'videoUrl', e.target.value)
                              }
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs bg-white font-medium"
                            />
                            {q.videoUrl?.trim() && (
                              <div className="pt-1">
                                <VideoEmbedPlayer
                                  videoUrl={q.videoUrl}
                                  title={`Video Pembelajaran Soal Nomor ${qIndex + 1}`}
                                />
                              </div>
                            )}
                          </div>

                          {/* Prompt Input & Visual Math Editor */}
                          <div>
                            <VisualMathEditor
                              label={
                                q.type === 'inline_blank'
                                  ? 'Teks Kalimat Soal (Gunakan tanda [...] untuk kotak isian)'
                                  : 'Pertanyaan / Teks Soal'
                              }
                              value={q.prompt}
                              onChange={(newPrompt) =>
                                handleUpdateQuestion(activeTabAgent, q.id, 'prompt', newPrompt)
                              }
                              rows={2}
                              allowShortcodes={q.type === 'inline_blank'}
                              shortcodeButtonLabel="+ Sisipkan [isian]"
                              onInsertShortcode={() =>
                                handleUpdateQuestion(
                                  activeTabAgent,
                                  q.id,
                                  'prompt',
                                  q.prompt.trim() ? `${q.prompt.trim()} [jawaban] ` : '[jawaban] '
                                )
                              }
                              placeholder={
                                q.type === 'inline_blank'
                                  ? "Contoh: Nilai pH danau adalah [masukkan pH] dan tergolong [asam/basa]."
                                  : "Tuliskan pertanyaan di sini..."
                              }
                            />
                          </div>

                          {/* KHUSUS TIPE SOAL: ISIAN DI TENGAH KALIMAT (INLINE BLANK) */}
                          {q.type === 'inline_blank' && (
                            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
                              <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                                <span>💬</span>
                                <span>Petunjuk Soal Isian di Tengah Kalimat:</span>
                              </div>
                              <p className="text-[11px] text-slate-600">
                                Setiap kata di dalam tanda kurung <code>[isinya]</code> akan otomatis dirender sebagai kotak isian di layar siswa.
                              </p>
                              <div className="space-y-1 pt-1">
                                <label className="block text-xs font-bold text-amber-950">
                                  🔑 Kunci Jawaban Benar (Kata Kunci untuk Auto-Score):
                                </label>
                                <input
                                  type="text"
                                  value={(q.correctAnswer as string) || ''}
                                  onChange={(e) =>
                                    handleUpdateQuestion(activeTabAgent, q.id, 'correctAnswer', e.target.value)
                                  }
                                  placeholder="Contoh: 5.2 asam (sistem akan mencocokkan kata kunci ini)"
                                  className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs bg-white font-bold text-amber-950"
                                />
                              </div>
                            </div>
                          )}

                          {/* KHUSUS TIPE SOAL: TABEL DINAMIS (WORKSHEET TABLE) */}
                          {q.type === 'table' && (
                            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-300 space-y-3">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                                  <TableIcon className="w-4 h-4 text-emerald-600" />
                                  <span>Konfigurasi Format Tabel Lembar Kerja:</span>
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-700">Jumlah Baris Isian:</span>
                                  <select
                                    value={q.tableRowCount || 3}
                                    onChange={(e) =>
                                      handleUpdateQuestion(activeTabAgent, q.id, 'tableRowCount', Number(e.target.value))
                                    }
                                    className="px-2 py-1 text-xs font-bold rounded-lg border border-emerald-300 bg-white"
                                  >
                                    <option value={2}>2 Baris</option>
                                    <option value={3}>3 Baris</option>
                                    <option value={4}>4 Baris</option>
                                    <option value={5}>5 Baris</option>
                                    <option value={6}>6 Baris</option>
                                  </select>
                                </div>
                              </div>

                              {/* Table Headers List */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-700">Judul Header Kolom Tabel:</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = q.tableHeaders || ['No', 'Kolom 1'];
                                      handleUpdateQuestion(activeTabAgent, q.id, 'tableHeaders', [...current, `Kolom ${current.length + 1}`]);
                                    }}
                                    className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                                  >
                                    + Tambah Kolom
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                  {(q.tableHeaders || ['No', 'Kolom 1', 'Kolom 2']).map((header, hIdx) => (
                                    <div key={hIdx} className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-emerald-200">
                                      <span className="text-[11px] font-mono text-slate-400 w-5 text-center">{hIdx + 1}.</span>
                                      <input
                                        type="text"
                                        value={header}
                                        onChange={(e) => {
                                          const next = [...(q.tableHeaders || [])];
                                          next[hIdx] = e.target.value;
                                          handleUpdateQuestion(activeTabAgent, q.id, 'tableHeaders', next);
                                        }}
                                        placeholder={`Header ${hIdx + 1}`}
                                        className="flex-1 text-xs font-bold text-slate-800 outline-hidden"
                                      />
                                      {(q.tableHeaders || []).length > 2 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const next = (q.tableHeaders || []).filter((_, i) => i !== hIdx);
                                            handleUpdateQuestion(activeTabAgent, q.id, 'tableHeaders', next);
                                          }}
                                          className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer"
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Options Editor & Answer Key Selector for multiple_choice & checkbox */}
                          {(q.type === 'multiple_choice' || q.type === 'checkbox') && (
                            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-300 space-y-3">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                                  <Award className="w-3.5 h-3.5 text-amber-600" />
                                  <span>
                                    {q.type === 'multiple_choice'
                                      ? '🔘 Opsi & Kunci Jawaban Benar (Pilih 1):'
                                      : '☑️ Opsi & Kunci Jawaban Benar (Bisa Centang > 1):'}
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAddOption(activeTabAgent, q.id)}
                                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                                >
                                  + Tambah Pilihan
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {(q.options || []).map((opt, optIdx) => {
                                  const isCorrect = q.type === 'multiple_choice'
                                    ? q.correctAnswer === opt
                                    : Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt);

                                  return (
                                    <div 
                                      key={optIdx} 
                                      className={`flex items-center gap-2 p-2 rounded-xl border-2 transition ${
                                        isCorrect 
                                          ? 'bg-emerald-50 border-emerald-400' 
                                          : 'bg-white border-amber-200'
                                      }`}
                                    >
                                      {/* Correct Answer Checkbox / Radio Toggle Button */}
                                      <button
                                        type="button"
                                        onClick={() => handleToggleCorrectAnswer(activeTabAgent, q.id, opt, q.type)}
                                        className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 cursor-pointer transition ${
                                          isCorrect
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-slate-100 hover:bg-emerald-100 text-slate-600'
                                        }`}
                                        title={isCorrect ? 'Kunci Jawaban Benar (Klik untuk batal)' : 'Klik untuk jadikan Kunci Jawaban Benar'}
                                      >
                                        {isCorrect ? '✓' : String.fromCharCode(65 + optIdx)}
                                      </button>

                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) =>
                                          handleUpdateOption(
                                            activeTabAgent,
                                            q.id,
                                            optIdx,
                                            e.target.value
                                          )
                                        }
                                        className="grow px-2 py-1.5 rounded-lg border border-amber-200 text-xs bg-white font-medium outline-hidden"
                                      />

                                      {isCorrect && (
                                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                                          KUNCI
                                        </span>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOption(activeTabAgent, q.id, optIdx)}
                                        className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer shrink-0"
                                        title="Hapus Opsi"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {/* Summary of Correct Answer */}
                              <div className="text-[11px] font-bold text-emerald-900 bg-emerald-100/70 p-2 rounded-lg flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>
                                  <strong>Kunci Jawaban Tersimpan: </strong>
                                  {q.type === 'multiple_choice'
                                    ? (q.correctAnswer ? `[${q.correctAnswer}]` : 'Belum ditentukan (klik tombol huruf di atas)')
                                    : (Array.isArray(q.correctAnswer) && q.correctAnswer.length > 0 
                                        ? `[${q.correctAnswer.join(', ')}]` 
                                        : 'Belum ditentukan (klik opsi yang benar)')}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Optional Answer Key for Short Answers */}
                          {q.type === 'short' && (
                            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1">
                              <label className="block text-xs font-bold text-emerald-900">
                                🔑 Kata Kunci / Jawaban Benar Isian Singkat (Opsional untuk Auto-Score):
                              </label>
                              <input
                                type="text"
                                value={(q.correctAnswer as string) || ''}
                                onChange={(e) => handleUpdateQuestion(activeTabAgent, q.id, 'correctAnswer', e.target.value)}
                                placeholder="Contoh: Organo-Fosfat atau 45 (sistem akan mencocokkan kata kunci ini)"
                                className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 text-xs bg-white font-bold text-emerald-950"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Card 4: Webhook Google Sheets & Tombol Simpan */}
          <div className="bg-white/95 backdrop-blur-md border-3 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Webhook URL Google Sheets (Opsional):
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 focus:border-amber-400 text-xs sm:text-sm bg-white font-mono outline-hidden"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Hasil laporan kelompok dan nilai siswa akan otomatis diteruskan ke spreadsheet Google ini saat selesai.
              </p>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-amber-100">
              <div className="text-xs text-slate-500">
                LKM yang disimpan akan mendapatkan Kode PIN unik untuk dibagikan ke siswa.
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-black text-sm border-2 border-amber-500 shadow-md cursor-pointer transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan LKM...' : 'Simpan & Terbitkan LKM Sekarang ✨'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Existing / Saved Templates List */}
        <div className="bg-white/95 backdrop-blur-md border-3 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Daftar Template LKM Tersimpan ({configs.length} Template)</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              Klik &quot;Gunakan di Kelas&quot; untuk langsung menguji di Portal Siswa
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {configs.map((cfg) => (
              <div
                key={cfg.pin}
                className="p-4 rounded-2xl bg-amber-50/50 border-2 border-amber-200 hover:border-amber-400 transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-200 text-amber-950 font-mono font-black text-xs">
                      PIN: {cfg.pin}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      ⏱️ {cfg.timerMinutes}m · 👥 {cfg.agentCount || 3} Agen
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 leading-snug">
                    {cfg.title}
                  </h4>
                  <div className="text-xs text-slate-600 font-medium">
                    {cfg.subject} · {cfg.grade}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-amber-200/60">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectPreset(cfg)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 cursor-pointer transition text-center"
                    >
                      Muat ke Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectLkmForStudent(cfg)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs cursor-pointer transition text-center shadow-2xs"
                    >
                      Buka di Siswa 🚀
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyDirectLinkToClipboard(cfg.pin)}
                    className="w-full py-1 px-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-bold border border-sky-200 cursor-pointer transition flex items-center justify-center gap-1"
                  >
                    <Link className="w-3 h-3 text-sky-600" />
                    <span>Salin URL Direct Link (?pin={cfg.pin})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
