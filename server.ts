import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultMathTemplates, templateMat3 } from './src/constants/defaultMathTemplates';
import type { 
  AgentRole, 
  QuestionType, 
  QuestionConfig, 
  AgentTaskConfig, 
  LkmClue, 
  LkmConfig, 
  RoomMember, 
  GenericAgentData, 
  RoomData, 
  SubmissionRecord 
} from './src/types';

export type { 
  AgentRole, 
  QuestionType, 
  QuestionConfig, 
  AgentTaskConfig, 
  LkmClue, 
  LkmConfig, 
  RoomMember, 
  GenericAgentData, 
  RoomData, 
  SubmissionRecord 
};

export const defaultLkmTemplates: LkmConfig[] = defaultMathTemplates;


// In-Memory Database
const lkmConfigs = new Map<string, LkmConfig>();
defaultLkmTemplates.forEach((t) => lkmConfigs.set(t.pin.toUpperCase(), t));

const rooms = new Map<string, RoomData>();
const sseClients = new Map<string, Set<Response>>();
const submissions: SubmissionRecord[] = [];

function createInitialGenericAgentData(): GenericAgentData {
  return {
    answers: {},
    completed: false,
  };
}

function createRoomFromConfig(roomId: string, config: LkmConfig, teamName?: string): RoomData {
  return {
    roomId,
    teamName: teamName || `TIM-${config.pin}-${roomId}`,
    subject: config.subject,
    topic: config.topic,
    grade: config.grade,
    timerDurationSeconds: config.timerMinutes * 60,
    timerRemainingSeconds: config.timerMinutes * 60,
    timerRunning: false,
    updatedAt: Date.now(),
    agentCount: config.agentCount || 3,
    lkmPin: config.pin,
    lkmConfig: config,
    members: {
      agent1: { name: '', online: false, lastActive: 0 },
      agent2: { name: '', online: false, lastActive: 0 },
      agent3: { name: '', online: false, lastActive: 0 },
      agent4: { name: '', online: false, lastActive: 0 },
      agent5: { name: '', online: false, lastActive: 0 },
    },
    agent1Data: createInitialGenericAgentData(),
    agent2Data: createInitialGenericAgentData(),
    agent3Data: createInitialGenericAgentData(),
    agent4Data: createInitialGenericAgentData(),
    agent5Data: createInitialGenericAgentData(),
    simulationParams: {
      pollutantLevel: 68,
      bioremediatorDose: 40,
      reactorTemp: 27,
      aerationRate: 5.5,
    },
    simulationTrials: [],
    status: 'active',
    webhookUrl: config.webhookUrl || '',
  };
}

