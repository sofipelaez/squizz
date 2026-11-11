'use client';

import {
  SquizzeStore,
  STORE_KEY,
  SYNC_CHANNEL,
  initialStore,
  getTodayKey,
  formatTimeNow,
  USERS,
  SquishRecord,
  CoordinatorAlert,
  TeamNotice,
  UsabilityLog,
} from './model';

export function loadStore(): SquizzeStore {
  if (typeof window === 'undefined') return initialStore;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      saveStore(initialStore, false);
      return initialStore;
    }
    const parsed = JSON.parse(raw) as SquizzeStore;
    // ensure required fields exist
    return {
      ...initialStore,
      ...parsed,
      records: parsed.records || [],
      notices: parsed.notices || [],
      alerts: parsed.alerts || [],
      usabilityLogs: parsed.usabilityLogs || [],
    };
  } catch (err) {
    console.error('Error loading store:', err);
    return initialStore;
  }
}

export function saveStore(store: SquizzeStore, broadcast = true): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    if (broadcast && typeof window.BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(SYNC_CHANNEL);
      bc.postMessage({ type: 'STORE_UPDATED', timestamp: Date.now() });
      bc.close();
    }
  } catch (err) {
    console.error('Error saving store:', err);
  }
}

export function logUsabilityEvent(
  store: SquizzeStore,
  event: string,
  details: string,
  actor: string
): SquizzeStore {
  const newLog: UsabilityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toLocaleTimeString('es-CO'),
    event,
    details,
    actor,
  };
  return {
    ...store,
    usabilityLogs: [newLog, ...store.usabilityLogs].slice(0, 50),
  };
}

export function registerSquish(
  store: SquizzeStore,
  userId: string
): { updatedStore: SquizzeStore; newCount: number; reachedFifth: boolean } {
  const today = getTodayKey();
  const user = USERS.find((u) => u.id === userId) || USERS[1];
  const userTodayRecords = store.records.filter((r) => r.userId === userId && r.day === today);

  if (userTodayRecords.length >= 5) {
    return { updatedStore: store, newCount: 5, reachedFifth: false };
  }

  const newRecord: SquishRecord = {
    id: `squish-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    userId,
    userName: user.name,
    day: today,
    time: formatTimeNow(),
    timestamp: Date.now(),
    anonymousSent: false,
  };

  const newCount = userTodayRecords.length + 1;
  const reachedFifth = newCount === 5;

  let alerts = [...store.alerts];

  // Regla solicitada: "CUANDO UN COLABORADOR HAGA SQUICHAZO LE LLEGUE A MIGUEL LA NOTIFICACION"
  // Creamos alerta individual anónima (sin revelar identidad)
  const singleNoticeAlert: CoordinatorAlert = {
    id: `alert-${Date.now()}`,
    type: 'single',
    title: 'Señal de ritmo registrada',
    message: 'Un integrante de tu equipo apretó su Squishy.',
    timestamp: formatTimeNow(),
    status: 'pending',
  };
  alerts = [singleNoticeAlert, ...alerts];

  let nextStore: SquizzeStore = {
    ...store,
    records: [...store.records, newRecord],
    alerts,
  };

  nextStore = logUsabilityEvent(
    nextStore,
    'Squishazo registrado',
    `${user.name} registró su squishazo #${newCount} de hoy.`,
    user.name
  );

  saveStore(nextStore);
  return { updatedStore: nextStore, newCount, reachedFifth };
}

