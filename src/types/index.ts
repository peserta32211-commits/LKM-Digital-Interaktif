export type AgentRole = 'agent1' | 'agent2' | 'agent3' | 'agent4' | 'agent5';

export type QuestionType = 
  | 'short' 
  | 'essay' 
  | 'multiple_choice' 
  | 'checkbox' 
  | 'inline_blank' 
  | 'table';

export interface QuestionConfig {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[]; // For multiple_choice & checkbox
  correctAnswer?: string | string[]; // Kunci jawaban
  placeholder?: string;
  imageUrl?: string; // Unggahan gambar guru untuk soal/petunjuk
  imageCaption?: string;
  audioUrl?: string; // Rekaman suara guru / file audio instruksi soal
  videoUrl?: string; // URL video YouTube / Google Drive / video player
  // Khusus tipe 'table'
  tableHeaders?: string[];
  tableRowCount?: number;
  tableRowLabels?: string[];
}

export interface AgentTaskConfig {
  agentRole: AgentRole;
  title: string;
  roleName: string;
  roleNickname: string;
  tagline: string;
  instructions: string;
  imageUrl?: string;
  worksheetMode?: 'canvas' | 'cards'; // Freeform rich canvas atau kartu soal
  worksheetContent?: string; // Teks naskah LKM bebas dengan inline shortcodes [isian], [pg:...], [cb:...], [table:...]
  questions: QuestionConfig[];
  simulationType?: 'bioremediation_ecosystem' | 'physics_propulsion' | 'economic_market_balance' | 'custom' | 'none';
  param1Label?: string;
  param2Label?: string;
}

export interface RoomMember {
  name: string;
  online: boolean;
  lastActive: number;
}

export interface SimulationTrial {
  id: string;
  timestamp: string;
  pollutantLevel: number;
  bioremediatorDose: number;
  reactorTemp: number;
  aerationRate: number;
  recoveryIndex: number;
  producersPop: number;
  consumers1Pop: number;
  consumers2Pop: number;
  notes: string;
}

export interface GenericAgentData {
  answers: Record<string, any>; // questionId -> value (string or string[])
  completed: boolean;
}

export interface Agent1Data extends GenericAgentData {
  selectedPollutant?: string;
  criticalFindings?: string;
  waterQualityAnalysis?: {
    phAssessment: string;
    dissolvedOxygenAnalysis: string;
    heavyMetalToxicity: string;
  };
  trophicImpactHypothesis?: string;
  targetSpeciesMortalityRate?: string;
  dataConfidenceScore?: number;
}

export interface Agent2Data extends GenericAgentData {
  simulationParams?: {
    pollutantLevel: number;
    bioremediatorDose: number;
    reactorTemp: number;
    aerationRate: number;
  };
  simulationTrials?: SimulationTrial[];
  visualObservations?: string;
  optimalThresholdIdentified?: string;
  bioremediationEfficacy?: string;
}

export interface Agent3Data extends GenericAgentData {
  strategicDecisions?: {
    immediateAction24h: string;
    remediationPlan7d: string;
    conservationPolicy30d: string;
  };
  riskAnalysis?: string;
  resourceAllocation?: {
    budgetDistribution: string;
    communityInvolvement: string;
  };
  finalScientificConclusion?: string;
}

export interface Agent4Data extends GenericAgentData {
  fieldObservations?: string;
  ecosystemVulnerabilityScore?: number;
  communityImpactNotes?: string;
}

export interface Agent5Data extends GenericAgentData {
  campaignSlogan?: string;
  targetAudience?: string;
  actionProtocolSummary?: string;
}

export interface LkmClue {
  title: string;
  badge: string;
  content: string;
}

