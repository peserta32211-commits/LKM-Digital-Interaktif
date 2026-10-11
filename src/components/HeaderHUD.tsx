import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Send, 
  Clock, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  Smile, 
  Sun,
  Users,
  Settings,
  HelpCircle,
  FileCheck2,
  Lock
} from 'lucide-react';
import { AgentRole, ROLE_METADATA, RoomData } from '../types';
import { sounds } from '../services/soundEffects';
import { MascotCharacter } from './MascotIcons';

interface HeaderHUDProps {
  room: RoomData;
  currentRole: AgentRole;
  onSelectRole: (role: AgentRole) => void;
  onSubmitMission: () => void;
  onOpenTeacherGuide: () => void;
  onOpenTeacherGenerator?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  room,
  currentRole,
  onSelectRole,
  onSubmitMission,
  onOpenTeacherGuide,
  onOpenTeacherGenerator,
  soundEnabled,
  onToggleSound,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const seconds = room.timerRemainingSeconds;
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;

  const isCritical = seconds <= 300 && room.timerRunning; // < 5 mins
  const isDanger = seconds <= 60 && room.timerRunning; // < 1 min
  const isSubmitted = room.status === 'submitted';

  const agentCount = room.agentCount || 3;
  const visibleRoles: AgentRole[] = (
    agentCount === 3
      ? ['agent1', 'agent2', 'agent3']
      : agentCount === 4
      ? ['agent1', 'agent2', 'agent3', 'agent4']
      : ['agent1', 'agent2', 'agent3', 'agent4', 'agent5']
  );

  // Calculate detailed question completion for the current active role & all agents
  const currentTask = room.lkmConfig?.agentTasks?.[currentRole];
  const currentAnswers = (room[`${currentRole}Data` as keyof RoomData] as any)?.answers || {};
  let currentTotalQuestions = currentTask?.questions?.length || 0;
  
  let currentFilledQuestions = 0;
  if (currentTask?.questions) {
    currentTask.questions.forEach((q) => {
      const val = currentAnswers[q.id];
      let hasAns = val !== undefined && val !== null && (Array.isArray(val) ? val.length > 0 : String(val).trim() !== '');
      if (!hasAns) {
        hasAns = Object.keys(currentAnswers).some(k => k.startsWith(`${q.id}_`) && Boolean(currentAnswers[k]));
      }
      if (hasAns) {
        currentFilledQuestions++;
      }
    });
  }

  // If in canvas mode, count canvas entries
  if (currentTask?.worksheetMode === 'canvas') {
    const canvasKeys = Object.keys(currentAnswers).filter(k => k.startsWith(`${currentRole}_inline_`) || k.startsWith(`${currentRole}_table_`));
    if (canvasKeys.length > 0) {
      currentTotalQuestions = Math.max(currentTotalQuestions, canvasKeys.length);
      currentFilledQuestions = canvasKeys.filter(k => Boolean(currentAnswers[k])).length;
    }
  }

  // Calculate team total questions & team filled questions
  let teamTotalQuestions = 0;
  let teamFilledQuestions = 0;
  let completedRolesCount = 0;

  visibleRoles.forEach((role) => {
    const task = room.lkmConfig?.agentTasks?.[role];
    const roleAnswers = (room[`${role}Data` as keyof RoomData] as any)?.answers || {};
    const isCompleted = (room[`${role}Data` as keyof RoomData] as any)?.completed;
    if (isCompleted) completedRolesCount++;

    if (task?.questions) {
      task.questions.forEach((q) => {
        teamTotalQuestions++;
        const val = roleAnswers[q.id];
        let hasAns = val !== undefined && val !== null && (Array.isArray(val) ? val.length > 0 : String(val).trim() !== '');
        if (!hasAns) {
          hasAns = Object.keys(roleAnswers).some(k => k.startsWith(`${q.id}_`) && Boolean(roleAnswers[k]));
        }
        if (hasAns) {
          teamFilledQuestions++;
        }
      });
    }
  });

  const completionPercentage = teamTotalQuestions > 0 
    ? Math.round((teamFilledQuestions / teamTotalQuestions) * 100) 
    : 0;

