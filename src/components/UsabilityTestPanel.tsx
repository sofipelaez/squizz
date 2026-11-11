'use client';

import React, { useState } from 'react';
import {
  UserProfile,
  USERS,
  SquizzeStore,
  getTodayKey,
  generateBaseHistoricalRecords,
  formatTimeNow,
} from '@/lib/model';
import {
  registerSquish,
  sendAnonymousSignal,
  createAdjustmentNotice,
  resetTodayCounts,
  resetFactoryDemo,
  saveStore,
  logUsabilityEvent,
} from '@/lib/store';
import {
  FlaskConical,
  Users,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  History,
  ChevronDown,
  ChevronUp,
  X,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface UsabilityTestPanelProps {
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  store: SquizzeStore;
  onUpdateStore: (next: SquizzeStore) => void;
  onNavigateTab: (tab: string) => void;
  onSimulateError: () => void;
}

export function UsabilityTestPanel({
  currentUser,
  onSwitchUser,
  store,
  onUpdateStore,
  onNavigateTab,
  onSimulateError,
}: UsabilityTestPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'scenarios' | 'logs' | 'users'>('scenarios');
  const today = getTodayKey();

  // Helper scenario runner
  const runScenario1 = () => {
    // Escenario 1: Laura registra 1 squishazo
    const laura = USERS.find((u) => u.id === 'laura') || USERS[1];
    onSwitchUser(laura);
    const { updatedStore } = registerSquish(store, 'laura');
    onUpdateStore(updatedStore);
    onNavigateTab('Feed');
  };

  const runScenario2 = () => {
    // Escenario 2: Laura llega a 5 squishazos y envía señal anónima
    const laura = USERS.find((u) => u.id === 'laura') || USERS[1];
    onSwitchUser(laura);
    let current = store;
    const existing = current.records.filter((r) => r.userId === 'laura' && r.day === today).length;
    for (let i = existing; i < 5; i++) {
      const res = registerSquish(current, 'laura');
      current = res.updatedStore;
    }
    current = sendAnonymousSignal(current, 'laura');
    onUpdateStore(current);
    onNavigateTab('Feed');
  };

  const runScenario3 = () => {
    // Escenario 3: Todo el equipo llega a 5 squishazos (alerta colectiva crítica)
    let current = store;
    const teamMembers = ['laura', 'valentina', 'andres'];
    teamMembers.forEach((memberId) => {
      const existing = current.records.filter((r) => r.userId === memberId && r.day === today).length;
      for (let i = existing; i < 5; i++) {
        const res = registerSquish(current, memberId);
        current = res.updatedStore;
      }
      current = sendAnonymousSignal(current, memberId);
    });
    // Switch to Miguel so researcher can verify the collective alert
    const miguel = USERS.find((u) => u.id === 'miguel') || USERS[0];
    onSwitchUser(miguel);
    onUpdateStore(current);
    onNavigateTab('Feed');
  };

  const runScenario4 = () => {
    // Escenario 4: Miguel decide ayudar y comunica ajuste
    const miguel = USERS.find((u) => u.id === 'miguel') || USERS[0];
    onSwitchUser(miguel);
    const next = createAdjustmentNotice(
      store,
      'Proteger tiempo de concentración',
      'Hoy reservaremos un bloque sin reuniones para que el equipo pueda avanzar en tareas clave.',
      'Proteger tiempo de concentración'
    );
    onUpdateStore(next);
    onNavigateTab('Feed');
  };

  const runScenario7 = () => {
    // Escenario 7: Privacidad insuficiente (menos de 3 personas con señal esta semana)
    const miguel = USERS.find((u) => u.id === 'miguel') || USERS[0];
    onSwitchUser(miguel);
    // filter store records so only 1 person has records
    const filteredRecords = store.records.filter((r) => r.userId === 'laura');
    let next: SquizzeStore = {
      ...store,
      records: filteredRecords,
    };
    next = logUsabilityEvent(
      next,
      'Simulación: Umbral insuficiente',
      'Se redujeron los registros históricos para tener solo 1 colaborador con señal.',
      'Investigador'
    );
    saveStore(next);
    onUpdateStore(next);
    onNavigateTab('Análisis');
  };

  const runLoadFullWeek = () => {
    // Cargar semana completa con datos base (L-V)
    const baseRecords = generateBaseHistoricalRecords();
    let next: SquizzeStore = {
      ...store,
      records: [...baseRecords, ...store.records.filter((r) => r.day === today)],
    };
    next = logUsabilityEvent(
      next,
      'Semana base cargada',
      'Se cargaron los 5 días de la semana con registros de prueba representativos.',
      'Investigador'
    );
    saveStore(next);
    onUpdateStore(next);
  };

  const runResetToday = () => {
    const next = resetTodayCounts(store);
    onUpdateStore(next);
  };

  const runResetAll = () => {
    if (confirm('¿Restablecer todos los datos a la configuración inicial de prueba?')) {
      const next = resetFactoryDemo(store);
      onUpdateStore(next);
    }
  };

  return (
    <div className={`usability-panel-container ${isOpen ? 'open' : 'closed'}`}>
      {/* Floating Toggle Tab */}
      <button
        type="button"
        className="usability-dock-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FlaskConical size={16} />
        <span className="dock-toggle-title">Panel de Pruebas de Usabilidad</span>
        <span className="dock-user-indicator">
          {currentUser.name} ({currentUser.roleType === 'coordinator' ? 'Coordinador' : 'Colaboradora'})
        </span>
        <span className="live-sync-indicator" title="Sincronización multi-pestaña activa">
          <Radio size={12} className="pulse-icon" />
          En vivo
        </span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Expanded Panel Content */}
      {isOpen && (
        <div className="usability-drawer-content">
          <div className="drawer-header-row">
            <div className="drawer-subtabs">
              <button
                className={`subtab-btn ${activeSubTab === 'scenarios' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('scenarios')}
              >
                Escenarios de Prueba
              </button>
              <button
                className={`subtab-btn ${activeSubTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('users')}
              >
                Cambiar de Rol / Usuario
              </button>
              <button
                className={`subtab-btn ${activeSubTab === 'logs' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('logs')}
              >
                Registro de Usabilidad ({store.usabilityLogs.length})
              </button>
            </div>

            <button
              className="drawer-close-btn"
              onClick={() => setIsOpen(false)}
              title="Minimizar panel"
            >
              <X size={16} />
            </button>
          </div>

          <div className="drawer-body">
            {/* SUBTAB 1: SCENARIOS */}
            {activeSubTab === 'scenarios' && (
              <div className="scenarios-grid">
                <div className="scenario-card">
                  <div className="sc-top">
                    <span className="sc-tag">Escenario 1</span>
                    <strong>Laura registra squishazo</strong>
                  </div>
                  <p>Inicia sesión como Laura, registra un squishazo y verifica el contador.</p>
                  <button className="sc-action-btn" onClick={runScenario1}>
                    <Play size={12} /> Ejecutar
                  </button>
                </div>

                <div className="scenario-card">
                  <div className="sc-top">
                    <span className="sc-tag">Escenario 2</span>
                    <strong>Laura llega a 5 squishazos</strong>
                  </div>
                  <p>Llega a 5 y envía señal anónima al equipo. Dispara aviso anónimo a Miguel.</p>
                  <button className="sc-action-btn" onClick={runScenario2}>
                    <Play size={12} /> Ejecutar
                  </button>
                </div>

                <div className="scenario-card">
                  <div className="sc-top">
                    <span className="sc-tag">Escenario 3</span>
                    <strong>Alerta colectiva (Todo el equipo)</strong>
                  </div>
                  <p>Simula que las 3 integrantes llegan a 5. Miguel recibe alerta colectiva.</p>
                  <button className="sc-action-btn" onClick={runScenario3}>
                    <Play size={12} /> Ejecutar
                  </button>
                </div>

                <div className="scenario-card">
                  <div className="sc-top">
                    <span className="sc-tag">Escenario 4</span>
                    <strong>Miguel envía ajuste</strong>
                  </div>
                  <p>Miguel atiende la alerta y envía el ajuste organizativo al equipo.</p>
                  <button className="sc-action-btn" onClick={runScenario4}>
                    <Play size={12} /> Ejecutar
                  </button>
                </div>

                <div className="scenario-card">
                  <div className="sc-top">
                    <span className="sc-tag">Escenario 7</span>
                    <strong>Umbral insuficiente (&lt; 3 personas)</strong>
                  </div>
                  <p>Verifica que Miguel no puede ver la tendencia sin el mínimo de 3 personas.</p>
                  <button className="sc-action-btn" onClick={runScenario7}>
                    <Play size={12} /> Ejecutar
                  </button>
                </div>

                <div className="scenario-card">
                  <div className="sc-top">
                    <span className="sc-tag">Utilidades de Prueba</span>
                    <strong>Reset de Contadores</strong>
                  </div>
                  <div className="sc-dual-btn-row">
                    <button className="sc-action-btn secondary" onClick={runResetToday}>
                      Resetear hoy a 0
                    </button>
                    <button className="sc-action-btn secondary" onClick={runLoadFullWeek}>
                      Cargar semana base
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: USERS */}
            {activeSubTab === 'users' && (
              <div className="users-switcher-grid">
                {USERS.map((user) => (
                  <button
                    key={user.id}
                    className={`user-card-switch ${currentUser.id === user.id ? 'current' : ''}`}
                    onClick={() => {
                      onSwitchUser(user);
                      onNavigateTab('Feed');
                    }}
                  >
                    <span className="user-avatar-tag" style={{ background: user.avatarBg }}>
                      {user.avatar}
                    </span>
                    <div className="user-text-col">
                      <strong>{user.name}</strong>
                      <span>{user.title}</span>
                      <small className="user-role-badge">
                        {user.roleType === 'coordinator' ? 'Coordinador' : 'Colaboradora'}
                      </small>
                    </div>
                    {currentUser.id === user.id && (
                      <span className="current-badge">Activo</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* SUBTAB 3: LOGS */}
            {activeSubTab === 'logs' && (
              <div className="audit-logs-wrap">
                <div className="logs-head">
                  <span>Registro de eventos para el equipo investigador</span>
                  <button className="sc-action-btn secondary" onClick={runResetAll}>
                    Restablecer todo a fábrica
                  </button>
                </div>
                <div className="logs-table-scroll">
                  <table className="logs-table">
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Actor</th>
                        <th>Evento</th>
                        <th>Detalles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.usabilityLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="log-time">{log.timestamp}</td>
                          <td className="log-actor">{log.actor}</td>
                          <td className="log-event">{log.event}</td>
                          <td className="log-details">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