export function sendAnonymousSignal(
  store: SquizzeStore,
  userId: string
): SquizzeStore {
  const today = getTodayKey();
  const user = USERS.find((u) => u.id === userId) || USERS[1];

  // Marcar el registro como anonymousSent
  const records = store.records.map((r) =>
    r.userId === userId && r.day === today ? { ...r, anonymousSent: true } : r
  );

  // Evaluar estado colectivo del equipo
  const teamMemberIds = store.selectedMemberIds;
  const membersWithFive = teamMemberIds.filter((mId) => {
    const mRecords = records.filter((r) => r.userId === mId && r.day === today);
    return mRecords.length >= 5;
  });

  const isCollectiveThreshold = membersWithFive.length >= Math.ceil(teamMemberIds.length / 2);
  const isAllMembers = membersWithFive.length >= teamMemberIds.length;

  let alerts = [...store.alerts];

  // Alerta de límite individual alcanzado (anónimo)
  const individualAlert: CoordinatorAlert = {
    id: `alert-5th-${Date.now()}`,
    type: 'single',
    title: 'Límite de squishazos alcanzado',
    message: 'Una persona de tu equipo llegó a 5 squishazos hoy y envió su señal anónima.',
    timestamp: formatTimeNow(),
    status: 'pending',
  };
  alerts = [individualAlert, ...alerts];

  // Si se cumple la condición colectiva (la mitad o todo el equipo)
  if (isCollectiveThreshold || isAllMembers) {
    const collectiveAlert: CoordinatorAlert = {
      id: `alert-collective-${Date.now()}`,
      type: 'collective',
      title: isAllMembers ? '¡Todo el equipo en sobrecarga!' : 'Tu equipo necesita ayuda',
      message: isAllMembers
        ? 'Todos los integrantes del equipo alcanzaron 5 squishazos hoy. Se requieren ajustes organizativos.'
        : `${membersWithFive.length} de ${teamMemberIds.length} integrantes alcanzaron el límite de squishazos hoy.`,
      timestamp: formatTimeNow(),
      status: 'pending',
      notifiedCount: membersWithFive.length,
    };
    alerts = [collectiveAlert, ...alerts];
  }

  let nextStore: SquizzeStore = {
    ...store,
    records,
    alerts,
  };

  nextStore = logUsabilityEvent(
    nextStore,
    'Señal anónima enviada',
    `Una colaboradora envió su señal anónima al coordinador. Integrantes en límite hoy: ${membersWithFive.length}/${teamMemberIds.length}`,
    'Colaborador (Anónimo)'
  );

  saveStore(nextStore);
  return nextStore;
}

export function createAdjustmentNotice(
  store: SquizzeStore,
  adjustmentTitle: string,
  adjustmentBody: string,
  category: string
): SquizzeStore {
  const newNotice: TeamNotice = {
    id: `notice-${Date.now()}`,
    title: adjustmentTitle,
    body: adjustmentBody,
    type: 'ajuste',
    category,
    createdAt: new Date().toISOString(),
    readBy: [],
    fromName: 'Miguel (Coordinador)',
  };

  // Marcar alertas pendientes como atendidas
  const alerts = store.alerts.map((a) => ({
    ...a,
    status: 'attended' as const,
  }));

  let nextStore: SquizzeStore = {
    ...store,
    notices: [newNotice, ...store.notices],
    alerts,
  };

  nextStore = logUsabilityEvent(
    nextStore,
    'Ajuste organizativo comunicado',
    `Miguel envió el ajuste "${adjustmentTitle}" a todo el equipo.`,
    'Miguel'
  );

  saveStore(nextStore);
  return nextStore;
}

export function markNoticeAsRead(
  store: SquizzeStore,
  noticeId: string,
  userId: string
): SquizzeStore {
  const notices = store.notices.map((n) => {
    if (n.id === noticeId && !n.readBy.includes(userId)) {
      return { ...n, readBy: [...n.readBy, userId] };
    }
    return n;
  });

  const nextStore = { ...store, notices };
  saveStore(nextStore);
  return nextStore;
}

export function resetTodayCounts(store: SquizzeStore): SquizzeStore {
  const today = getTodayKey();
  const records = store.records.filter((r) => r.day !== today);
  const alerts = store.alerts.filter((a) => !a.title.includes('hoy'));

  let nextStore: SquizzeStore = {
    ...store,
    records,
    alerts,
  };

  nextStore = logUsabilityEvent(
    nextStore,
    'Contadores de hoy reiniciados',
    'Se restablecieron los squishazos de la fecha actual a cero.',
    'Investigador'
  );

  saveStore(nextStore);
  return nextStore;
}

export function resetFactoryDemo(store: SquizzeStore): SquizzeStore {
  saveStore(initialStore);
  return initialStore;
}
