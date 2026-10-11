import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  Upload, 
  Volume2, 
  VolumeX, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface AudioRecorderPlayerProps {
  audioUrl?: string;
  onAudioChange?: (base64AudioUrl: string | undefined) => void;
  label?: string;
  sublabel?: string;
  mode?: 'teacher_uploader' | 'player_only' | 'student_voice_note';
  disabled?: boolean;
  className?: string;
}

export const AudioRecorderPlayer: React.FC<AudioRecorderPlayerProps> = ({
  audioUrl,
  onAudioChange,
  label = 'Rekaman Suara / Audio Instruksi',
  sublabel = 'Rekam suara penjelasan langsung atau unggah file audio (.mp3, .wav, .m4a)',
  mode = 'teacher_uploader',
  disabled = false,
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recordError, setRecordError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  // Sync audio source
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [audioUrl]);

  // Start recording
  const startRecording = async () => {
    if (disabled) return;
    setRecordError(null);
    sounds.playClick();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          if (onAudioChange) onAudioChange(base64data);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error accessing microphone', err);
      setRecordError('Gagal mengakses mikrofon. Pastikan izin mikrofon telah diberikan di browser.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    sounds.playClick();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // Handle uploaded audio file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Mohon pilih file bertipe audio (.mp3, .wav, .m4a, dll.)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('Ukuran file audio maksimal 15MB.');
      return;
    }

    sounds.playClick();
    const reader = new FileReader();
    reader.onload = () => {
      if (onAudioChange && reader.result) {
        onAudioChange(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!audioElementRef.current) return;
    sounds.playClick();

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioElementRef.current) {
      setCurrentTime(audioElementRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioElementRef.current) {
      setDuration(audioElementRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
    }
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ==========================================
  // RENDER: 1. STUDENT PLAYER ONLY
  // ==========================================
  if (mode === 'player_only') {
    if (!audioUrl) return null;

    return (
      <div className={`p-2.5 rounded-2xl bg-amber-50/90 border border-amber-300 shadow-2xs flex items-center gap-3 ${className}`}>
        <audio
          ref={audioElementRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        <button
          type="button"
          onClick={togglePlay}
          className="w-9 h-9 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 font-bold shadow-xs transition active:scale-95 cursor-pointer"
          title={isPlaying ? 'Jeda Audio' : 'Putar Audio Narasi'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
            <span className="flex items-center gap-1.5 truncate">
              <Volume2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>🔊 Dengarkan Audio Suara Guru</span>
            </span>
            <span className="font-mono text-[10px] text-amber-800 shrink-0 ml-2">
              {formatSec(currentTime)} / {formatSec(duration || 0)}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: 2. STUDENT VOICE NOTE RESPONSE
  // ==========================================
  if (mode === 'student_voice_note') {
    return (
      <div className={`p-2.5 rounded-2xl bg-slate-50 border border-slate-300 shadow-2xs space-y-2 ${className}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-rose-600" />
            <span>{label || 'Penjelasan Lisan (Voice Note Siswa):'}</span>
          </span>

          {audioUrl && !isRecording && (
            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Rekaman Tersimpan</span>
            </span>
          )}
        </div>

        {recordError && (
          <div className="text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-xl border border-rose-200">
            {recordError}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {!isRecording ? (
            <button
              type="button"
              disabled={disabled}
              onClick={startRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{audioUrl ? 'Rekam Ulang Suara' : 'Mulai Rekam Suara'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black text-xs shadow-md transition active:scale-95 animate-pulse cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Berhenti Merekam ({formatSec(recordingSeconds)})</span>
            </button>
          )}

          {audioUrl && !isRecording && (
            <>
              <audio
                ref={audioElementRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
              />
              <button
                type="button"
                onClick={togglePlay}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs transition cursor-pointer shadow-xs"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                <span>{isPlaying ? 'Jeda' : 'Dengarkan'}</span>
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  sounds.playClick();
                  if (onAudioChange) onAudioChange(undefined);
                }}
                className="p-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 transition cursor-pointer"
                title="Hapus Rekaman Suara"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: 3. TEACHER UPLOADER & RECORDER
  // ==========================================
  return (
    <div className={`p-3 rounded-2xl bg-amber-50/70 border-2 border-amber-200 shadow-2xs space-y-2.5 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-amber-700" />
            <span>{label}</span>
          </span>
          <p className="text-[11px] text-amber-800 font-medium">
            {sublabel}
          </p>
        </div>

        {audioUrl && !isRecording && (
          <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audio Siap</span>
          </span>
        )}
      </div>

      {recordError && (
        <div className="text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-xl border border-rose-200">
          {recordError}
        </div>
      )}

      {/* Recording in progress banner */}
      {isRecording && (
        <div className="p-3 bg-rose-50 rounded-xl border-2 border-rose-300 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
            <span className="text-xs font-black text-rose-900">
              Sedang merekam suara guru... ({formatSec(recordingSeconds)})
            </span>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Selesai & Simpan</span>
          </button>
        </div>
      )}

      {/* Action buttons when not recording */}
      {!isRecording && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-rose-600" />
            <span>{audioUrl ? 'Rekam Ulang Mikrofon' : 'Rekam Suara (Mikrofon)'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-amber-700" />
            <span>Unggah File Audio (.mp3/.wav)</span>
          </button>

          {audioUrl && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                if (onAudioChange) onAudioChange(undefined);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition cursor-pointer"
              title="Hapus Audio"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          )}
        </div>
      )}

      {/* Audio player preview if audio exists */}
      {audioUrl && !isRecording && (
        <div className="p-2.5 rounded-xl bg-white border border-amber-300 shadow-2xs flex items-center gap-3">
          <audio
            ref={audioElementRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
          />

          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-lg bg-amber-400 hover:bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 font-bold shadow-xs transition active:scale-95 cursor-pointer"
            title={isPlaying ? 'Jeda Audio' : 'Putar Audio'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span className="flex items-center gap-1 truncate text-amber-900">
                <Volume2 className="w-3 h-3 text-amber-700 shrink-0" />
                <span>Pratinjau Suara Instruksi Guru</span>
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {formatSec(currentTime)} / {formatSec(duration || 0)}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
