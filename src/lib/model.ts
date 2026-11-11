export type RoleType = 'coordinator' | 'collaborator';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  roleType: RoleType;
  title: string;
  avatar: string;
  avatarBg: string;
}

export interface SquishRecord {
  id: string;
  userId: string;
  userName: string;
  day: string; // YYYY-MM-DD
  time: string; // HH:mm
  timestamp: number;
  anonymousSent: boolean;
}

export interface TeamNotice {
  id: string;
  title: string;
  body: string;
  type: 'ajuste' | 'alerta' | 'info';
  category?: string;
  createdAt: string;
  readBy: string[];
  fromName: string;
}

export interface CoordinatorAlert {
  id: string;
  type: 'single' | 'collective';
  title: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'attended';
  notifiedCount?: number;
}

export interface UsabilityLog {
  id: string;
  timestamp: string;
  event: string;
  details: string;
  actor: string;
}

export interface SquizzeStore {
  teamName: string;
  selectedMemberIds: string[];
  coordinatorSetupDone: boolean;
  coordinatorAcceptedPrivacy: boolean;
  records: SquishRecord[];
  notices: TeamNotice[];
  alerts: CoordinatorAlert[];
  usabilityLogs: UsabilityLog[];
}

export const USERS: UserProfile[] = [
  {
    id: 'miguel',
    name: 'Miguel',
    email: 'miguel@empresa.com',
    roleType: 'coordinator',
    title: 'Coordinador de Equipo',
    avatar: 'M',
    avatarBg: '#5D131B',
  },
  {
    id: 'laura',
    name: 'Laura',
    email: 'laura@empresa.com',
    roleType: 'collaborator',
    title: 'Diseñadora UX / Colaboradora',
    avatar: 'L',
    avatarBg: '#C8A597',
  },
  {
    id: 'valentina',
    name: 'Valentina',
    email: 'valentina@empresa.com',
    roleType: 'collaborator',
    title: 'Desarrolladora Frontend',
    avatar: 'V',
    avatarBg: '#B5BEDD',
  },
  {
    id: 'andres',
    name: 'Andrés',
    email: 'andres@empresa.com',
    roleType: 'collaborator',
    title: 'Diseñador UI / Visual',
    avatar: 'A',
    avatarBg: '#F5DABF',
  },
  {
    id: 'camila',
    name: 'Camila',
    email: 'camila@empresa.com',
    roleType: 'collaborator',
    title: 'Especialista de Producto',
    avatar: 'C',
    avatarBg: '#E8C5BE',
  },
  {
    id: 'santiago',
    name: 'Santiago',
    email: 'santiago@empresa.com',
    roleType: 'collaborator',
    title: 'Investigador UX',
    avatar: 'S',
    avatarBg: '#CCD2E3',
  },
];

export const STORE_KEY = 'squizze-ecosistemas-v2';
export const SYNC_CHANNEL = 'squizze-sync-channel';

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatTimeNow(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function getDayNameSpanish(dayStr: string): string {
  const [year, month, day] = dayStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return names[date.getDay()];
}

// Generates baseline realistic past records for Mon-Fri so charts match Figma
export function generateBaseHistoricalRecords(): SquishRecord[] {
  const now = new Date();
  // Find current week Monday
  const dayOfWeek = now.getDay(); // 0 is Sunday
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);

  const records: SquishRecord[] = [];
  // Sample distribution from Figma Image 11: Mon: 1, Tues: 4, Wed: 6, Thur: 2, Fri: 1
  const distribution = [
    { offset: 0, count: 1 }, // Mon
    { offset: 1, count: 4 }, // Tue
    { offset: 2, count: 6 }, // Wed
    { offset: 3, count: 2 }, // Thu
    { offset: 4, count: 1 }, // Fri
  ];

  const pool = ['laura', 'valentina', 'andres', 'camila', 'miguel'];

  distribution.forEach(({ offset, count }) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + offset);
    const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    // Only generate if dayKey is not today (today starts clean or with current squishes)
    if (dayKey !== getTodayKey()) {
      for (let i = 0; i < count; i++) {
        const user = USERS.find(u => u.id === pool[i % pool.length]) || USERS[1];
        records.push({
          id: `hist-${dayKey}-${i}`,
          userId: user.id,
          userName: user.name,
          day: dayKey,
          time: `1${i + 0}:30`,
          timestamp: d.getTime() + i * 3600000,
          anonymousSent: true,
        });
      }
    }
  });

  return records;
}

export const initialStore: SquizzeStore = {
  teamName: 'Equipo Creativo',
  selectedMemberIds: ['laura', 'valentina', 'andres', 'camila', 'santiago'],
  coordinatorSetupDone: true,
  coordinatorAcceptedPrivacy: true,
  records: generateBaseHistoricalRecords(),
  notices: [
    {
      id: 'notice-base-1',
      title: 'Bloque de concentración activo',
      body: 'Hoy reservamos un bloque sin reuniones entre las 2:00 PM y 4:00 PM para avanzar en prioridades.',
      type: 'ajuste',
      category: 'Proteger tiempo de concentración',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      readBy: [],
      fromName: 'Miguel',
    },
  ],
  alerts: [],
  usabilityLogs: [
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString('es-CO'),
      event: 'Sistema inicializado',
      details: 'Ambiente de prueba configurado con dos roles y soporte de tiempo real.',
      actor: 'Sistema',
    },
  ],
};
