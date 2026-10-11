import { AgentRole, LkmConfig, RoomData } from '../types';

export interface ScoreDetail {
  totalQuestions: number;
  autoGradedQuestions: number;
  correctCount: number;
  openQuestionsCount: number;
  openAnsweredCount: number;
  calculatedScore: number; // 0 - 100
  agentBreakdown: Record<AgentRole, {
    total: number;
    filled: number;
    autoTotal: number;
    autoCorrect: number;
  }>;
}

/**
 * Normalizes and checks if two mathematical answers are equivalent:
 * - Fractions & Decimals & Percentages: "1/2" == "0.5" == "0,5" == "50%" == "½" == "2/4"
 * - Fractions: "1/4" == "0.25" == "25%" == "¼"
 * - "3/4" == "0.75" == "75%" == "¾"
 * - "1/3" == "⅓" == "0.33" == "0.333"
 * - Unicode superscripts & powers: "x²" == "x^2", "x³" == "x^3"
 * - Unicode subscripts: "x₁" == "x_1"
 * - Matrices / Coordinate pairs: "[2, 3]" == "(2, 3)" == "2, 3"
 * - Unicode operators: "−" == "-", "×" == "*", "÷" == "/"
 * - Ignores extraneous spacing, capitalization, and minor unit differences.
 */
export function isMathEquivalent(actualStr: string, expectedStr: string): boolean {
  if (!actualStr || !expectedStr) return false;

  const actualTrim = String(actualStr).trim().toLowerCase();
  const expectedTrim = String(expectedStr).trim().toLowerCase();

  // 1. Direct match
  if (actualTrim === expectedTrim) return true;

  // 2. Helper to normalize math symbols to canonical ASCII
  const normalize = (str: string): string => {
    return str
      .replace(/\s+/g, '') // remove all whitespace
      .replace(/½/g, '1/2')
      .replace(/⅓/g, '1/3')
      .replace(/⅔/g, '2/3')
      .replace(/¼/g, '1/4')
      .replace(/¾/g, '3/4')
      .replace(/⅕/g, '1/5')
      .replace(/⅖/g, '2/5')
      .replace(/⅗/g, '3/5')
      .replace(/⅘/g, '4/5')
      .replace(/⅙/g, '1/6')
      .replace(/⅚/g, '5/6')
      .replace(/⅛/g, '1/8')
      .replace(/⅜/g, '3/8')
      .replace(/⅝/g, '5/8')
      .replace(/⅞/g, '7/8')
      .replace(/⁰/g, '^0')
      .replace(/¹/g, '^1')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/⁴/g, '^4')
      .replace(/⁵/g, '^5')
      .replace(/⁶/g, '^6')
      .replace(/⁷/g, '^7')
      .replace(/⁸/g, '^8')
      .replace(/⁹/g, '^9')
      .replace(/ⁿ/g, '^n')
      .replace(/ˣ/g, '^x')
      .replace(/ʸ/g, '^y')
      .replace(/₀/g, '_0')
      .replace(/₁/g, '_1')
      .replace(/₂/g, '_2')
      .replace(/₃/g, '_3')
      .replace(/₄/g, '_4')
      .replace(/₅/g, '_5')
      .replace(/₆/g, '_6')
      .replace(/₇/g, '_7')
      .replace(/₈/g, '_8')
      .replace(/₉/g, '_9')
      .replace(/[−–—]/g, '-')
      .replace(/[×·]/g, '*')
      .replace(/÷/g, '/')
      .replace(/,/g, '.') // comma decimal to dot decimal
      .replace(/[\[\]\(\)\{\}]/g, '') // strip brackets for comparison
      .toLowerCase();
  };

  const normActual = normalize(actualTrim);
  const normExpected = normalize(expectedTrim);

  if (normActual === normExpected) return true;

  // 3. Parse numeric value if possible (supports fractions, decimals, percentages)
  const parseMathValue = (s: string): number | null => {
    const clean = s.trim();
    // Percentage: "50%" -> 0.5
    if (clean.endsWith('%')) {
      const num = parseFloat(clean.slice(0, -1));
      if (!isNaN(num)) return num / 100;
    }
    // Fraction: "1/2" or "3/4" or "2/4"
    if (/^-?\d+(?:\.\d+)?\/-?\d+(?:\.\d+)?$/.test(clean)) {
      const parts = clean.split('/');
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
    // Float/integer
    if (/^-?\d+(?:\.\d+)?$/.test(clean)) {
      const val = parseFloat(clean);
      if (!isNaN(val)) return val;
    }
    return null;
  };

  const valActual = parseMathValue(normActual);
  const valExpected = parseMathValue(normExpected);

  if (valActual !== null && valExpected !== null) {
    if (Math.abs(valActual - valExpected) < 0.001) {
      return true;
    }
  }

  // 4. Substring inclusion fallback for units or longer expressions
  if (normActual.length >= 2 && normExpected.length >= 2) {
    if (normActual.includes(normExpected) || normExpected.includes(normActual)) {
      return true;
    }
  }

  return false;
}

/**
 * Calculates score automatically based on Answer Keys (Kunci Jawaban).
 * - For Multiple Choice: flexible math match
 * - For Checkbox: arrays contain equivalent elements (order independent)
 * - For Inline Blank & Short: flexible math equivalence (e.g. 1/2 == 0.5 == 50% == ½)
 * - Open/Short/Essay without answer key: awarded completion points
 */