function broadcastToRoom(roomId: string, data: RoomData) {
  const clients = sseClients.get(roomId);
  if (!clients) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
      clients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // --- LKM CONFIG ROUTES (PORTAL GURU) ---

  // Get all LKM configs
  app.get('/api/lkm', (_req: Request, res: Response) => {
    res.json({
      configs: Array.from(lkmConfigs.values()),
    });
  });

  // Get specific LKM config by PIN
  app.get('/api/lkm/:pin', (req: Request, res: Response) => {
    const pin = (req.params.pin || '').trim().toUpperCase();
    if (lkmConfigs.has(pin)) {
      return res.json({ success: true, config: lkmConfigs.get(pin) });
    }
    return res.status(404).json({ success: false, error: `Kode LKM "${pin}" tidak ditemukan.` });
  });

  // Create or update LKM config
  app.post('/api/lkm', (req: Request, res: Response) => {
    const body = req.body;
    let pin = (body.pin || '').trim().toUpperCase();

    if (!pin) {
      const prefix = body.subject ? body.subject.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PET') : 'PET';
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      pin = `${prefix}-${randomNum}`;
    }

    const agentCount = (body.agentCount === 4 || body.agentCount === 5 ? body.agentCount : 3) as 3 | 4 | 5;

    const config: LkmConfig = {
      pin,
      title: body.title || 'Eksplorasi Matematika & Pemecahan Masalah',
      subject: body.subject || 'Matematika',
      topic: body.topic || 'Pemodelan Aljabar & Analisis Matematis',
      grade: body.grade || 'SMA Kelas 11',
      timerMinutes: Math.max(5, Math.min(180, parseInt(body.timerMinutes, 10) || 25)),
      agentCount,
      storyBriefing: body.storyBriefing || 'Misi eksplorasi matematika kolaboratif memecahkan tantangan kontekstual nyata!',
      storyBriefingImage: body.storyBriefingImage || undefined,
      clues: body.clues || [
        { title: 'Petunjuk 1: Model Masalah', badge: 'MODEL MATEMATIKA', content: 'Pelajari persamaan dan besaran variabel.' },
        { title: 'Petunjuk 2: Metode Perhitungan', badge: 'RUMUS & OPERASI', content: 'Terapkan konsep aljabar dan algoritma matematis.' },
        { title: 'Petunjuk 3: Verifikasi Solusi', badge: 'VALIDASI', content: 'Cek kesesuaian solusi dengan fakta kasus nyata.' },
      ],
      agentTasks: body.agentTasks || templateMat3.agentTasks,
      webhookUrl: body.webhookUrl || '',
      createdAt: new Date().toISOString(),
    };

    lkmConfigs.set(pin, config);
    res.json({ success: true, config, pin });
  });

  // --- ROOM REAL-TIME COLLABORATION ROUTES (PORTAL SISWA) ---

  // Get room data
  app.get('/api/rooms/:roomId', (req: Request, res: Response) => {
    const roomId = (req.params.roomId || 'DEFAULT').toUpperCase();
    const pin = (req.query.pin as string)?.toUpperCase();

    if (!rooms.has(roomId)) {
      const config = (pin && lkmConfigs.get(pin)) || lkmConfigs.get('MAT-2088') || defaultLkmTemplates[0];
      rooms.set(roomId, createRoomFromConfig(roomId, config));
    }
    res.json(rooms.get(roomId));
  });

  // Update room state
  app.post('/api/rooms/:roomId/update', (req: Request, res: Response) => {
    const roomId = (req.params.roomId || 'DEFAULT').toUpperCase();
    const pin = req.body.lkmPin?.toUpperCase();
    const defaultConfig = (pin && lkmConfigs.get(pin)) || lkmConfigs.get('MAT-2088') || defaultLkmTemplates[0];
    const existing = rooms.get(roomId) || createRoomFromConfig(roomId, defaultConfig);

    const updated: RoomData = {
      ...existing,
      ...req.body,
      roomId,
      updatedAt: Date.now(),
      members: {
        ...existing.members,
        ...(req.body.members || {}),
      },
      agent1Data: {
        ...existing.agent1Data,
        ...(req.body.agent1Data || {}),
      },
      agent2Data: {
        ...existing.agent2Data,
        ...(req.body.agent2Data || {}),
      },
      agent3Data: {
        ...existing.agent3Data,
        ...(req.body.agent3Data || {}),
      },
      agent4Data: {
        ...existing.agent4Data,
        ...(req.body.agent4Data || {}),
      },
      agent5Data: {
        ...existing.agent5Data,
        ...(req.body.agent5Data || {}),
      },
    };

    rooms.set(roomId, updated);
    broadcastToRoom(roomId, updated);
    res.json({ success: true, room: updated });
  });

  // Heartbeat / Presence
  app.post('/api/rooms/:roomId/heartbeat', (req: Request, res: Response) => {
    const roomId = (req.params.roomId || 'DEFAULT').toUpperCase();
    const { role, name } = req.body;
    const room = rooms.get(roomId) || createRoomFromConfig(roomId, defaultLkmTemplates[0]);

    if (role && ['agent1', 'agent2', 'agent3', 'agent4', 'agent5'].includes(role)) {
      const agentRole = role as AgentRole;
      room.members[agentRole] = {
        name: name || room.members[agentRole]?.name || '',
        online: true,
        lastActive: Date.now(),
      };
      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      broadcastToRoom(roomId, room);
    }
    res.json({ success: true });
  });

  // Server-Sent Events (SSE) stream for real-time collaboration
  app.get('/api/rooms/:roomId/events', (req: Request, res: Response) => {
    const roomId = (req.params.roomId || 'DEFAULT').toUpperCase();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    if (!sseClients.has(roomId)) {
      sseClients.set(roomId, new Set());
    }
    sseClients.get(roomId)!.add(res);

    const room = rooms.get(roomId) || createRoomFromConfig(roomId, defaultLkmTemplates[0]);
    rooms.set(roomId, room);
    res.write(`data: ${JSON.stringify(room)}\n\n`);

    req.on('close', () => {
      const roomClients = sseClients.get(roomId);
      if (roomClients) {
        roomClients.delete(res);
        if (roomClients.size === 0) {
          sseClients.delete(roomId);
        }
      }
    });
  });

  // Submit mission
  app.post('/api/rooms/:roomId/submit', async (req: Request, res: Response) => {
    const roomId = (req.params.roomId || 'DEFAULT').toUpperCase();
    const room = rooms.get(roomId) || createRoomFromConfig(roomId, defaultLkmTemplates[0]);
    const { submissionData, webhookUrl } = req.body;

    const mergedData: RoomData = {
      ...room,
      ...(submissionData || {}),
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      webhookUrl: webhookUrl || room.webhookUrl,
    };

    const agentCount = mergedData.agentCount || 3;

    // Auto-calculate score based on answer keys
    let autoGradedCount = 0;
    let correctCount = 0;
    let totalQuestions = 0;
    let answeredCount = 0;

    const cfg = mergedData.lkmConfig;
    const agentRolesList: AgentRole[] = ['agent1', 'agent2', 'agent3', 'agent4', 'agent5'];
    const activeRoles = agentRolesList.slice(0, agentCount);

    activeRoles.forEach((role) => {
      const task = cfg?.agentTasks?.[role];
      const roleAnswers = (mergedData[`${role}Data` as keyof RoomData] as any)?.answers || {};
      const questions = task?.questions || [];

      questions.forEach((q: any) => {
        totalQuestions++;
        const studentAns = roleAnswers[q.id];
        const hasAnswer = studentAns !== undefined && studentAns !== null && (
          Array.isArray(studentAns) ? studentAns.length > 0 : String(studentAns).trim() !== ''
        );
        if (hasAnswer) answeredCount++;

        const hasKey = q.correctAnswer !== undefined && q.correctAnswer !== null && (
          Array.isArray(q.correctAnswer) ? q.correctAnswer.length > 0 : String(q.correctAnswer).trim() !== ''
        );

        if (hasKey) {
          autoGradedCount++;
          if (q.type === 'multiple_choice') {
            if (String(studentAns || '').trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
              correctCount++;
            }
          } else if (q.type === 'checkbox') {
            const exp: string[] = Array.isArray(q.correctAnswer) ? q.correctAnswer : [String(q.correctAnswer)];
            const act: string[] = Array.isArray(studentAns) ? studentAns : studentAns ? [String(studentAns)] : [];
            const setExp = new Set<string>(exp.map((s: string) => String(s).trim().toLowerCase()));
            const setAct = new Set<string>(act.map((s: string) => String(s).trim().toLowerCase()));
            let match = setExp.size === setAct.size;
            if (match) {
              setExp.forEach((it) => {
                if (!setAct.has(it)) match = false;
              });
            }
            if (match && setExp.size > 0) correctCount++;
          } else {
            const exp = String(q.correctAnswer).trim().toLowerCase();
            const act = String(studentAns || '').trim().toLowerCase();
            if (exp && act && act.includes(exp)) correctCount++;
          }
        }
      });
    });

    let score = 75;
    if (autoGradedCount > 0) {
      const autoScorePart = (correctCount / autoGradedCount) * 70;
      const completionPart = totalQuestions > 0 ? (answeredCount / totalQuestions) * 20 : 15;
      score = Math.round(autoScorePart + completionPart + 10);
    } else {
      const completionPart = totalQuestions > 0 ? (answeredCount / totalQuestions) * 85 : 75;
      score = Math.round(completionPart + 15);
    }

    const timeRemainingSecs = mergedData.timerRemainingSeconds || 0;
    if (timeRemainingSecs > 180) score = Math.min(100, score + 5);
    score = Math.max(10, Math.min(100, score));

    mergedData.submissionScore = score;
    rooms.set(roomId, mergedData);
    broadcastToRoom(roomId, mergedData);

    const minutes = Math.floor(timeRemainingSecs / 60);
    const seconds = timeRemainingSecs % 60;
    const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const record: SubmissionRecord = {
      id: `SUB-${Date.now().toString(36).toUpperCase()}`,
      roomId,
      teamName: mergedData.teamName,
      submittedAt: new Date().toLocaleString('id-ID'),
      timeRemainingFormatted: timeFormatted,
      secondsRemaining: timeRemainingSecs,
      score,
      members: {
        agent1: mergedData.members.agent1?.name || '-',
        agent2: mergedData.members.agent2?.name || '-',
        agent3: mergedData.members.agent3?.name || '-',
        agent4: mergedData.members.agent4?.name || '-',
        agent5: mergedData.members.agent5?.name || '-',
      },
      dossierSummary: {
        criticalFindings: JSON.stringify(mergedData.agent1Data.answers || {}),
        simulationRecoveryRate: JSON.stringify(mergedData.agent2Data.answers || {}),
        finalConclusion: JSON.stringify(mergedData.agent3Data.answers || {}),
        agentCount,
      },
      fullData: mergedData,
      webhookStatus: 'not_configured',
    };

    if (webhookUrl && typeof webhookUrl === 'string' && webhookUrl.startsWith('http')) {
      try {
        const sheetPayload = {
          timestamp: new Date().toISOString(),
          kelompok: mergedData.teamName,
          kode_ruang: roomId,
          pin_lkm: mergedData.lkmPin || '-',
          mata_pelajaran: mergedData.subject,
          topik: mergedData.topic,
          jenjang: mergedData.grade,
          jumlah_agen: agentCount,
          anggota: {
            agen1: mergedData.members.agent1?.name || '',
            agen2: mergedData.members.agent2?.name || '',
            agen3: mergedData.members.agent3?.name || '',
            agen4: mergedData.members.agent4?.name || '',
            agen5: mergedData.members.agent5?.name || '',
          },
          skor_misi: score,
          sisa_waktu: timeFormatted,
          jawaban_kelompok: {
            agen1: mergedData.agent1Data.answers || {},
            agen2: mergedData.agent2Data.answers || {},
            agen3: mergedData.agent3Data.answers || {},
            agen4: mergedData.agent4Data.answers || {},
            agen5: mergedData.agent5Data.answers || {},
          },
        };

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sheetPayload),
        });

        if (response.ok) {
          record.webhookStatus = 'sent';
        } else {
          record.webhookStatus = 'failed';
          record.webhookError = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (err: any) {
        record.webhookStatus = 'failed';
        record.webhookError = err.message || 'Network error';
      }
    }

    submissions.unshift(record);
    res.json({ success: true, score, record });
  });

  // Get all submissions (For Teacher Portal live rekap)
  app.get('/api/submissions', (_req: Request, res: Response) => {
    res.json({ submissions });
  });

  // Test webhook endpoint for teachers
  app.post('/api/test-webhook', async (req: Request, res: Response) => {
    const { webhookUrl } = req.body;
    if (!webhookUrl || typeof webhookUrl !== 'string') {
      return res.status(400).json({ success: false, message: 'URL Webhook Google Sheets diperlukan.' });
    }

    try {
      const testPayload = {
        timestamp: new Date().toISOString(),
        kelompok: 'UJI-KONEKSI-GURU',
        kode_ruang: 'TEST-00',
        pin_lkm: 'DEMO-PIN',
        mata_pelajaran: 'Uji Sistem',
        topik: 'Tes Integrasi Google Apps Script',
        jenjang: 'SMP/SMA',
        jumlah_agen: 3,
        anggota: {
          agen1: 'Pencari Fakta (Tes)',
          agen2: 'Penguji Coba (Tes)',
          agen3: 'Pembuat Rencana (Tes)',
        },
        skor_misi: 100,
        sisa_waktu: '25:00',
        jawaban_kelompok: {
          status: 'Integrasi Berhasil Terhubung Sempurna! ✨',
        },
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        return res.json({ success: true, message: 'Koneksi ke Google Sheets berhasil diuji!' });
      } else {
        return res.status(400).json({ success: false, message: `Google Sheets merespon status: ${response.status}` });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, message: `Gagal mengirim ke webhook: ${err.message}` });
    }
  });

  // Mount Vite development middlewares
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LKM SERVER] Server berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[LKM SERVER ERROR]', err);
});
