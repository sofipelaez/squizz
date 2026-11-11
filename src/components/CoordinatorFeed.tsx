'use client';

import React, { useState } from 'react';
import {
  UserProfile,
  SquizzeStore,
  getTodayKey,
  CoordinatorAlert,
  USERS,
} from '@/lib/model';
import {
  registerSquish,
  createAdjustmentNotice,
  resetTodayCounts,
} from '@/lib/store';
import { SquizzeLogo } from './SquizzeLogo';
import {
  Bell,
  Check,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  LayoutGrid,
  BarChart3,
  Settings,
  Users,
  LogOut,
  ChevronRight,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  Plus,
} from 'lucide-react';

interface CoordinatorFeedProps {
  currentUser: UserProfile;
  store: SquizzeStore;
  onUpdateStore: (next: SquizzeStore) => void;
  onNavigateTab: (tab: string) => void;
  activeTab: string;
  onLogout: () => void;
}

export function CoordinatorFeed({
  currentUser,
  store,
  onUpdateStore,
  onNavigateTab,
  activeTab,
  onLogout,
}: CoordinatorFeedProps) {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<string>(
    'Proteger tiempo de concentración'
  );
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [showSquishModal, setShowSquishModal] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const today = getTodayKey();

  // Miguel's personal squishes today
  const mySquishesToday = store.records.filter(
    (r) => r.userId === currentUser.id && r.day === today
  ).length;

  // Team records today
  const teamTodayRecords = store.records.filter((r) => r.day === today);

  // How many team members reached 5 squishes today
  const teamMemberIds = store.selectedMemberIds;
  const membersWithFive = teamMemberIds.filter((mId) => {
    return store.records.filter((r) => r.userId === mId && r.day === today).length >= 5;
  });

  // Collective state calculation
  const totalTeam = teamMemberIds.length;
  const isCollectiveAlert = membersWithFive.length >= Math.ceil(totalTeam / 2);
  const isAllOverwhelmed = membersWithFive.length >= totalTeam && totalTeam > 0;

  // Unattended pending alerts
  const pendingAlerts = store.alerts.filter((a) => a.status === 'pending');
  const hasPendingAlerts = pendingAlerts.length > 0;

  // Weekly report calculations (Mon-Fri)
  const daysOfWeek = [
    { label: 'Mon', dayOffset: 1 },
    { label: 'Tues', dayOffset: 2 },
    { label: 'Wed', dayOffset: 3 },
    { label: 'Thur', dayOffset: 4 },
    { label: 'Fri', dayOffset: 5 },
  ];

  // Map store records across days of current week
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const distToMon = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distToMon);

  const weeklyData = daysOfWeek.map((day, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const count = store.records.filter((r) => r.day === key).length;
    return {
      label: day.label,
      dateKey: key,
      count,
      isToday: key === today,
    };
  });

  const totalWeeklySquishes = weeklyData.reduce((acc, curr) => acc + curr.count, 0);
  const maxWeeklyCount = Math.max(...weeklyData.map((d) => d.count), 6);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRegisterMiguelSquish = () => {
    const { updatedStore, newCount } = registerSquish(store, currentUser.id);
    onUpdateStore(updatedStore);
    setShowSquishModal(false);
    triggerToast(`Squishazo registrado (${newCount}/5)`);
  };

  const handleConfirmAdjustment = () => {
    const adjustmentsMap: Record<string, string> = {
      'Proteger tiempo de concentración':
        'Hoy reservamos un bloque sin reuniones para que el equipo pueda avanzar en tareas prioritarias sin interrupciones.',
      'Reorganizar prioridades':
        'Pospusimos los entregables no urgentes de esta semana para equilibrar la carga laboral del equipo.',
      'Redistribuir tareas':
        'Reasignamos pendientes críticos de manera equitativa para aliviar los cuellos de botella.',
      'Reducir interrupciones':
        'Canalizaremos las consultas externas mediante un único punto de contacto hasta finalizar la jornada.',
      'Ajustar reuniones y seguimiento':
        'Redujimos las reuniones del día a 15 minutos y flexibilizamos los horarios de entrega.',
    };

    const nextStore = createAdjustmentNotice(
      store,
      selectedAdjustment,
      adjustmentsMap[selectedAdjustment] || 'Ajuste organizativo para acompañar al equipo.',
      selectedAdjustment
    );

    onUpdateStore(nextStore);
    setShowHelpModal(false);
    setShowThankYouModal(true);
  };

  return (
    <div className="app-workspace">
      {/* Left Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-logo-container">
          <SquizzeLogo variant="light" size="sm" />
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'Feed' ? 'active' : ''}`}
            onClick={() => onNavigateTab('Feed')}
          >
            <LayoutGrid size={16} />
            <span>Feed</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'Análisis' ? 'active' : ''}`}
            onClick={() => onNavigateTab('Análisis')}
          >
            <BarChart3 size={16} />
            <span>Análisis</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'Configuración' ? 'active' : ''}`}
            onClick={() => onNavigateTab('Configuración')}
          >
            <Settings size={16} />
            <span>Configuración</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'Equipo' ? 'active' : ''}`}
            onClick={() => onNavigateTab('Equipo')}
          >
            <Users size={16} />
            <span>Equipo</span>
          </button>
        </nav>

        <div className="sidebar-footer-profile">
          <div className="profile-pill-chip">
            <span className="profile-avatar-circle" style={{ background: currentUser.avatarBg }}>
              {currentUser.avatar}
            </span>
            <div className="profile-text-wrap">
              <span className="profile-user-name">{currentUser.name}</span>
              <span className="profile-user-role">Coordinador</span>
            </div>
            <button
              className="sidebar-logout-icon"
              title="Cerrar sesión"
              onClick={onLogout}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="app-main-pane">
        {/* Header Bar */}
        <header className="app-top-header">
          <div className="header-greeting-wrap">
            <h2 className="header-greeting-title">Buenos días, {currentUser.name}</h2>
            <span className="header-greeting-sub">¿Cómo va tu ritmo hoy?</span>
          </div>

          <div className="header-right-actions">
            {/* Notification Bell with Badge */}
            <div className="bell-wrapper">
              <button
                className={`header-bell-btn ${hasPendingAlerts ? 'has-badge' : ''}`}
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                title="Notificaciones del equipo"
              >
                <Bell size={18} />
                {hasPendingAlerts && <span className="bell-badge-count">{pendingAlerts.length}</span>}
              </button>

              {/* Dropdown de notificaciones anónimas */}
              {showNotificationsDropdown && (
                <div className="notifications-flyout-card">
                  <div className="flyout-header">
                    <h4>Notificaciones del equipo</h4>
                    <span className="flyout-privacy-tag">100% Anónimo</span>
                  </div>
                  <div className="flyout-list">
                    {store.alerts.length === 0 ? (
                      <p className="flyout-empty">No hay notificaciones registradas.</p>
                    ) : (
                      store.alerts.slice(0, 6).map((alt) => (
                        <div key={alt.id} className={`flyout-item ${alt.status}`}>
                          <div className="flyout-item-icon">
                            {alt.type === 'collective' ? (
                              <AlertTriangle size={14} color="#8A2E2B" />
                            ) : (
                              <Bell size={14} color="#5D131B" />
                            )}
                          </div>
                          <div className="flyout-item-body">
                            <strong>{alt.title}</strong>
                            <p>{alt.message}</p>
                            <span className="flyout-time">{alt.timestamp}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Personal Rhythm dots (Miguel can also register) */}
            <button
              className="header-rhythm-meter clickable"
              onClick={() => setShowSquishModal(true)}
              title="Apretar tu Squishy (Coordinador)"
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`meter-dot ${i < mySquishesToday ? 'filled' : ''}`}
                />
              ))}
              <span className="meter-counter-text">{mySquishesToday}/5 hoy</span>
            </button>
          </div>
        </header>

        {/* FEED DASHBOARD GRID (Images 10 & 11) */}
        <div className="coordinator-dashboard-grid">
          {/* Card 1: Estado del equipo */}
          <div className="feed-card team-status-card">
            <span className="card-micro-label">Estado del equipo</span>
            <div className="team-status-icon-wrap">
              <Users size={34} color="#8A95C7" />
            </div>
            <strong
              className={`team-status-value ${
                isAllOverwhelmed
                  ? 'overwhelmed'
                  : isCollectiveAlert
                  ? 'warning'
                  : 'stable'
              }`}
            >
              {isAllOverwhelmed
                ? 'Sobrecarga'
                : isCollectiveAlert
                ? 'Atención'
                : 'Estable'}
            </strong>
          </div>

          {/* Card 2: Personas Conectadas */}
          <div className="feed-card connected-members-card">
            <span className="card-micro-label">Personas Conectadas</span>
            <div className="connected-count-wrap">
              <span className="connected-big-num">
                {teamMemberIds.length}/{teamMemberIds.length}
              </span>
            </div>
            <span className="connected-sub-label">del equipo activos hoy</span>
          </div>

          {/* Card 3: Reporte Semanal / Weekly Report (Center) */}
          <div className="feed-card weekly-report-card">
            <h3 className="card-centered-title">Weekly report</h3>

            {totalWeeklySquishes === 0 ? (
              // Empty dashed state matching Image 10
              <div className="empty-weekly-dashes">
                <div className="dashes-row">
                  <span className="dash-bar" />
                  <span className="dash-bar" />
                  <span className="dash-bar" />
                  <span className="dash-bar" />
                  <span className="dash-bar" />
                </div>
                <div className="weekdays-labels-row">
                  <span>Mon</span>
                  <span>Tues</span>
                  <span>Wed</span>
                  <span>Thur</span>
                  <span>Fri</span>
                </div>
              </div>
            ) : (
              // Active populated bar chart matching Image 11
              <div className="active-weekly-barchart">
                <div className="chart-bars-container">
                  {weeklyData.map((d) => {
                    const barHeightPct = Math.max(
                      14,
                      Math.round((d.count / maxWeeklyCount) * 88)
                    );
                    const isPeak = d.count >= 4;
                    return (
                      <div key={d.label} className="chart-bar-column">
                        <span className="chart-bar-value">{d.count}</span>
                        <div className="bar-track">
                          <div
                            className={`bar-fill ${isPeak ? 'peak-bar' : ''}`}
                            style={{ height: `${barHeightPct}%` }}
                          />
                        </div>
                        <span className="chart-day-label">{d.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Recommendations / Recomendaciones (Right) */}
          <div className="feed-card recommendations-card">
            <h3 className="card-centered-title">Recommendations</h3>
            <ul className="recommendations-list">
              <li>Determina qué es urgente, qué es importante y qué puede esperar.</li>
              <li>Fomenta trabajar en una sola tarea a la vez.</li>
              <li>Observa los cambios en el estado de ánimo, la energía y el rendimiento.</li>
              <li>Mantén la coherencia entre lo que dices y lo que haces.</li>
            </ul>

            <button
              className="communicate-adjustment-btn"
              onClick={() => setShowHelpModal(true)}
            >
              <Sparkles size={14} />
              Comunicar un ajuste al equipo
            </button>
          </div>

          {/* Card 5: Alerta en espera / Tu equipo necesita ayuda (Image 11) */}
          {hasPendingAlerts && (
            <div className="feed-card team-help-alert-card animate-pulse">
              <h3 className="help-card-title">Tu equipo necesita ayuda</h3>
              <p className="help-card-desc">
                {isAllOverwhelmed
                  ? 'Todo el equipo ha alcanzado el límite de squishazos hoy. Requieren tu apoyo organizativo inmediato.'
                  : isCollectiveAlert
                  ? 'Más de la mitad del equipo llegó a 5 squishazos hoy. Es momento de aliviar la carga.'
                  : 'Un integrante reportó una carga alta mediante su señal anónima. ¿Te gustaría apoyar al equipo?'}
              </p>
              <button
                className="brand-wine-btn help-action-btn"
                onClick={() => setShowHelpModal(true)}
              >
                Ayudar
              </button>
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div className="privacy-bottom-banner" style={{ marginTop: '20px' }}>
          <span>Los datos se agrupan para proteger la privacidad de todas las personas del equipo.</span>
          <span className="teams-connected-pill">Microsoft Teams · Conectado</span>
        </div>
      </main>

      {/* MODAL: Tu equipo necesita ayuda / ¿Qué ayudaría? */}
      {showHelpModal && (
        <div className="app-modal-backdrop">
          <div className="app-modal-card large">
            <h2 className="modal-title">Tu equipo necesita ayuda</h2>
            <p className="modal-body">
              Elige una medida organizativa para comunicar al equipo y equilibrar la jornada.
            </p>

            <div className="adjustment-options-list">
              {[
                {
                  title: 'Proteger tiempo de concentración',
                  desc: 'Reservar un bloque sin reuniones para que todos avancen en tareas clave.',
                },
                {
                  title: 'Reorganizar prioridades',
                  desc: 'Postergar entregables secundarios y concentrarse en lo urgente.',
                },
                {
                  title: 'Redistribuir tareas',
                  desc: 'Equilibrar pendientes entre los integrantes para evitar saturación.',
                },
                {
                  title: 'Reducir interrupciones',
                  desc: 'Filtrar consultas de clientes y externos por un canal único.',
                },
                {
                  title: 'Ajustar reuniones y seguimiento',
                  desc: 'Reducir la duración de las reuniones a la mitad hoy.',
                },
              ].map((opt) => (
                <label
                  key={opt.title}
                  className={`adjustment-option-card ${
                    selectedAdjustment === opt.title ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="adjustment"
                    value={opt.title}
                    checked={selectedAdjustment === opt.title}
                    onChange={() => setSelectedAdjustment(opt.title)}
                  />
                  <div className="adjustment-info">
                    <strong>{opt.title}</strong>
                    <span>{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="modal-button-row">
              <button
                className="ghost-cancel-btn"
                onClick={() => setShowHelpModal(false)}
              >
                Más tarde
              </button>
              <button
                className="brand-wine-btn modal-btn"
                onClick={handleConfirmAdjustment}
              >
                Confirmar ajuste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ¡Gracias por apoyar! - El equipo fue notificado */}
      {showThankYouModal && (
        <div className="app-modal-backdrop">
          <div className="app-modal-card">
            <div className="success-icon-badge">
              <HeartHandshake size={32} color="#5D131B" />
            </div>
            <h2 className="modal-title">¡Gracias por apoyar!</h2>
            <p className="modal-body">
              El ajuste <strong>&quot;{selectedAdjustment}&quot;</strong> fue enviado al Feed de todos los integrantes del equipo.
            </p>
            <button
              className="brand-wine-btn modal-btn"
              onClick={() => setShowThankYouModal(false)}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Squishazo personal de Miguel */}
      {showSquishModal && (
        <div className="app-modal-backdrop">
          <div className="app-modal-card">
            <h2 className="modal-title">¿Registrar tu squishazo?</h2>
            <p className="modal-body">
              Como coordinador también puedes registrar voluntariamente cómo va tu propio ritmo.
              ({mySquishesToday}/5 hoy).
            </p>
            <div className="modal-button-row">
              <button
                className="ghost-cancel-btn"
                onClick={() => setShowSquishModal(false)}
              >
                Cancelar
              </button>
              <button
                className="brand-wine-btn modal-btn"
                onClick={handleRegisterMiguelSquish}
                disabled={mySquishesToday >= 5}
              >
                {mySquishesToday >= 5 ? 'Límite alcanzado' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="app-toast-alert">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