  const toggleFullscreen = () => {
    sounds.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-3 border-amber-300 shadow-md">
      {/* Top Status Bar: Cheerful & Sun Filled */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Mission Identity & Room Code */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400 border border-amber-500 flex items-center justify-center text-lg shadow-xs">
            ☀️
          </div>
          <div>
            <div className="text-[10px] font-black tracking-wider text-amber-800 uppercase flex items-center gap-1">
              <span>{room.subject || 'MATEMATIKA'}</span>
              <span>·</span>
              <span>PIN: {room.lkmPin || 'MAT-2088'}</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-900 truncate max-w-[190px] sm:max-w-[320px]">
              {room.lkmConfig?.title || 'Eksplorasi Matriks & SPLDV'}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-bold text-xs">
            <span className="text-amber-700">Ruang:</span>
            <span className="font-mono font-black">{room.roomId}</span>
          </div>
        </div>

        {/* Center: Interactive Countdown Timer */}
        <div className="flex items-center gap-2">
          {isSubmitted ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 border-2 border-slate-300 text-slate-700 font-bold text-xs">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>MISI SELESAI / TERKUNCI</span>
            </div>
          ) : (
            <div
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-2xl border-2 font-mono font-black text-sm sm:text-base shadow-sm transition ${
                isCritical
                  ? 'bg-rose-100 border-rose-500 text-rose-700 animate-pulse'
                  : 'bg-amber-100 border-amber-400 text-amber-950'
              }`}
            >
              <Clock className={`w-4 h-4 ${isCritical ? 'text-rose-600 animate-spin' : 'text-amber-700'}`} />
              <span>{timeFormatted}</span>
              {isCritical && (
                <span className="text-[10px] font-bold text-rose-600 uppercase hidden sm:inline">
                  ⚠️ &lt; 5 Menit!
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Progress Bar & Status */}
        <div className="flex items-center gap-2">
          {/* SEMUA SINKRON! with smiling sun */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-[11px] shadow-2xs">
            <span className="text-sm">☀️</span>
            <span>SEMUA SINKRON!</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition cursor-pointer"
            title={soundEnabled ? 'Matikan Suara Efek' : 'Nyalakan Suara Efek'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden sm:flex p-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition cursor-pointer"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* SUBMIT BUTTON */}
          <button
            type="button"
            onClick={onSubmitMission}
            disabled={isSubmitted}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl font-black text-xs shadow-md transition active:scale-95 cursor-pointer ${
              isSubmitted 
                ? 'bg-slate-300 text-slate-600 border border-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitted ? 'Terkirim ✓' : 'Kirim Misi'}</span>
          </button>
        </div>
      </div>

      {/* Role Navigation Bar & Student Question Progress Indicator */}
      <div className="border-t border-amber-100 bg-amber-50/80 px-3 sm:px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto">
          {/* Agent Role Badges */}
          <div className="flex items-center gap-2">
            {visibleRoles.map((role) => {
              const meta = ROLE_METADATA[role];
              const customTask = room.lkmConfig?.agentTasks?.[role];
              const displayNickname = customTask?.roleNickname || meta.nickname;
              const displayName = customTask?.roleName || meta.name;
              const isSelected = currentRole === role;
              const member = room.members[role];
              const isCompleted = (room[`${role}Data` as keyof RoomData] as any)?.completed;

              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => onSelectRole(role)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 transition text-xs font-bold cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-amber-400 border-amber-600 text-amber-950 shadow-sm scale-102'
                      : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  <MascotCharacter role={role} size="sm" className="w-6 h-6" />
                  <div className="text-left leading-tight">
                    <div className="flex items-center gap-1">
                      <span>{displayNickname}: {displayName}</span>
                      {isCompleted && <span className="text-[10px] text-emerald-600 font-black">✓</span>}
                    </div>
                    <div className="text-[10px] opacity-75 font-normal truncate max-w-[100px]">
                      {member?.name || '(Kosong)'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* PROGRESS BAR SISWA: Menampilkan kelengkapan pengisian soal & Tab switch badge */}
          <div className="flex items-center gap-2.5 pl-3 shrink-0">
            {/* Anti-Cheat Tab Switch Warning Badge */}
            {Boolean(room.tabSwitchCount && room.tabSwitchCount > 0) && (
              <div 
                className="flex items-center gap-1 px-2.5 py-1 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs font-black shadow-2xs animate-pulse"
                title="Jumlah frekuensi terdeteksi meninggalkan halaman pengerjaan LKM"
              >
                <span>⚠️</span>
                <span>{room.tabSwitchCount}x Pindah Tab</span>
              </div>
            )}

            {/* Active Agent Question Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-amber-300 rounded-xl text-amber-950 font-bold text-xs shadow-2xs">
              <FileCheck2 className="w-3.5 h-3.5 text-amber-600" />
              <span>{room.lkmConfig?.agentTasks?.[currentRole]?.roleNickname || ROLE_METADATA[currentRole].nickname}:</span>
              <span className="font-black text-amber-900">
                {currentFilledQuestions} dari {currentTotalQuestions} Soal Terisi
              </span>
            </div>

            {/* Total Team Progress Bar */}
            <div className="hidden sm:flex items-center gap-2 bg-white/80 border border-amber-200 px-2.5 py-1 rounded-xl">
              <span className="text-[11px] font-bold text-amber-900">
                Total Tim: {teamFilledQuestions}/{teamTotalQuestions} ({completionPercentage}%)
              </span>
              <div className="w-20 h-2 bg-slate-100 border border-amber-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
