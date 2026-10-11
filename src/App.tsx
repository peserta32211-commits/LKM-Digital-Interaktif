import { templateMat3, defaultMathTemplates } from './constants/defaultMathTemplates';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeaderHUD } from './components/HeaderHUD';
import { LandingSetup } from './components/LandingSetup';
import { TeacherLkmGenerator } from './components/TeacherLkmGenerator';
import { StoryBriefing } from './components/StoryBriefing';
import { DynamicAgentWorksheet } from './components/DynamicAgentWorksheet';
import { SubmitMissionModal } from './components/SubmitMissionModal';
import { TeacherGuideModal } from './components/TeacherGuideModal';
import { DanauCerminCartoonBackground } from './components/MascotIcons';
import { AgentRole, LkmConfig, RoomData, SimulationTrial, SubmissionRecord } from './types';
import { sounds } from './services/soundEffects';

const DEFAULT_ROOM_ID = 'RUANG-01';

const defaultFallbackLkm: LkmConfig = templateMat3;

const getInitialRoom = (roomId: string, lkm: LkmConfig): RoomData => ({
  roomId,
  teamName: 'Tim Matematikawan 01',
  subject: lkm.subject,
  topic: lkm.topic,
  grade: lkm.grade,
  timerDurationSeconds: (lkm.timerMinutes || 25) * 60,
  timerRemainingSeconds: (lkm.timerMinutes || 25) * 60,
  timerRunning: false,
  updatedAt: Date.now(),
  agentCount: lkm.agentCount || 3,
  lkmPin: lkm.pin,
  lkmConfig: lkm,
  members: {
    agent1: { name: '', online: false, lastActive: 0 },
    agent2: { name: '', online: false, lastActive: 0 },
    agent3: { name: '', online: false, lastActive: 0 },
    agent4: { name: '', online: false, lastActive: 0 },
    agent5: { name: '', online: false, lastActive: 0 },
  },
  agent1Data: { answers: {}, completed: false },
  agent2Data: { answers: {}, completed: false },
  agent3Data: { answers: {}, completed: false },
  agent4Data: { answers: {}, completed: false },
  agent5Data: { answers: {}, completed: false },
  simulationParams: {
    pollutantLevel: 68,
    bioremediatorDose: 40,
    reactorTemp: 27,
    aerationRate: 5.5,
  },
  simulationTrials: [],
  status: 'active',
  webhookUrl: lkm.webhookUrl || '',
});

