import React, { useMemo } from 'react';
import { UnicodeMathPad, QUICK_UNICODE_ITEMS } from './UnicodeMathPad';

interface MathTextProps {
  text: string;
  className?: string;
  inline?: boolean;
}

/**
 * Cleanly renders pure Unicode Mathematical text with rich styling:
 * - Bold: **teks**
 * - Italic: *teks*
 * - Underline: <u>teks</u>
 * - Colors: [color:red]teks[/color], [color:blue]..., [color:green]..., [color:amber]..., [color:black]...
 * - Highlights: [hl:yellow]teks[/hl], [hl:green]..., [hl:blue]..., [hl:pink]...
 * - Graceful cleanup of any legacy LaTeX dollar signs ($...$)
 */
export const MathText: React.FC<MathTextProps> = ({ text, className = '', inline = false }) => {
  const renderedContent = useMemo(() => {
    if (!text || typeof text !== 'string') return null;

    // First, normalize legacy LaTeX artifacts if any remain in text
    let cleanText = text
      .replace(/\\\$/g, '$')
      .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
      .replace(/\$([^\$]+?)\$/g, '$1')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\sqrt/g, '√')
      .replace(/\\pm/g, '±')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\neq/g, '≠')
      .replace(/\\approx/g, '≈')
      .replace(/\\pi/g, 'π')
      .replace(/\\theta/g, 'θ')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\sum/g, '∑')
      .replace(/\\int/g, '∫')
      .replace(/\\cdot/g, '·')
      .replace(/\\text\{([^}]+)\}/g, '$1');

    // Split text by formatting tokens:
    // [color:...], [hl:...], **, *, <u>, </u>
    const tokenRegex = /(\[color:(?:red|blue|green|amber|black)\][\s\S]*?\[\/color\]|\[hl:(?:yellow|green|blue|pink)\][\s\S]*?\[\/hl\]|\*\*[\s\S]*?\*\*|\*[^\*]+?\*|<u>[\s\S]*?<\/u>)/g;
    const parts = cleanText.split(tokenRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Text color: [color:red]...[/color]
      if (part.startsWith('[color:') && part.endsWith('[/color]')) {
        const match = part.match(/^\[color:([a-z]+)\]([\s\S]*?)\[\/color\]$/);
        if (match) {
          const colorName = match[1];
          const inner = match[2];
          const colorClasses: Record<string, string> = {
            red: 'text-rose-600 font-bold',
            blue: 'text-blue-600 font-bold',
            green: 'text-emerald-600 font-bold',
            amber: 'text-amber-600 font-bold',
            black: 'text-slate-900 font-bold',
          };
          return (
            <span key={index} className={colorClasses[colorName] || 'text-slate-900 font-bold'}>
              {inner}
            </span>
          );
        }
      }

      // Highlight stabilo: [hl:yellow]...[/hl]
      if (part.startsWith('[hl:') && part.endsWith('[/hl]')) {
        const match = part.match(/^\[hl:([a-z]+)\]([\s\S]*?)\[\/hl\]$/);
        if (match) {
          const hlName = match[1];
          const inner = match[2];
          const hlClasses: Record<string, string> = {
            yellow: 'bg-yellow-200/90 text-yellow-950 px-1 py-0.5 rounded font-semibold',
            green: 'bg-emerald-200/90 text-emerald-950 px-1 py-0.5 rounded font-semibold',
            blue: 'bg-sky-200/90 text-sky-950 px-1 py-0.5 rounded font-semibold',
            pink: 'bg-pink-200/90 text-pink-950 px-1 py-0.5 rounded font-semibold',
          };
          return (
            <mark key={index} className={hlClasses[hlName] || 'bg-yellow-200 px-1 py-0.5 rounded font-semibold'}>
              {inner}
            </mark>
          );
        }
      }

      // Bold: **...**
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={index} className="font-extrabold text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic: *...*
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={index} className="italic text-slate-800">
            {part.slice(1, -1)}
          </em>
        );
      }

      // Underline: <u>...</u>
      if (part.startsWith('<u>') && part.endsWith('</u>')) {
        return (
          <span key={index} className="underline decoration-2 decoration-amber-500 font-medium">
            {part.slice(3, -4)}
          </span>
        );
      }

      // Regular text with Unicode math symbols
      return (
        <span key={index} className="whitespace-pre-wrap font-sans">
          {part}
        </span>
      );
    });
  }, [text]);

  if (inline) {
    return (
      <span className={`unicode-math-text inline ${className}`}>
        {renderedContent}
      </span>
    );
  }

  return (
    <div className={`unicode-math-text ${className}`}>
      {renderedContent}
    </div>
  );
};

interface MathToolbarProps {
  onInsert: (snippet: string) => void;
  className?: string;
  label?: string;
}

/**
 * Pure Unicode MathToolbar (for both Teacher and Student editors)
 */
export const MathToolbar: React.FC<MathToolbarProps> = ({
  onInsert,
  className = '',
  label,
}) => {
  return <UnicodeMathPad onInsert={onInsert} className={className} label={label} />;
};

export { UnicodeMathPad, QUICK_UNICODE_ITEMS };
