'use client';

import React, { useState } from 'react';
import { USERS, UserProfile } from '@/lib/model';
import { SquizzeLogo } from './SquizzeLogo';
import {
  Bell,
  Check,
  CheckCircle2,
  Calendar,
  Zap,
  Users as UsersIcon,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  LayoutGrid,
  BarChart3,
  Settings,
} from 'lucide-react';

interface CoordinatorSetupProps {
  currentUser: UserProfile;
  initialSelectedMemberIds: string[];
  onCompleteSetup: (selectedIds: string[]) => void;
  onLogout: () => void;
}

type SetupStep = 'privacy' | 'select-team' | 'team-created';

export function CoordinatorSetup({
  currentUser,
  initialSelectedMemberIds,
  onCompleteSetup,
  onLogout,
}: CoordinatorSetupProps) {
  const [step, setStep] = useState<SetupStep>('privacy');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedMemberIds.length ? initialSelectedMemberIds : ['laura', 'valentina', 'andres']
  );
  const [showMinPeopleModal, setShowMinPeopleModal] = useState(false);
  const [showPermissionRejectedModal, setShowPermissionRejectedModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Contacts available in Teams (excluding coordinator himself)
  const availableContacts = USERS.filter((u) => u.id !== currentUser.id);

  const toggleMember = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleConfirmTeamSelection = () => {
    if (selectedIds.length < 3) {
      setShowMinPeopleModal(true);
      return;
    }
    // Show success modal as seen in Figma Image 7
    setShowSuccessModal(true);
  };

  const handleSuccessModalOk = () => {
    setShowSuccessModal(false);
    setStep('team-created');
  };

  return (
    <div className="app-workspace">
      {/* Sidebar - Matching Image 6 & 7 */}
      <aside className="app-sidebar">
        <div className="sidebar-logo-container">
          <SquizzeLogo variant="light" size="sm" />
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <LayoutGrid size={16} />
            <span>Feed</span>
          </button>
          <button className="nav-item">
            <BarChart3 size={16} />
            <span>Análisis</span>
          </button>
          <button className="nav-item">
            <Settings size={16} />
            <span>Configuración</span>
          </button>
          <button className="nav-item">
            <UsersIcon size={16} />
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
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="app-main-pane">
        {/* Top Header - Matching Image 6 */}
        <header className="app-top-header">
          <div className="header-greeting-wrap">
            <h2 className="header-greeting-title">Buenos días, {currentUser.name}</h2>
            <span className="header-greeting-sub">¿Cómo va tu ritmo hoy?</span>
          </div>

          <div className="header-right-actions">
            <button className="header-bell-btn" title="Notificaciones">
              <Bell size={18} />
            </button>

            {/* Rhythm dots (Miguel can also track his rhythm) */}
            <div className="header-rhythm-meter">
              <span className="meter-dot filled" />
              <span className="meter-dot filled" />
              <span className="meter-dot filled" />
              <span className="meter-dot" />
              <span className="meter-dot" />
              <span className="meter-counter-text">3/5 hoy</span>
            </div>
          </div>
        </header>

        {/* STEP 1: Privacidad del coordinador (Image 6) */}
        {step === 'privacy' && (
          <section className="setup-step-view">
            <div className="step-page-heading">
              <h1 className="step-main-title">Privacidad del coordinador</h1>
              <p className="step-main-sub">La información del equipo se presenta de forma agregada.</p>
            </div>

            <div className="privacy-cards-grid">
              {/* Card 1: Lo que puedes ver */}
              <div className="privacy-feature-card">
                <h3 className="card-box-title">Lo que puedes ver</h3>
                <ul className="privacy-bullet-list">
                  <li>Tendencias generales del equipo</li>
                  <li>Patrones de carga por días o franjas horarias</li>
                  <li>Recomendaciones para organizar mejor el trabajo</li>
                </ul>
              </div>

              {/* Card 2: Lo que nunca podrás ver */}
              <div className="privacy-feature-card">
                <h3 className="card-box-title">Lo que nunca podrás ver</h3>
                <ul className="privacy-bullet-list">
                  <li>Quién envió una señal</li>
                  <li>Niveles individuales</li>
                  <li>Historiales personales</li>
                  <li>Información que identifique a alguien</li>
                </ul>
              </div>
            </div>

            {/* Bottom privacy disclaimer banner */}
            <div className="privacy-bottom-banner">
              <span>Los datos se agrupan para proteger la privacidad de todas las personas del equipo.</span>
              <button className="brand-wine-btn" onClick={() => setStep('select-team')}>
                Continuar
              </button>
            </div>
          </section>
        )}

        {/* STEP 2: Elige tu equipo (Image 7) */}
        {step === 'select-team' && (
          <section className="setup-step-view">
            <div className="step-page-heading">
              <h1 className="step-main-title">Elige tu equipo</h1>
              <p className="step-main-sub">
                Selecciona al menos 3 personas para mostrar tendencias de forma segura.
              </p>
            </div>

            <div className="team-selector-card">
              <div className="contacts-list-container">
                <div className="contacts-header-row">
                  <span className="contacts-header-label">Contactos de Teams</span>
                  <span className="contacts-selected-tally">
                    {selectedIds.length} seleccionados (mínimo 3)
                  </span>
                </div>

                <div className="contacts-checklist">
                  {availableContacts.map((contact) => {
                    const isChecked = selectedIds.includes(contact.id);
                    return (
                      <label key={contact.id} className="contact-checkbox-row">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleMember(contact.id)}
                        />
                        <div className="contact-info-col">
                          <span className="contact-name-txt">{contact.name}</span>
                          <span className="contact-email-txt">{contact.email} · {contact.title}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Usability testing helper buttons for research */}
              <div className="contacts-test-helpers">
                <button
                  type="button"
                  className="ghost-test-link"
                  onClick={() => setShowPermissionRejectedModal(true)}
                >
                  <ShieldAlert size={12} />
                  Simular permiso rechazado
                </button>
              </div>
            </div>

            <div className="privacy-bottom-banner">
              <span>Los datos se agrupan para proteger la privacidad de todas las personas del equipo.</span>
              <button className="brand-wine-btn" onClick={handleConfirmTeamSelection}>
                Continuar
              </button>
            </div>
          </section>
        )}

        {/* STEP 3: ¡Equipo creado! (Image 9) */}
        {step === 'team-created' && (
          <section className="setup-step-view">
            {/* Success pill alert banner */}
            <div className="team-created-alert-pill">
              <div className="alert-pill-icon">
                <Check size={16} />
              </div>
              <div className="alert-pill-text">
                <strong>¡Equipo creado!</strong>
                <span>Tu equipo ya está listo en Squizze.</span>
              </div>
            </div>

            {/* Grid of stats and team info */}
            <div className="created-team-grid">
              {/* Equipo Card with Avatars */}
              <div className="created-stat-card team-avatar-card">
                <div className="card-top-header">
                  <h3 className="card-box-title">Equipo</h3>
                  <span className="team-active-badge">
                    {selectedIds.length} integrantes · <span className="status-dot-green">●</span> Activo
                  </span>
                </div>

                <div className="team-avatars-row">
                  {/* Coordinator (Tú) */}
                  <div className="avatar-member-item">
                    <div className="member-avatar-circle coordinator">
                      <span>Tú</span>
                      <span className="coord-mini-badge" title="Coordinador">👑</span>
                    </div>
                    <span className="member-avatar-label">Tú</span>
                  </div>

                  {/* Selected members */}
                  {selectedIds.slice(0, 4).map((mId) => {
                    const member = USERS.find((u) => u.id === mId);
                    if (!member) return null;
                    return (
                      <div key={member.id} className="avatar-member-item">
                        <div className="member-avatar-circle" style={{ background: member.avatarBg }}>
                          <span>{member.avatar}</span>
                        </div>
                        <span className="member-avatar-label">{member.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stat 1: Cantidad integrantes */}
              <div className="created-stat-card small-stat">
                <UsersIcon size={24} className="stat-icon-wine" />
                <div className="stat-value-group">
                  <span className="stat-big-number">{selectedIds.length}</span>
                  <span className="stat-small-desc">Integrantes</span>
                </div>
              </div>

              {/* Stat 2: Monitoreo Activo */}
              <div className="created-stat-card small-stat">
                <Zap size={24} className="stat-icon-wine" />
                <div className="stat-value-group">
                  <span className="stat-status-highlight">Activo</span>
                  <span className="stat-small-desc">Monitoreo de curso</span>
                </div>
              </div>

              {/* Stat 3: Semana 1 */}
              <div className="created-stat-card wide-stat">
                <Calendar size={24} className="stat-icon-wine" />
                <div className="stat-value-group">
                  <span className="stat-status-highlight">Semana 1</span>
                  <span className="stat-small-desc">de seguimiento</span>
                </div>
              </div>
            </div>

            <div className="privacy-bottom-banner">
              <span>Los datos se agrupan para proteger la privacidad de todas las personas del equipo.</span>
              <button
                className="brand-wine-btn"
                onClick={() => onCompleteSetup(selectedIds)}
              >
                Ir al Feed del Coordinador
                <ArrowRight size={14} style={{ marginLeft: '6px' }} />
              </button>
            </div>
          </section>
        )}
      </main>

      {/* MODAL 1: Selecciona al menos 3 personas (Image 8) */}
      {showMinPeopleModal && (
        <div className="app-modal-backdrop">
          <div className="app-modal-card">
            <h2 className="modal-title">Selecciona al menos 3 personas</h2>
            <p className="modal-body">
              Con menos de 3 personas no podemos mostrar la tendencia sin identificar a nadie.
            </p>
            <button
              className="brand-wine-btn modal-btn"
              onClick={() => setShowMinPeopleModal(false)}
            >
              Volver a elegir
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Permiso de contactos rechazado (Image 7) */}
      {showPermissionRejectedModal && (
        <div className="app-modal-backdrop">
          <div className="app-modal-card">
            <h2 className="modal-title">Permiso de contactos rechazado</h2>
            <p className="modal-body">
              Necesitamos esto para que puedas formar tu equipo. Squizze no lee mensajes ni archivos.
            </p>
            <button
              className="brand-wine-btn modal-btn"
              onClick={() => setShowPermissionRejectedModal(false)}
            >
              Volver a solicitar permiso
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Tu equipo ha sido creado correctamente (Image 7) */}
      {showSuccessModal && (
        <div className="app-modal-backdrop">
          <div className="app-modal-card">
            <h2 className="modal-title">Tu equipo ha sido creado correctamente</h2>
            <p className="modal-body">
              Ya puedes interactuar con tu equipo de trabajo.
            </p>
            <button
              className="brand-wine-btn modal-btn"
              style={{ background: '#A14434', width: 'auto', minWidth: '90px' }}
              onClick={handleSuccessModalOk}
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