export interface LkmConfig {
  pin: string;
  title: string;
  subject: string;
  topic: string;
  grade: string;
  timerMinutes: number;
  agentCount: 3 | 4 | 5;
  storyBriefing: string;
  storyBriefingImage?: string; // Unggahan gambar cerita kasus/briefing oleh Guru
  storyAudioUrl?: string; // Rekaman suara guru narasi kasus / file audio
  storyVideoUrl?: string; // URL video YouTube / Drive / direct video
  clues: [LkmClue, LkmClue, LkmClue];
  agentTasks: Record<AgentRole, AgentTaskConfig>;
  webhookUrl?: string;
  createdAt: string;
}

export interface RoomData {
  roomId: string;
  teamName: string;
  subject: string;
  topic: string;
  grade: string;
  timerDurationSeconds: number;
  timerRemainingSeconds: number;
  timerRunning: boolean;
  updatedAt: number;
  agentCount: 3 | 4 | 5;
  tabSwitchCount?: number; // Total frekuensi siswa meninggalkan tab/window
  members: Record<AgentRole, RoomMember>;
  agent1Data: Agent1Data;
  agent2Data: Agent2Data;
  agent3Data: Agent3Data;
  agent4Data: Agent4Data;
  agent5Data: Agent5Data;
  simulationTrials?: SimulationTrial[];
  simulationParams?: {
    pollutantLevel: number;
    bioremediatorDose: number;
    reactorTemp: number;
    aerationRate: number;
  };
  status: 'active' | 'submitted';
  submittedAt?: string;
  webhookUrl?: string;
  submissionScore?: number;
  lkmPin?: string;
  lkmConfig?: LkmConfig;
}

export interface SubmissionRecord {
  id: string;
  roomId: string;
  teamName: string;
  submittedAt: string;
  timeRemainingFormatted: string;
  secondsRemaining: number;
  score: number;
  tabSwitchCount?: number; // Jumlah frekuensi pelanggaran pindah tab
  members: Record<string, string>;
  dossierSummary: {
    criticalFindings: string;
    simulationRecoveryRate: string;
    finalConclusion: string;
    agentCount: number;
  };
  fullData: RoomData;
  webhookStatus?: 'sent' | 'failed' | 'not_configured';
  webhookError?: string;
}

export const ROLE_METADATA: Record<AgentRole, {
  name: string;
  title: string;
  nickname: string;
  badge: string;
  colorName: string;
  bgLight: string;
  borderLight: string;
  accentColor: string;
  textColor: string;
}> = {
  agent1: {
    name: 'Si Pencari Fakta',
    title: 'Ahli Data & Penyelidik Masalah',
    nickname: 'Agen 1',
    badge: 'PENELITI FAKTA',
    colorName: 'sky',
    bgLight: 'bg-sky-50',
    borderLight: 'border-sky-300',
    accentColor: '#38bdf8',
    textColor: 'text-sky-700',
  },
  agent2: {
    name: 'Si Penguji Coba',
    title: 'Ahli Eksperimen & Simulasi',
    nickname: 'Agen 2',
    badge: 'EKSPERIMEN',
    colorName: 'emerald',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-300',
    accentColor: '#34d399',
    textColor: 'text-emerald-700',
  },
  agent3: {
    name: 'Si Pembuat Rencana',
    title: 'Kapten Tim & Pembuat Keputusan',
    nickname: 'Agen 3',
    badge: 'KAPTEN TIM',
    colorName: 'amber',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-300',
    accentColor: '#fbbf24',
    textColor: 'text-amber-800',
  },
  agent4: {
    name: 'Si Pembawa Cerita',
    title: 'Ahli Komunikasi & Presentasi',
    nickname: 'Agen 4',
    badge: 'KOMUNIKASI',
    colorName: 'rose',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-300',
    accentColor: '#fb7185',
    textColor: 'text-rose-700',
  },
  agent5: {
    name: 'Si Penjaga Kualitas',
    title: 'Ahli Evaluasi & Pengamat Detail',
    nickname: 'Agen 5',
    badge: 'PENGAWAS MUTU',
    colorName: 'purple',
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-300',
    accentColor: '#c084fc',
    textColor: 'text-purple-700',
  },
};