export function calculateRoomScore(room: RoomData, lkmConfig?: LkmConfig): ScoreDetail {
  const cfg = lkmConfig || room.lkmConfig;
  const agentCount = room.agentCount || cfg?.agentCount || 3;

  const visibleRoles: AgentRole[] = (
    agentCount === 3
      ? ['agent1', 'agent2', 'agent3']
      : agentCount === 4
      ? ['agent1', 'agent2', 'agent3', 'agent4']
      : ['agent1', 'agent2', 'agent3', 'agent4', 'agent5']
  );

  let totalQuestions = 0;
  let autoGradedQuestions = 0;
  let correctCount = 0;
  let openQuestionsCount = 0;
  let openAnsweredCount = 0;

  const agentBreakdown: Record<AgentRole, {
    total: number;
    filled: number;
    autoTotal: number;
    autoCorrect: number;
  }> = {
    agent1: { total: 0, filled: 0, autoTotal: 0, autoCorrect: 0 },
    agent2: { total: 0, filled: 0, autoTotal: 0, autoCorrect: 0 },
    agent3: { total: 0, filled: 0, autoTotal: 0, autoCorrect: 0 },
    agent4: { total: 0, filled: 0, autoTotal: 0, autoCorrect: 0 },
    agent5: { total: 0, filled: 0, autoTotal: 0, autoCorrect: 0 },
  };

  visibleRoles.forEach((role) => {
    const task = cfg?.agentTasks?.[role];
    const roleAnswers = (room[`${role}Data` as keyof RoomData] as any)?.answers || {};
    const questions = task?.questions || [];

    questions.forEach((q) => {
      totalQuestions++;
      agentBreakdown[role].total++;

      const studentAns = roleAnswers[q.id];
      const hasAnswer = studentAns !== undefined && studentAns !== null && (
        Array.isArray(studentAns) ? studentAns.length > 0 : String(studentAns).trim() !== ''
      );

      if (hasAnswer) {
        agentBreakdown[role].filled++;
      }

      const hasKey = q.correctAnswer !== undefined && q.correctAnswer !== null && (
        Array.isArray(q.correctAnswer) ? q.correctAnswer.length > 0 : String(q.correctAnswer).trim() !== ''
      );

      if (hasKey) {
        autoGradedQuestions++;
        agentBreakdown[role].autoTotal++;

        if (q.type === 'multiple_choice') {
          const expected = String(q.correctAnswer).trim();
          const actual = String(studentAns || '').trim();
          if (expected && actual && isMathEquivalent(actual, expected)) {
            correctCount++;
            agentBreakdown[role].autoCorrect++;
          }
        } else if (q.type === 'checkbox') {
          const expectedList: string[] = Array.isArray(q.correctAnswer)
            ? q.correctAnswer
            : [String(q.correctAnswer)];
          const actualList: string[] = Array.isArray(studentAns)
            ? studentAns
            : studentAns ? [String(studentAns)] : [];

          // Compare set with flexible math equivalence
          if (expectedList.length > 0 && actualList.length === expectedList.length) {
            const allMatched = expectedList.every((exp) =>
              actualList.some((act) => isMathEquivalent(act, exp))
            );
            if (allMatched) {
              correctCount++;
              agentBreakdown[role].autoCorrect++;
            }
          }
        } else if (q.type === 'inline_blank') {
          const expected = String(q.correctAnswer).trim();
          let actual = '';
          if (typeof studentAns === 'object' && studentAns !== null) {
            actual = Object.values(studentAns).join(' ').trim();
          } else {
            actual = String(studentAns || '').trim();
          }

          if (expected && actual && isMathEquivalent(actual, expected)) {
            correctCount++;
            agentBreakdown[role].autoCorrect++;
          }
        } else {
          // Short answer, table cell, or other with key
          const expected = String(q.correctAnswer).trim();
          const actual = String(studentAns || '').trim();
          if (expected && actual && isMathEquivalent(actual, expected)) {
            correctCount++;
            agentBreakdown[role].autoCorrect++;
          }
        }
      } else {
        openQuestionsCount++;
        if (hasAnswer) {
          openAnsweredCount++;
        }
      }
    });

    // Also account for canvas mode answers if task uses canvas
    if (task?.worksheetMode === 'canvas') {
      const canvasKeys = Object.keys(roleAnswers).filter((k) => k.startsWith(`${role}_inline_`) || k.startsWith(`${role}_table_`));
      canvasKeys.forEach((k) => {
        const val = roleAnswers[k];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          totalQuestions++;
          agentBreakdown[role].total++;
          agentBreakdown[role].filled++;
          openQuestionsCount++;
          openAnsweredCount++;
        }
      });
    }
  });

  // Calculate percentage:
  let calculatedScore = 70;
  if (totalQuestions > 0) {
    if (autoGradedQuestions > 0) {
      const autoScorePart = (correctCount / autoGradedQuestions) * (openQuestionsCount > 0 ? 60 : 90);
      const openScorePart = openQuestionsCount > 0 ? (openAnsweredCount / openQuestionsCount) * 35 : 10;
      calculatedScore = Math.min(100, Math.round(autoScorePart + openScorePart));
    } else {
      calculatedScore = Math.min(100, Math.round((openAnsweredCount / totalQuestions) * 100));
    }
  }

  return {
    totalQuestions,
    autoGradedQuestions,
    correctCount,
    openQuestionsCount,
    openAnsweredCount,
    calculatedScore: Math.max(10, calculatedScore),
    agentBreakdown,
  };
}