export default function App() {
  const [activeModule, setActiveModule] = useState<'student' | 'teacher'>('student');
  const [activeLkm, setActiveLkm] = useState<LkmConfig>(defaultFallbackLkm);
  const [availableLkms, setAvailableLkms] = useState<LkmConfig[]>([defaultFallbackLkm]);

  const [roomId, setRoomId] = useState<string>(() => {
    return localStorage.getItem('lkm_active_room') || DEFAULT_ROOM_ID;
  });
  const [currentRole, setCurrentRole] = useState<AgentRole>(() => {
    return (localStorage.getItem('lkm_active_role') as AgentRole) || 'agent1';
  });
  const [activeTabRole, setActiveTabRole] = useState<AgentRole>('agent1');
  const [isJoined, setIsJoined] = useState<boolean>(() => {
    return localStorage.getItem('lkm_is_joined') === 'true';
  });

  const [room, setRoom] = useState<RoomData>(() => getInitialRoom(roomId, defaultFallbackLkm));
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTeacherGuide, setShowTeacherGuide] = useState(false);
  const autoSubmittedRef = useRef(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Check URL Direct Link param on initial boot: ?pin=KODE
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const pinParam = searchParams.get('pin');
      if (pinParam) {
        const cleanedPin = pinParam.trim().toUpperCase();
        fetch(`/api/lkm/${cleanedPin}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.config) {
              setActiveLkm(data.config);
              setRoom((prev) => ({
                ...prev,
                lkmPin: data.config.pin,
                lkmConfig: data.config,
                agentCount: data.config.agentCount || prev.agentCount,
              }));
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  // Load available LKMs
  const loadAvailableLkms = async () => {
    try {
      const res = await fetch('/api/lkm');
      if (res.ok) {
        const json = await res.json();
        if (json.configs && json.configs.length > 0) {
          setAvailableLkms(json.configs);
          const found = json.configs.find((c: LkmConfig) => c.pin === activeLkm.pin) || json.configs[0];
          setActiveLkm(found);
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadAvailableLkms();
  }, []);

  // BroadcastChannel for cross-tab sync
  useEffect(() => {
    try {
      const channel = new BroadcastChannel(`lkm_channel_${roomId}`);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'ROOM_UPDATE') {
          setRoom((prev) => ({
            ...prev,
            ...event.data.room,
          }));
        }
      };

      return () => {
        channel.close();
      };
    } catch {}
  }, [roomId]);

  // Connect to SSE stream
  useEffect(() => {
    if (!roomId) return;

    fetch(`/api/rooms/${roomId}?pin=${activeLkm.pin}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.roomId) {
          setRoom(data);
          if (data.lkmConfig) {
            setActiveLkm(data.lkmConfig);
          }
        }
      })
      .catch(() => {});

    try {
      const es = new EventSource(`/api/rooms/${roomId}/events`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const incomingRoom: RoomData = JSON.parse(event.data);
          if (incomingRoom && incomingRoom.roomId === roomId) {
            setRoom((prev) => ({
              ...prev,
              ...incomingRoom,
            }));
            if (incomingRoom.lkmConfig) {
              setActiveLkm(incomingRoom.lkmConfig);
            }
          }
        } catch {}
      };

      return () => {
        es.close();
      };
    } catch {}
  }, [roomId, activeLkm.pin]);

  // Heartbeat presence
  useEffect(() => {
    if (!isJoined || !roomId || !currentRole) return;

    const memberName = room.members[currentRole]?.name || '';

    const sendHeartbeat = () => {
      fetch(`/api/rooms/${roomId}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: currentRole,
          name: memberName,
        }),
      }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [isJoined, roomId, currentRole, room.members]);

  // Push updates to server
  const syncRoomUpdate = useCallback(
    (updatedFields: Partial<RoomData>) => {
      const updatedRoom: RoomData = {
        ...room,
        ...updatedFields,
        updatedAt: Date.now(),
      };

      setRoom(updatedRoom);

      // Local cross-tab sync
      try {
        broadcastChannelRef.current?.postMessage({
          type: 'ROOM_UPDATE',
          room: updatedRoom,
        });
      } catch {}

      // Debounce server push
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        fetch(`/api/rooms/${roomId}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...updatedFields,
            lkmPin: activeLkm.pin,
          }),
        }).catch(() => {});
      }, 350);
    },
    [room, roomId, activeLkm.pin]
  );

  // Submit mission to backend
  const handleSubmitMissionToBackend = useCallback(
    async (webhookUrl: string): Promise<SubmissionRecord | null> => {
      try {
        const res = await fetch(`/api/rooms/${roomId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionData: room,
            webhookUrl,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          // Update room to submitted & locked
          setRoom((prev) => ({
            ...prev,
            status: 'submitted',
            timerRunning: false,
          }));
          return json.record;
        }
      } catch {}
      return null;
    },
    [roomId, room]
  );

  // Auto-Submit Handler when timer hits 00:00
  const triggerAutoSubmit = useCallback(async () => {
    if (autoSubmittedRef.current || room.status === 'submitted') return;
    autoSubmittedRef.current = true;
    sounds.playAlarm();

    const targetWebhook = room.webhookUrl || activeLkm.webhookUrl || localStorage.getItem('teacher_webhook_url') || '';

    // Lock local room state immediately
    setRoom((prev) => ({
      ...prev,
      timerRemainingSeconds: 0,
      timerRunning: false,
      status: 'submitted',
    }));

    // Trigger backend submit
    await handleSubmitMissionToBackend(targetWebhook);
    // Show submit modal with final recap
    setShowSubmitModal(true);
  }, [room.status, room.webhookUrl, activeLkm.webhookUrl, handleSubmitMissionToBackend]);

  // Countdown Timer with Auto-Submit feature on 00:00
  useEffect(() => {
    if (!room.timerRunning) return;

    const timer = setInterval(() => {
      setRoom((prev) => {
        if (prev.timerRemainingSeconds <= 1) {
          clearInterval(timer);
          // Trigger Auto-Submit when timer expires
          triggerAutoSubmit();
          return {
            ...prev,
            timerRemainingSeconds: 0,
            timerRunning: false,
            status: 'submitted',
          };
        }
        return {
          ...prev,
          timerRemainingSeconds: prev.timerRemainingSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [room.timerRunning, triggerAutoSubmit]);

  // Student PIN selection
  const handleSelectLkmPin = async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/lkm/${pin.trim().toUpperCase()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.config) {
          setActiveLkm(json.config);
          return true;
        }
      }
    } catch {}
    return false;
  };

  // Student starts mission
  const handleStartMission = (
    newTeamName: string,
    newRoomId: string,
    selectedRole: AgentRole,
    memberName: string,
    selectedLkm: LkmConfig
  ) => {
    setRoomId(newRoomId);
    setCurrentRole(selectedRole);
    setActiveTabRole(selectedRole);
    setIsJoined(true);
    setActiveLkm(selectedLkm);
    autoSubmittedRef.current = false;

    localStorage.setItem('lkm_active_room', newRoomId);
    localStorage.setItem('lkm_active_role', selectedRole);
    localStorage.setItem('lkm_is_joined', 'true');

    const updatedMembers = {
      ...room.members,
      [selectedRole]: {
        name: memberName,
        online: true,
        lastActive: Date.now(),
      },
    };

    syncRoomUpdate({
      teamName: newTeamName,
      roomId: newRoomId,
      agentCount: selectedLkm.agentCount || 3,
      lkmPin: selectedLkm.pin,
      lkmConfig: selectedLkm,
      members: updatedMembers,
      timerRunning: true,
      timerDurationSeconds: (selectedLkm.timerMinutes || 25) * 60,
      timerRemainingSeconds: (selectedLkm.timerMinutes || 25) * 60,
      status: 'active',
    });
  };

  // Update answers for any agent
  const handleUpdateAnswers = (role: AgentRole, answers: Record<string, any>, completed?: boolean) => {
    const key = `${role}Data` as keyof RoomData;
    const current = (room[key] as any) || {};
    const updated = {
      ...current,
      answers,
      completed: completed !== undefined ? completed : current.completed,
    };
    syncRoomUpdate({ [key]: updated });
  };

  // Simulation handlers
  const handleUpdateSimParams = (params: any) => {
    syncRoomUpdate({
      simulationParams: {
        ...(room.simulationParams || {}),
        ...params,
      },
    });
  };

  const handleAddSimTrial = (trial: SimulationTrial) => {
    const currentTrials = room.simulationTrials || [];
    syncRoomUpdate({
      simulationTrials: [trial, ...currentTrials],
    });
  };

  const handleClearSimTrials = () => {
    syncRoomUpdate({ simulationTrials: [] });
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    sounds.playClick();
  };

  // Teacher selects Lkm from generator to test in student portal
  const handleSelectLkmForStudent = (config: LkmConfig) => {
    setActiveLkm(config);
    setActiveModule('student');
    setIsJoined(false);
  };

  // If in Teacher Portal Module
  if (activeModule === 'teacher') {
    return (
      <>
        <TeacherLkmGenerator
          onSelectLkmForStudent={handleSelectLkmForStudent}
          onOpenTeacherGuide={() => setShowTeacherGuide(true)}
          onBackToStudentPortal={() => setActiveModule('student')}
        />
        {showTeacherGuide && (
          <TeacherGuideModal onClose={() => setShowTeacherGuide(false)} />
        )}
      </>
    );
  }

  // If in Student Portal & Not Joined yet -> Show Landing Page
  if (!isJoined) {
    return (
      <>
        <LandingSetup
          room={room}
          activeLkm={activeLkm}
          availableLkms={availableLkms}
          onSelectLkmPin={handleSelectLkmPin}
          onStartMission={handleStartMission}
          onOpenTeacherGenerator={() => setActiveModule('teacher')}
          onOpenTeacherGuide={() => setShowTeacherGuide(true)}
        />
        {showTeacherGuide && (
          <TeacherGuideModal onClose={() => setShowTeacherGuide(false)} />
        )}
      </>
    );
  }

  // Active Student Mission View
  const currentTaskConfig = activeLkm.agentTasks?.[activeTabRole] || defaultFallbackLkm.agentTasks.agent1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-teal-50 to-emerald-50 text-slate-800 flex flex-col relative">
      <DanauCerminCartoonBackground />

      {/* Header HUD with Timer, SEMUA SINKRON!, & Progress Bar (e.g. 3 dari 4 Soal Terisi) */}
      <HeaderHUD
        room={room}
        currentRole={activeTabRole}
        onSelectRole={(r) => {
          sounds.playClick();
          setActiveTabRole(r);
        }}
        onSubmitMission={() => {
          sounds.playClick();
          setShowSubmitModal(true);
        }}
        onOpenTeacherGuide={() => setShowTeacherGuide(true)}
        onOpenTeacherGenerator={() => setActiveModule('teacher')}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 grow w-full space-y-6 relative z-10">
        {/* Story Briefing with 3 Clues */}
        <StoryBriefing lkmConfig={activeLkm} />

        {/* Dynamic Agent Worksheet for the active role */}
        <DynamicAgentWorksheet
          role={activeTabRole}
          currentRole={currentRole}
          room={room}
          taskConfig={currentTaskConfig}
          member={room.members[activeTabRole] || { name: '', online: false, lastActive: 0 }}
          onUpdateAnswers={handleUpdateAnswers}
          onUpdateSimParams={handleUpdateSimParams}
          onAddSimTrial={handleAddSimTrial}
          onClearSimTrials={handleClearSimTrials}
        />
      </main>

      {/* Modals */}
      {showSubmitModal && (
        <SubmitMissionModal
          room={room}
          onClose={() => setShowSubmitModal(false)}
          onSubmitToBackend={handleSubmitMissionToBackend}
          onOpenTeacherGuide={() => setShowTeacherGuide(true)}
        />
      )}

      {showTeacherGuide && (
        <TeacherGuideModal onClose={() => setShowTeacherGuide(false)} />
      )}
    </div>
  );
}
