import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  ArrowRight, 
  Key, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Smile, 
  Compass, 
  Settings, 
  Search, 
  HelpCircle,
  Link,
  Check
} from 'lucide-react';
import { AgentRole, LkmConfig, ROLE_METADATA, RoomData } from '../types';
import { sounds } from '../services/soundEffects';
import { MascotCharacter, DanauCerminCartoonBackground } from './MascotIcons';

interface LandingSetupProps {
  room: RoomData;
  activeLkm: LkmConfig;
  availableLkms: LkmConfig[];
  onSelectLkmPin: (pin: string) => Promise<boolean>;
  onStartMission: (teamName: string, roomId: string, role: AgentRole, memberName: string, selectedLkm: LkmConfig) => void;
  onOpenTeacherGenerator: () => void;
  onOpenTeacherGuide: () => void;
}

export const LandingSetup: React.FC<LandingSetupProps> = ({
  room,
  activeLkm,
  availableLkms,
  onSelectLkmPin,
  onStartMission,
  onOpenTeacherGenerator,
  onOpenTeacherGuide,
}) => {
  const [pinInput, setPinInput] = useState(activeLkm.pin || 'BIO-2088');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinVerified, setPinVerified] = useState(true);
  const [urlPinLoaded, setUrlPinLoaded] = useState(false);

  const [teamName, setTeamName] = useState(room.teamName || 'Tim Petualang Danau 01');
  const [roomId, setRoomId] = useState(room.roomId || 'RUANG-01');
  const [selectedRole, setSelectedRole] = useState<AgentRole>('agent1');
  const [memberName, setMemberName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle URL Direct Link: ?pin=KODE
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const pinParam = searchParams.get('pin');
      if (pinParam && !urlPinLoaded) {
        const cleanedPin = pinParam.trim().toUpperCase();
        setPinInput(cleanedPin);
        setUrlPinLoaded(true);
        // Automatically verify and load this LKM
        handleVerifyPin(cleanedPin);
      }
    } catch {}
  }, [urlPinLoaded]);

  // Keep pinInput in sync when activeLkm changes from outside
  useEffect(() => {
    if (activeLkm.pin && !urlPinLoaded) {
      setPinInput(activeLkm.pin);
      setPinVerified(true);
    }
  }, [activeLkm.pin]);

  // Handle PIN verification
  const handleVerifyPin = async (pinToTest?: string) => {
    const pin = (pinToTest || pinInput).trim().toUpperCase();
    if (!pin) {
      setPinError('Masukkan Kode LKM / PIN dari Guru.');
      return;
    }
    sounds.playClick();
    setPinLoading(true);
    setPinError('');
    try {
      const success = await onSelectLkmPin(pin);
      if (success) {
        sounds.playSuccess();
        setPinVerified(true);
        setPinInput(pin);
      } else {
        setPinError(`Kode PIN "${pin}" tidak ditemukan. Silakan cek kembali atau pilih dari daftar.`);
        setPinVerified(false);
      }
    } catch {
      setPinError('Gagal memverifikasi PIN. Silakan coba lagi.');
    } finally {
      setPinLoading(false);
    }
  };

  const generateRoomCode = () => {
    sounds.playClick();
    const codes = ['RUANG-CERMIN', 'SQUAD-DANAU', 'TIM-BINTANG', 'POS-ALPHA', 'KELOMPOK-HEBAT'];
    const randomCode = `${codes[Math.floor(Math.random() * codes.length)]}-${Math.floor(10 + Math.random() * 90)}`;
    setRoomId(randomCode);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setErrorMsg('Nama Tim/Kelompok harus diisi!');
      return;
    }
    if (!roomId.trim()) {
      setErrorMsg('Kode Kelompok / Ruang harus diisi!');
      return;
    }
    if (!memberName.trim()) {
      setErrorMsg('Nama Siswa untuk peran ini harus diisi!');
      return;
    }

    sounds.playSuccess();
    onStartMission(teamName.trim(), roomId.trim().toUpperCase(), selectedRole, memberName.trim(), activeLkm);
  };

  const agentCount = activeLkm.agentCount || 3;
  const visibleRoles: AgentRole[] = (
    agentCount === 3
      ? ['agent1', 'agent2', 'agent3']
      : agentCount === 4
      ? ['agent1', 'agent2', 'agent3', 'agent4']
      : ['agent1', 'agent2', 'agent3', 'agent4', 'agent5']
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-teal-50 to-emerald-50 text-slate-800 flex flex-col justify-between relative overflow-hidden">
      {/* Cartoon Danau Cermin Peaceful Background */}
      <DanauCerminCartoonBackground />

      {/* Top Banner & Module Switcher */}
      <header className="relative z-10 border-b-2 border-sky-200/80 bg-white/85 backdrop-blur-md px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-300 border-2 border-amber-400 flex items-center justify-center text-xl shadow-md">
            🌈
          </div>
          <div>
            <div className="text-xs font-black tracking-wider text-sky-800 uppercase flex items-center gap-1.5">
              <span>APLIKASI PETUALANGAN BELAJAR</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{activeLkm.grade || 'SMA KELAS 10'}</span>
            </div>
            <div className="text-sm font-black text-slate-900 line-clamp-1">
              {activeLkm.title || 'Misi Petualangan Sains Interaktif'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenTeacherGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-900 text-xs font-bold transition cursor-pointer"
          >
            <span>📊 Panduan & Nilai</span>
          </button>

          <button
            type="button"
            onClick={onOpenTeacherGenerator}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 border-2 border-amber-500 text-amber-950 text-xs font-black shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Portal Guru (Buat LKM)</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-6 sm:py-8 grow flex flex-col justify-center w-full">
        <div className="bg-white/95 backdrop-blur-md border-3 border-sky-300 rounded-3xl shadow-2xl p-5 sm:p-8 space-y-6">
          {/* Welcome Heading */}
          <div className="text-center space-y-2 border-b-2 border-sky-100 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black">
              <span>☀️</span>
              <span>SELAMAT DATANG PETUALANG MUDA!</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Aplikasi Petualangan Belajar Kolaboratif
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Bekerja samalah dalam kelompok kecil secara <strong>real-time</strong> untuk menyelidiki fakta, mencoba eksperimen di simulator, dan memecahkan tantangan seru bersama!
            </p>
          </div>

          <form onSubmit={handleStart} className="space-y-6">
            {/* STEP 1: Masukkan PIN LKM dari Guru */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-teal-50 border-2 border-sky-200 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-black text-sky-950 uppercase flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-sky-600" />
                  <span>LANGKAH 1: KODE LKM / PIN DARI GURU</span>
                </span>
                {urlPinLoaded && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Otomatis terisi dari Direct Link!</span>
                  </span>
                )}
                <span className="text-xs text-sky-700 font-semibold">
                  Tersedia {availableLkms.length} Misi Siap Pakai
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="relative grow">
                  <input
                    type="text"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value.toUpperCase());
                      setPinVerified(false);
                      setPinError('');
                    }}
                    placeholder="Contoh: BIO-2088 atau FIS-7701"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-sky-300 focus:border-sky-500 font-mono font-black uppercase text-sm sm:text-base bg-white outline-hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleVerifyPin()}
                  disabled={pinLoading}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {pinLoading ? 'Memeriksa...' : 'Cek Kode PIN'}
                </button>
              </div>

              {pinError && (
                <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  ⚠️ {pinError}
                </div>
              )}

              {/* Active LKM Badge */}
              <div className="p-3 rounded-xl bg-white border border-sky-200 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  {activeLkm.storyBriefingImage && (
                    <img
                      src={activeLkm.storyBriefingImage}
                      alt="Thumbnail Misi"
                      className="w-10 h-10 rounded-lg object-cover border border-amber-300 shrink-0"
                    />
                  )}
                  <div>
                    <div className="font-black text-sky-900">{activeLkm.title}</div>
                    <div className="text-[11px] text-slate-500">
                      {activeLkm.subject} · {activeLkm.grade}
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                        👥 {agentCount} Orang Agen
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Durasi: {activeLkm.timerMinutes || 25} Menit</span>
                </div>
              </div>
            </div>

            {/* STEP 2: Identitas Kelompok & Ruang Kolaborasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 border-2 border-amber-200 space-y-2">
                <label className="block text-xs font-black text-amber-950 uppercase">
                  LANGKAH 2A: NAMA TIM / KELOMPOK
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Contoh: Tim Matematika 01 / Regu Pythagoras"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-400 font-bold text-sm bg-white outline-hidden"
                  required
                />
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border-2 border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-emerald-950 uppercase">
                    LANGKAH 2B: KODE RUANG BERSAMA
                  </label>
                  <button
                    type="button"
                    onClick={generateRoomCode}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    🎲 Acak Kode
                  </button>
                </div>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="Contoh: RUANG-01"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-400 font-mono font-bold text-sm uppercase bg-white outline-hidden"
                  required
                />
                <p className="text-[10px] text-slate-500">
                  *Siswa dalam satu kelompok harus memasukkan Kode Ruang yang sama agar sinkron real-time.
                </p>
              </div>
            </div>

            {/* STEP 3: Pilih Peran Agen & Isi Nama Siswa */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>LANGKAH 3: PILIH PERANMU DI TIM INI ({agentCount} PILIHAN AGEN)</span>
                </label>
                <span className="text-xs text-slate-500">
                  1 Siswa memilih 1 Peran Agen
                </span>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-3 ${agentCount >= 4 ? 'lg:grid-cols-' + agentCount : ''} gap-3`}>
                {visibleRoles.map((role) => {
                  const meta = ROLE_METADATA[role];
                  const isSelected = selectedRole === role;
                  const task = activeLkm.agentTasks?.[role];

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setSelectedRole(role);
                      }}
                      className={`text-left p-4 rounded-2xl border-3 transition cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                        isSelected
                          ? 'bg-amber-100 border-amber-500 shadow-lg scale-102 ring-2 ring-amber-400'
                          : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                      }`}
                    >
                      {/* Character Illustration Mascot */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-950 font-black text-xs">
                          {task?.roleNickname || meta.nickname}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Dipilih!</span>
                          </span>
                        )}
                      </div>

                      <div className="my-3 flex flex-col items-center text-center">
                        <MascotCharacter role={role} size="md" className="w-20 h-20" />
                        <h3 className="font-black text-sm sm:text-base text-slate-900 mt-2">
                          {task?.roleName || meta.name}
                        </h3>
                        <p className="text-[11px] text-amber-900 font-bold">
                          {task?.title || meta.title}
                        </p>
                      </div>

                      <p className="text-xs text-slate-500 border-t border-amber-100 pt-2 line-clamp-2">
                        {task?.instructions || 'Membantu penyelidikan dan pengolahan data kelompok.'}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Input Nama Siswa */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-200 space-y-2">
                <label className="block text-xs font-black text-amber-950 uppercase">
                  NAMA LENGKAP SISWA (UNTUK {ROLE_METADATA[selectedRole].nickname.toUpperCase()}):
                </label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Contoh: Rian Pratama / Siti Aisyah"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-500 font-bold text-sm bg-white outline-hidden"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* ACTION BUTTON: [AYO JALANKAN MISI] */}
            <div className="pt-2 text-center">
              <button
                type="submit"
                className="w-full sm:w-auto px-10 py-4 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 border-3 border-amber-600 text-amber-950 font-black text-base sm:text-lg shadow-xl hover:shadow-2xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-3 mx-auto"
              >
                <span>☀️</span>
                <span>[AYO JALANKAN MISI]</span>
                <ArrowRight className="w-5 h-5 text-amber-950" />
              </button>
              <p className="text-xs text-slate-500 mt-2">
                *Klik tombol di atas untuk langsung membuka Lembar Kerja Petualangan Belajar!
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-slate-500 border-t border-sky-200 bg-white/70">
        <span>Aplikasi Petualangan Belajar Digital · Kolaborasi Kelompok Real-Time Ramah Pelajar</span>
      </footer>
    </div>
  );
};
