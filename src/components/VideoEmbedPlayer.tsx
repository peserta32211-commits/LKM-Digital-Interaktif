import React from 'react';
import { Video, ExternalLink } from 'lucide-react';

interface VideoEmbedPlayerProps {
  videoUrl?: string;
  title?: string;
  className?: string;
}

/**
 * Extracts embeddable URL from YouTube, Google Drive, or Direct Video
 */
export function getEmbeddableVideoUrl(rawUrl?: string): { type: 'youtube' | 'drive' | 'direct' | 'invalid'; embedUrl?: string } {
  if (!rawUrl || !rawUrl.trim()) return { type: 'invalid' };
  const url = rawUrl.trim();

  // 1. YouTube Detection
  // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0`,
    };
  }

  // 2. Google Drive Detection
  // Matches: drive.google.com/file/d/ID/...
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
    };
  }

  // 3. Direct video file (mp4, webm, ogg) or other http link
  if (/\.(mp4|webm|ogg)($|\?)/i.test(url)) {
    return {
      type: 'direct',
      embedUrl: url,
    };
  }

  // Fallback iframe embed if user already provided embed url
  if (url.includes('embed')) {
    return {
      type: 'youtube',
      embedUrl: url,
    };
  }

  return { type: 'direct', embedUrl: url };
}

export const VideoEmbedPlayer: React.FC<VideoEmbedPlayerProps> = ({
  videoUrl,
  title = 'Video Pembelajaran & Simulasi Konsep',
  className = '',
}) => {
  if (!videoUrl || !videoUrl.trim()) return null;

  const { type, embedUrl } = getEmbeddableVideoUrl(videoUrl);
  if (type === 'invalid' || !embedUrl) return null;

  return (
    <div className={`rounded-2xl border-2 border-amber-300 bg-white overflow-hidden shadow-sm space-y-0 ${className}`}>
      {/* Video Bar Header */}
      <div className="p-2.5 bg-gradient-to-r from-amber-100 to-yellow-50 border-b border-amber-200 flex items-center justify-between text-xs">
        <span className="font-black text-amber-950 flex items-center gap-1.5 truncate">
          <Video className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="truncate">{title}</span>
        </span>

        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 hover:underline ml-2 shrink-0"
        >
          <span>Buka di Tab Baru</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Embed Container (16:9 Aspect Ratio) */}
      <div className="relative w-full aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
        {type === 'direct' && /\.(mp4|webm|ogg)($|\?)/i.test(videoUrl) ? (
          <video
            controls
            src={embedUrl}
            className="w-full h-full object-contain"
            playsInline
          >
            Browser Anda tidak mendukung pemutar video HTML5.
          </video>
        ) : (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};
