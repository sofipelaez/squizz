'use client';

import React, { useState } from 'react';
import {
  UserProfile,
  SquizzeStore,
  getTodayKey,
  TeamNotice,
} from '@/lib/model';
import {
  registerSquish,
  sendAnonymousSignal,
  markNoticeAsRead,
} from '@/lib/store';
import { SquizzeLogo } from './SquizzeLogo';
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  HeartHandshake,
  HelpCircle,
  LayoutGrid,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Sparkles,
  ShieldCheck,
  Plus,
  EyeOff,
  Flame,
  Info,
} from 'lucide-react';

interface CollaboratorFeedProps {
  currentUser: UserProfile;
  store: SquizzeStore;
  onUpdateStore: (next: SquizzeStore) => void;
  onNavigateTab: (tab: string) => void;
  activeTab: string;
  onLogout: () => void;
}

export function CollaboratorFeed({
  currentUser,
  store,
  onUpdateStore,
  onNavigateTab,
  activeTab,
  onLogout,
}: CollaboratorFeedProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFifthSquishModal, setShowFifthSquishModal] = useState(false);
  const [showPersonalAdviceModal, setShowPersonalAdviceModal] = useState(false);
  const [selectedNoticeDetail, setSelectedNoticeDetail] = useState<TeamNotice | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  const today = getTodayKey();

  // Laura's squishes today
  const myTodayRecords = store.records.filter(
    (r) => r.userId === currentUser.id && r.day === today
  );
  const mySquishCount = myTodayRecords.length;

  // Level determination:
  // 0-1: Ritmo sostenible
  // 2-4: Exigente pero manejable
  // 5: Necesita ajustes
  const rhythmLevel =
    mySquishCount >= 5
      ? 'Necesita ajustes'
      : mySquishCount >= 2
      ? 'Exigente pero manejable'
      : 'Ritmo sostenible';

  // Notices for the team from coordinator
  const teamNotices = store.notices.filter((n) => n.type === 'ajuste');
  const unreadNoticesCount = teamNotices.filter((n) => !n.readBy.includes(currentUser.id)).length;

  // Laura's private weekly squish records
  const daysOfWeek = [
    { label: 'Lun', dayOffset: 1 },
    { label: 'Mar', dayOffset: 2 },
    { label: 'Mié', dayOffset: 3 },
    { label: 'Jue', dayOffset: 4 },
    { label: 'Vie', dayOffset: 5 },
  ];

  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const distToMon = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distToMon);

  const myWeeklyData = daysOfWeek.map((day, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const count = store.records.filter(
      (r) => r.userId === currentUser.id && r.day === key
    ).length;
    return {
      label: day.label,
      dateKey: key,
      count,
      isToday: key === today,
    };
  });

  const totalMyWeekSquishes = myWeeklyData.reduce((acc, curr) => acc + curr.count, 0);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSquishConfirm = () => {
    setShowConfirmModal(false);
    const { updatedStore, newCount, reachedFifth } = registerSquish(store, currentUser.id);
    onUpdateStore(updatedStore);

    if (reachedFifth) {
      setShowFifthSquishModal(true);
    } else {
      triggerToast(`Squishazo registrado (${newCount}/5)`);
    }
  };

  const handleSendAnonymousSignal = () => {
    setShowFifthSquishModal(false);
    const nextStore = sendAnonymousSignal(store, currentUser.id);
    onUpdateStore(nextStore);
    triggerToast('Tu señal anónima fue enviada al equipo');
  };

  const handleOpenNoticeDetail = (notice: TeamNotice) => {
    setSelectedNoticeDetail(notice);
    if (!notice.readBy.includes(currentUser.id)) {
      const nextStore = markNoticeAsRead(store, notice.id, currentUser.id);
      onUpdateStore(nextStore);
    }
  };

  return (
    <div className="app-workspace">
      {/* Sidebar */}
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
              <span className="profile-user-role">Colaboradora</span>
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
        {/* Top Header */}
        <header className="app-top-header">
          <div className="header-greeting-wrap">
            <h2 className="header-greeting-title">Buenos días, {currentUser.name}</h2>
            <span className="header-greeting-sub">¿Cómo va tu ritmo hoy?</span>
          </div>

          <div className="header-right-actions">
            <button
              className={`header-bell-btn ${unreadNoticesCount > 0 ? 'has-badge' : ''}`}
              title="Avisos del coordinador"
              onClick={() => {
                if (teamNotices.length > 0) {
                  handleOpenNoticeDetail(teamNotices[0]);
                } else {
                  triggerToast('No hay avisos pendientes del equipo');
                }
              }}
            >
              <Bell size={18} />
              {unreadNoticesCount > 0 && (
                <span className="bell-badge-count">{unreadNoticesCount}</span>
              )}
            </button>

            {/* Rhythm dots */}
            <div className="header-rhythm-meter">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`meter-dot ${i < mySquishCount ? 'filled' : ''}`}
                />
              ))}
              <span className="meter-counter-text">{mySquishCount}/5 hoy</span>
            </div>
          </div>
        </header>

        {/* Welcome & Explanatory Banner */}
        <div className="feed-intro-banner">
          <div className="intro-text-col">
            <h3 className="intro-title">¿Cuándo hacer un squishazo?</h3>
            <p className="intro-body">
              Cuando sientas que tu ritmo sube por interrupciones, cambios de prioridad o pendientes que se acumulan.
            </p>
          </div>
          <div className="squishy-connection-status">
            <span className="status-ping-dot" />
            <span>Squishy: Conectado</span>
          </div>
        </div>

        {/* COLLABORATOR GRID */}
        <div className="collaborator-dashboard-grid">
          {/* Card: Tu ritmo hoy & Botón Squishy */}
          <div className="feed-card personal-rhythm-card">
            <div className="card-top-header">
              <div>
                <span className="card-micro-label">TU RITMO HOY</span>
                <h3
                  className={`rhythm-level-title ${
                    mySquishCount >= 5
                      ? 'level-five'
                      : mySquishCount >= 2
                      ? 'level-med'
                      : 'level-low'
                  }`}
                >
                  {rhythmLevel}
                </h3>
              </div>
              <div className="rhythm-big-counter">
                <strong>{mySquishCount}</strong>
                <span>/5</span>
              </div>
            </div>

            <p className="rhythm-card-expl">
              Registra señales voluntarias a lo largo de tu día para cuidar el equilibrio de tu jornada.
            </p>

            {/* 5 Progress Bars */}
            <div className="rhythm-dots-bar-row">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`rhythm-bar-segment ${i < mySquishCount ? 'active' : ''}`}
                />
              ))}
            </div>

            {/* Main Action Button */}
            <button
              className="brand-wine-btn squishy-action-btn"
              disabled={mySquishCount >= 5}
              onClick={() => setShowConfirmModal(true)}
            >
              <Plus size={16} />
              {mySquishCount >= 5 ? 'Ya registraste 5 squishazos hoy' : 'Apretar Squishy'}
            </button>

            <span className="anytime-note">
              Puedes registrar un squishazo en cualquier momento de tu jornada.
            </span>
          </div>

          {/* Card: Mi semana (Private weekly view) */}
          <div className="feed-card personal-week-card">
            <div className="card-top-header">
              <h3 className="card-box-title">Mi semana</h3>
              <span className="private-badge-pill">
                <EyeOff size={12} />
                Privado
              </span>
            </div>
            <p className="private-week-sub">
              Tu resumen es 100% privado. Tu coordinador no tiene acceso a tus registros individuales.
            </p>

            {totalMyWeekSquishes === 0 ? (
              <div className="empty-week-box">
                <p>Cuando aprietes tu Squishy, verás aquí cómo va tu semana.</p>
              </div>
            ) : (
              <div className="private-barchart-wrap">
                <div className="chart-bars-container">
                  {myWeeklyData.map((d) => {
                    const pct = Math.max(12, Math.round((d.count / 5) * 88));
                    return (
                      <div key={d.label} className="chart-bar-column">
                        <span className="chart-bar-value">{d.count}</span>
                        <div className="bar-track">
                          <div
                            className={`bar-fill ${d.count >= 5 ? 'peak-bar' : ''}`}
                            style={{ height: `${pct}%` }}
                          />
                        </div>
                        <span className="chart-day-label">{d.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              className="ghost-text-link"
              onClick={() => onNavigateTab('Análisis')}
            >
              Ver mi resumen completo en Análisis
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Section: Avisos del equipo */}
        <section className="team-notices-section">
          <div className="section-head">
            <h3 className="section-title">Avisos del equipo</h3>
            <span className="section-count">{teamNotices.length} ajustes comunicados</span>
          </div>

          {teamNotices.length === 0 ? (
            <div className="empty-notices-card">
              <Info size={18} color="#8A6B67" />
              <p>No hay avisos de ajustes en este momento. Tu coordinador te notificará aquí.</p>
            </div>
          ) : (
            <div className="notices-list">
              {teamNotices.map((notice) => {
                const isRead = notice.readBy.includes(currentUser.id);
                return (
                  <div
                    key={notice.id}
                    className={`notice-item-card ${isRead ? 'read' : 'unread'}`}
                    onClick={() => handleOpenNoticeDetail(notice)}
                  >
                    <div className="notice-icon-box">
                      <HeartHandshake size={18} color="#5D131B" />
                    </div>
                    <div className="notice-content-box">
                      <div className="notice-title-row">
                        <strong className="notice-title-txt">{notice.title}</strong>
                        {!isRead && <span className="unread-dot">Nuevo</span>}
                      </div>
                      <p className="notice-body-txt">{notice.body}</p>
                      <span className="notice-meta">
                        Comunicado por {notice.fromName}
                      </span>
                    </div>
                    <ChevronRight size={16} className="notice-arrow" />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom privacy disclaimer banner */}
        <div className="privacy-bottom-banner" style={{ marginTop: '20px' }}>
          <span>Los squishazos individuales nunca son compartidos con nadie. Tu privacidad está protegida.</span>
          <span className="teams-connected-pill">Squizze · Privacidad Garantizada</span>
        </div>
      </main>

      {/* MODAL 1: ¿Registrar un squishazo? */}
      {showConfirmModal && (
        <div className="app-modal-backdrop">
          <div className="app-modal-card">
            <div className="squishy-touch-avatar">
              <span>S</span>
            </div>
            <span className="modal-micro-badge">REGISTRO VOLUNTARIO</span>
            <h2 className="modal-title">¿Registrar un squishazo?</h2>
            <p className="modal-body">
              Solo se guardará si confirmas. Esta señal es personal y voluntaria.
            </p>
            <div className="modal-button-row">
              <button
                className="ghost-cancel-btn"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button
                className="brand-wine-btn modal-btn"
                onClick={handleSquishConfirm}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Quinto squishazo alcanzado (Límite diario) */}
      {showFifthSquishModal && (
        <div className="app-modal-backdrop">
          <div className="app-modal-card large">
            <div className="squishy-touch-avatar five">
              <span>5</span>
            </div>
            <span className="modal-micro-badge warning">NIVEL ACTUAL: NECESITA AJUSTES</span>
            <h2 className="modal-title">Ya registraste 5 squishazos hoy</h2>
            <p className="modal-body">
              Llegaste al límite diario. Tu señal puede ser enviada de forma anónima para que tu coordinador evalúe ajustes organizativos en el equipo.
            </p>
            <p className="modal-question">¿Qué ayudaría?</p>

            <div className="fifth-options-col">
              <button
                className="fifth-choice-btn primary-choice"
                onClick={() => {
                  setShowFifthSquishModal(false);
                  setShowPersonalAdviceModal(true);
                }}
              >
                <div className="choice-text">
                  <strong>Darme una recomendación para mí</strong>
                  <span>Consejo breve y práctico para tu ritmo individual</span>
                </div>
                <ChevronRight size={16} />
              </button>

              <button
                className="fifth-choice-btn highlight-choice"
                onClick={handleSendAnonymousSignal}
              >
                <div className="choice-text">
                  <strong>Enviar mi señal al equipo (anónimo)</strong>
                  <span>Notifica al coordinador sin revelar tu identidad</span>
                </div>
                <ChevronRight size={16} />
              </button>

              <button
                className="ghost-cancel-btn"
                style={{ marginTop: '6px' }}
                onClick={() => setShowFifthSquishModal(false)}
              >
                Omitir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Recomendación personal */}
      {showPersonalAdviceModal && (
        <div className="app-modal-backdrop">
          <div className="app-modal-card">
            <div className="advice-icon-wrap">
              <Sparkles size={28} color="#5D131B" />
            </div>
            <h2 className="modal-title">Recomendación para ti</h2>
            <div className="personal-advice-content">
              <p>• Toma una pausa consciente de 10 minutos lejos de la pantalla.</p>
              <p>• Reserva un bloque de concentración y silencia notificaciones inmediatas.</p>
              <p>• Prioriza únicamente las tareas urgentes y pospón las secundarias para mañana.</p>
            </div>
            <button
              className="brand-wine-btn modal-btn"
              onClick={() => setShowPersonalAdviceModal(false)}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Detalle de ajuste comunicado por Miguel */}
      {selectedNoticeDetail && (
        <div className="app-modal-backdrop">
          <div className="app-modal-card">
            <div className="notice-badge-icon">
              <HeartHandshake size={32} color="#5D131B" />
            </div>
            <span className="modal-micro-badge">AJUSTE DEL COORDINADOR</span>
            <h2 className="modal-title">{selectedNoticeDetail.title}</h2>
            <p className="modal-body" style={{ fontSize: '13px', lineHeight: 1.6 }}>
              {selectedNoticeDetail.body}
            </p>
            <span className="modal-timestamp-note">
              Comunicado por {selectedNoticeDetail.fromName} · {new Date(selectedNoticeDetail.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              className="brand-wine-btn modal-btn"
              onClick={() => setSelectedNoticeDetail(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="app-toast-alert">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
