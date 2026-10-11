import React from 'react';
import { AgentRole } from '../types';

interface MascotProps {
  role: AgentRole;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const MascotCharacter: React.FC<MascotProps> = ({ role, className = '', size = 'md' }) => {
  const sizeClass = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
  }[size];

  switch (role) {
    case 'agent1':
      // Si Pencari Fakta: Pose menunjuk, memegang kaca pembesar dan papan jalan (clipboard)
      return (
        <svg viewBox="0 0 200 220" className={`${sizeClass} ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Soft Shadow */}
          <ellipse cx="100" cy="205" rx="55" ry="10" fill="#94a3b8" opacity="0.3" />
          
          {/* Body / Coat (Pastel Sky Blue) */}
          <rect x="75" y="115" width="50" height="60" rx="18" fill="#38bdf8" />
          <path d="M75 130 Q100 145 125 130" stroke="#0284c7" strokeWidth="3" fill="none" />
          
          {/* Feet */}
          <ellipse cx="85" cy="188" rx="14" ry="10" fill="#0284c7" />
          <ellipse cx="115" cy="188" rx="14" ry="10" fill="#0284c7" />
          <rect x="80" y="170" width="10" height="20" fill="#bae6fd" />
          <rect x="110" y="170" width="10" height="20" fill="#bae6fd" />

          {/* Left Arm pointing forward */}
          <path d="M75 125 Q45 120 35 110" stroke="#38bdf8" strokeWidth="14" strokeLinecap="round" />
          {/* Pointing Hand */}
          <circle cx="30" cy="108" r="9" fill="#fed7aa" />
          <path d="M30 108 L18 102" stroke="#fed7aa" strokeWidth="6" strokeLinecap="round" />

          {/* Right Arm holding Clipboard & Magnifier */}
          <path d="M125 125 Q150 140 155 160" stroke="#38bdf8" strokeWidth="14" strokeLinecap="round" />
          <circle cx="155" cy="160" r="9" fill="#fed7aa" />

          {/* Clipboard (Papan Jalan) */}
          <rect x="135" y="130" width="30" height="42" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="2" transform="rotate(10 135 130)" />
          <rect x="142" y="125" width="16" height="7" rx="2" fill="#78350f" transform="rotate(10 142 125)" />
          <line x1="140" y1="145" x2="160" y2="148" stroke="#78350f" strokeWidth="2" />
          <line x1="141" y1="153" x2="158" y2="156" stroke="#78350f" strokeWidth="2" />

          {/* Large Shiny Magnifying Glass (Kaca Pembesar) */}
          <circle cx="48" cy="85" r="26" fill="#e0f2fe" stroke="#0284c7" strokeWidth="6" opacity="0.9" />
          <circle cx="48" cy="85" r="20" fill="#38bdf8" opacity="0.2" />
          <path d="M40 75 Q52 70 58 80" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          <line x1="68" y1="102" x2="88" y2="120" stroke="#0369a1" strokeWidth="8" strokeLinecap="round" />

          {/* Head */}
          <circle cx="100" cy="75" r="42" fill="#ffedd5" />
          {/* Hair (Brown anime tuft) */}
          <path d="M60 65 Q100 20 140 65 Q130 45 110 40 Q90 40 75 48 Z" fill="#78350f" />
          <path d="M60 68 Q55 50 68 45" fill="#78350f" />
          <path d="M100 35 Q105 18 115 28" stroke="#78350f" strokeWidth="8" strokeLinecap="round" />

          {/* Cute Detective Beret / Hat */}
          <ellipse cx="100" cy="38" rx="44" ry="14" fill="#f59e0b" />
          <ellipse cx="100" cy="32" rx="36" ry="16" fill="#fbbf24" />
          <circle cx="100" cy="18" r="5" fill="#d97706" />

          {/* Eyes (Sparkling Big Anime Eyes) */}
          <ellipse cx="88" cy="78" rx="6" ry="9" fill="#0f172a" />
          <ellipse cx="112" cy="78" rx="6" ry="9" fill="#0f172a" />
          <circle cx="86" cy="75" r="2.5" fill="#ffffff" />
          <circle cx="110" cy="75" r="2.5" fill="#ffffff" />
          
          {/* Blushing Cheeks */}
          <ellipse cx="78" cy="88" rx="7" ry="4" fill="#fb7185" opacity="0.6" />
          <ellipse cx="122" cy="88" rx="7" ry="4" fill="#fb7185" opacity="0.6" />

          {/* Cute Smile */}
          <path d="M94 88 Q100 96 106 88" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'agent2':
      // Si Penguji Coba: Dikelilingi tabung reaksi, labu takar ramuan, kacamata lab, dan layar komputer imut
      return (
        <svg viewBox="0 0 200 220" className={`${sizeClass} ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow */}
          <ellipse cx="100" cy="205" rx="55" ry="10" fill="#94a3b8" opacity="0.3" />

          {/* Cute Computer Screen beside mascot */}
          <rect x="140" y="130" width="38" height="28" rx="6" fill="#1e293b" stroke="#34d399" strokeWidth="2" />
          <rect x="144" y="134" width="30" height="20" rx="3" fill="#0f172a" />
          <path d="M148 144 L154 138 L160 148 L170 140" stroke="#34d399" strokeWidth="2" fill="none" />
          <rect x="154" y="158" width="10" height="8" fill="#475569" />
          <ellipse cx="159" cy="166" rx="12" ry="3" fill="#64748b" />

          {/* Body / Lab Coat (Mint Green) */}
          <rect x="75" y="115" width="50" height="60" rx="18" fill="#34d399" />
          <path d="M90 115 L100 145 L110 115" fill="#ecfdf5" stroke="#059669" strokeWidth="2" />
          
          {/* Feet */}
          <ellipse cx="85" cy="188" rx="14" ry="10" fill="#059669" />
          <ellipse cx="115" cy="188" rx="14" ry="10" fill="#059669" />
          <rect x="80" y="170" width="10" height="20" fill="#a7f3d0" />
          <rect x="110" y="170" width="10" height="20" fill="#a7f3d0" />

          {/* Right Arm holding bubbling Flask */}
          <path d="M125 125 Q145 135 135 155" stroke="#34d399" strokeWidth="13" strokeLinecap="round" />
          <circle cx="132" cy="155" r="8" fill="#fed7aa" />

          {/* Flask with colorful potion */}
          <path d="M128 148 L136 148 L142 165 C144 170 138 174 132 174 C126 174 120 170 122 165 Z" fill="#ec4899" stroke="#9d174d" strokeWidth="2" />
          <circle cx="130" cy="162" r="2" fill="#fbcfe8" />
          <circle cx="135" cy="166" r="3" fill="#fdf2f8" />
          {/* Bubbles */}
          <circle cx="132" cy="142" r="3" fill="#f472b6" opacity="0.8" />
          <circle cx="138" cy="136" r="2.5" fill="#a855f7" opacity="0.8" />
          <circle cx="126" cy="134" r="2" fill="#38bdf8" opacity="0.8" />

          {/* Left Arm holding test tube rack */}
          <path d="M75 125 Q55 135 52 155" stroke="#34d399" strokeWidth="13" strokeLinecap="round" />
          <circle cx="52" cy="155" r="8" fill="#fed7aa" />
          {/* Test Tube */}
          <rect x="42" y="142" width="8" height="24" rx="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
          <rect x="44" y="152" width="4" height="12" rx="2" fill="#0284c7" />

          {/* Head */}
          <circle cx="100" cy="75" r="42" fill="#ffedd5" />
          {/* Hair (Spiky / fluffy scientist hair) */}
          <path d="M60 65 Q95 18 140 65 Q135 40 125 32 Q105 25 85 30 Z" fill="#475569" />
          <circle cx="68" cy="45" r="8" fill="#475569" />
          <circle cx="132" cy="45" r="8" fill="#475569" />

          {/* Big Cute Science Goggles */}
          <circle cx="86" cy="74" r="16" fill="#bae6fd" stroke="#0284c7" strokeWidth="4" />
          <circle cx="114" cy="74" r="16" fill="#bae6fd" stroke="#0284c7" strokeWidth="4" />
          <line x1="102" y1="74" x2="98" y2="74" stroke="#0284c7" strokeWidth="4" />
          <path d="M78 68 Q84 62 90 70" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <path d="M106 68 Q112 62 118 70" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

          {/* Eyes inside goggles */}
          <circle cx="86" cy="75" r="6" fill="#0f172a" />
          <circle cx="114" cy="75" r="6" fill="#0f172a" />
          <circle cx="88" cy="73" r="2" fill="#ffffff" />
          <circle cx="116" cy="73" r="2" fill="#ffffff" />

          {/* Cheeks & Smile */}
          <ellipse cx="76" cy="88" rx="6" ry="3.5" fill="#f43f5e" opacity="0.6" />
          <ellipse cx="124" cy="88" rx="6" ry="3.5" fill="#f43f5e" opacity="0.6" />
          <path d="M94 88 Q100 96 106 88" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'agent3':
      // Si Pembuat Rencana: Karakter imut memegang cetak biru (blueprint) dan kompas emas
      return (
        <svg viewBox="0 0 200 220" className={`${sizeClass} ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow */}
          <ellipse cx="100" cy="205" rx="55" ry="10" fill="#94a3b8" opacity="0.3" />

          {/* Body / Captain Jacket (Warm Amber & Gold) */}
          <rect x="75" y="115" width="50" height="60" rx="18" fill="#f59e0b" />
          <path d="M80 115 L100 135 L120 115" fill="#fef3c7" stroke="#b45309" strokeWidth="2" />
          {/* Gold Epaulets / Badges */}
          <circle cx="76" cy="122" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
          <circle cx="124" cy="122" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />

          {/* Feet */}
          <ellipse cx="85" cy="188" rx="14" ry="10" fill="#b45309" />
          <ellipse cx="115" cy="188" rx="14" ry="10" fill="#b45309" />
          <rect x="80" y="170" width="10" height="20" fill="#fde68a" />
          <rect x="110" y="170" width="10" height="20" fill="#fde68a" />

          {/* Left Arm holding Compass */}
          <path d="M75 125 Q50 135 48 155" stroke="#f59e0b" strokeWidth="13" strokeLinecap="round" />
          <circle cx="48" cy="155" r="8" fill="#fed7aa" />

          {/* Golden Compass (Kompas Berkilau) */}
          <circle cx="42" cy="158" r="16" fill="#fef08a" stroke="#d97706" strokeWidth="3" />
          <circle cx="42" cy="158" r="12" fill="#ffffff" />
          {/* Compass Needle */}
          <polygon points="42,148 45,158 39,158" fill="#ef4444" />
          <polygon points="42,168 45,158 39,158" fill="#3b82f6" />
          <circle cx="42" cy="158" r="2" fill="#0f172a" />

          {/* Right Arm holding Blueprint */}
          <path d="M125 125 Q145 130 150 150" stroke="#f59e0b" strokeWidth="13" strokeLinecap="round" />
          <circle cx="150" cy="150" r="8" fill="#fed7aa" />

          {/* Rolled Blueprint (Cetak Biru) */}
          <rect x="135" y="125" width="34" height="42" rx="4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" transform="rotate(-15 135 125)" />
          <line x1="140" y1="135" x2="162" y2="135" stroke="#93c5fd" strokeWidth="2" transform="rotate(-15 140 135)" />
          <line x1="140" y1="142" x2="160" y2="142" stroke="#93c5fd" strokeWidth="2" transform="rotate(-15 140 142)" />
          <line x1="140" y1="149" x2="155" y2="149" stroke="#93c5fd" strokeWidth="2" transform="rotate(-15 140 149)" />
          <circle cx="150" cy="144" r="3" stroke="#fef08a" strokeWidth="1.5" fill="none" transform="rotate(-15 150 144)" />

          {/* Head */}
          <circle cx="100" cy="75" r="42" fill="#ffedd5" />

          {/* Cute Captain Cap */}
          <ellipse cx="100" cy="45" rx="36" ry="12" fill="#1e3a8a" />
          <path d="M68 45 Q100 20 132 45 Z" fill="#ffffff" />
          <rect x="68" y="42" width="64" height="6" fill="#1e3a8a" />
          <circle cx="100" cy="40" r="5" fill="#fbbf24" />
          <path d="M60 48 Q100 62 140 48" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />

          {/* Anime Hair */}
          <path d="M62 65 Q100 45 138 65 Q125 50 100 48 Z" fill="#92400e" />

          {/* Big Confident Eyes */}
          <ellipse cx="88" cy="76" rx="6" ry="9" fill="#0f172a" />
          <ellipse cx="112" cy="76" rx="6" ry="9" fill="#0f172a" />
          <circle cx="86" cy="73" r="2.5" fill="#ffffff" />
          <circle cx="110" cy="73" r="2.5" fill="#ffffff" />

          {/* Cheeks & Triumphant Smile */}
          <ellipse cx="78" cy="86" rx="7" ry="4" fill="#f87171" opacity="0.6" />
          <ellipse cx="122" cy="86" rx="7" ry="4" fill="#f87171" opacity="0.6" />
          <path d="M92 88 Q100 98 108 88" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="#ffffff" />
        </svg>
      );

    case 'agent4':
      // Si Pengamat Lapangan: Topi petualang safari, teropong binokular dan kamera alam
      return (
        <svg viewBox="0 0 200 220" className={`${sizeClass} ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="100" cy="205" rx="55" ry="10" fill="#94a3b8" opacity="0.3" />
          <rect x="75" y="115" width="50" height="60" rx="18" fill="#10b981" />
          <ellipse cx="85" cy="188" rx="14" ry="10" fill="#047857" />
          <ellipse cx="115" cy="188" rx="14" ry="10" fill="#047857" />
          
          {/* Binoculars on neck */}
          <rect x="88" y="130" width="10" height="16" rx="3" fill="#334155" />
          <rect x="102" y="130" width="10" height="16" rx="3" fill="#334155" />
          <line x1="98" y1="138" x2="102" y2="138" stroke="#64748b" strokeWidth="3" />

          {/* Hands holding map / camera */}
          <path d="M75 125 Q55 140 50 155" stroke="#10b981" strokeWidth="13" strokeLinecap="round" />
          <path d="M125 125 Q145 140 148 155" stroke="#10b981" strokeWidth="13" strokeLinecap="round" />

          {/* Head & Safari Hat */}
          <circle cx="100" cy="75" r="42" fill="#ffedd5" />
          <ellipse cx="100" cy="40" rx="46" ry="14" fill="#84cc16" />
          <ellipse cx="100" cy="32" rx="32" ry="16" fill="#65a30d" />

          {/* Eyes & Big Smile */}
          <ellipse cx="88" cy="76" rx="6" ry="8" fill="#0f172a" />
          <ellipse cx="112" cy="76" rx="6" ry="8" fill="#0f172a" />
          <circle cx="86" cy="73" r="2.5" fill="#ffffff" />
          <circle cx="110" cy="73" r="2.5" fill="#ffffff" />
          <ellipse cx="78" cy="86" rx="6" ry="3.5" fill="#f87171" opacity="0.6" />
          <ellipse cx="122" cy="86" rx="6" ry="3.5" fill="#f87171" opacity="0.6" />
          <path d="M93 88 Q100 97 107 88" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'agent5':
      // Si Juru Bicara: Megafon warna-warni & poster kampanye
      return (
        <svg viewBox="0 0 200 220" className={`${sizeClass} ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="100" cy="205" rx="55" ry="10" fill="#94a3b8" opacity="0.3" />
          <rect x="75" y="115" width="50" height="60" rx="18" fill="#ec4899" />
          <ellipse cx="85" cy="188" rx="14" ry="10" fill="#be185d" />
          <ellipse cx="115" cy="188" rx="14" ry="10" fill="#be185d" />

          {/* Megaphone in Hand */}
          <path d="M75 125 Q45 125 40 145" stroke="#ec4899" strokeWidth="13" strokeLinecap="round" />
          <polygon points="35,135 15,120 15,160 35,145" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
          <ellipse cx="15" cy="140" rx="3" ry="20" fill="#f59e0b" />

          {/* Head & Ribbon Headband */}
          <circle cx="100" cy="75" r="42" fill="#ffedd5" />
          <path d="M60 48 Q100 35 140 48" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" />
          <circle cx="125" cy="45" r="8" fill="#f43f5e" />

          {/* Eyes & Excited Smile */}
          <ellipse cx="88" cy="76" rx="6" ry="8" fill="#0f172a" />
          <ellipse cx="112" cy="76" rx="6" ry="8" fill="#0f172a" />
          <circle cx="86" cy="73" r="2.5" fill="#ffffff" />
          <circle cx="110" cy="73" r="2.5" fill="#ffffff" />
          <ellipse cx="78" cy="86" rx="6" ry="3.5" fill="#fb7185" opacity="0.6" />
          <ellipse cx="122" cy="86" rx="6" ry="3.5" fill="#fb7185" opacity="0.6" />
          <path d="M92 86 Q100 100 108 86 Z" fill="#e11d48" />
        </svg>
      );
  }
};

/**
 * Beautiful Cartoon Danau Cermin Background with peaceful hills, crystal lake, jumping fishes, bunnies, and a bright rainbow
 */
export const DanauCerminCartoonBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-10">
      {/* Sky Gradient (Pastel Sky Blue to Soft Mint) */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-teal-50 to-emerald-50" />

      {/* Radiant Sun in top right */}
      <div className="absolute top-4 right-10 w-20 h-20 rounded-full bg-amber-300 opacity-60 blur-xl animate-pulse" />
      <div className="absolute top-6 right-12 w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-300/40">
        <span className="text-xl">☀️</span>
      </div>

      {/* Arching Rainbow (Pelangi Cerah) */}
      <svg className="absolute -top-12 left-1/2 -translate-x-1/2 w-[800px] h-[340px] opacity-75" viewBox="0 0 600 300" fill="none">
        <path d="M50 300 A250 250 0 0 1 550 300" stroke="#f87171" strokeWidth="12" strokeLinecap="round" />
        <path d="M62 300 A238 238 0 0 1 538 300" stroke="#fbbf24" strokeWidth="12" strokeLinecap="round" />
        <path d="M74 300 A226 226 0 0 1 526 300" stroke="#34d399" strokeWidth="12" strokeLinecap="round" />
        <path d="M86 300 A214 214 0 0 1 514 300" stroke="#38bdf8" strokeWidth="12" strokeLinecap="round" />
        <path d="M98 300 A202 202 0 0 1 502 300" stroke="#c084fc" strokeWidth="12" strokeLinecap="round" />
      </svg>

      {/* Fluffy Cartoon Clouds */}
      <div className="absolute top-12 left-10 flex gap-1 opacity-80 animate-bounce" style={{ animationDuration: '6s' }}>
        <div className="w-16 h-8 bg-white rounded-full shadow-md" />
        <div className="w-10 h-10 bg-white rounded-full -ml-6 -mt-3" />
        <div className="w-12 h-8 bg-white rounded-full -ml-4" />
      </div>

      <div className="absolute top-20 right-32 flex gap-1 opacity-70 animate-bounce" style={{ animationDuration: '8s' }}>
        <div className="w-20 h-10 bg-white rounded-full shadow-md" />
        <div className="w-12 h-12 bg-white rounded-full -ml-8 -mt-4" />
        <div className="w-14 h-10 bg-white rounded-full -ml-4" />
      </div>

      {/* Rolling Green Hills in background */}
      <svg className="absolute bottom-28 left-0 right-0 w-full h-44 opacity-80" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <path d="M0 120 Q300 40 600 100 T1200 80 L1200 200 L0 200 Z" fill="#a7f3d0" />
        <path d="M0 140 Q400 70 800 130 T1200 110 L1200 200 L0 200 Z" fill="#6ee7b7" />
      </svg>

      {/* Danau Cermin Waters (Crystal Turquoise Lake with gentle ripples) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sky-400 via-cyan-300 to-teal-200 border-t-4 border-emerald-300/80">
        {/* Shiny water streaks */}
        <div className="absolute top-4 left-1/4 w-32 h-1.5 bg-white/70 rounded-full" />
        <div className="absolute top-10 left-1/2 w-48 h-2 bg-white/60 rounded-full" />
        <div className="absolute top-16 left-1/5 w-24 h-1.5 bg-white/70 rounded-full" />
        <div className="absolute top-20 right-1/4 w-40 h-2 bg-white/60 rounded-full" />

        {/* Cute Jumping Fish */}
        <div className="absolute top-3 left-1/3 text-xl animate-bounce" style={{ animationDuration: '2.5s' }}>
          🐟
        </div>
        <div className="absolute top-6 right-1/3 text-lg animate-bounce" style={{ animationDuration: '3.2s' }}>
          ✨
        </div>

        {/* Shore Grass & Friendly Critters */}
        <div className="absolute -top-6 left-12 text-2xl">
          🐰
        </div>
        <div className="absolute -top-7 right-20 text-2xl">
          🦆
        </div>
        <div className="absolute -top-4 left-1/2 text-xl">
          🌸
        </div>
      </div>
    </div>
  );
};
