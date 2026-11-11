'use client';

import React from 'react';
import { UserProfile, SquizzeStore } from '@/lib/model';
import { Settings, ShieldCheck, Bluetooth, RefreshCw, Cpu, Check, Layers } from 'lucide-react';

interface SettingsViewProps {
  currentUser: UserProfile;
  store: SquizzeStore;
  onReopenSetup?: () => void;
  onResetTodayCounts: () => void;
}

export function SettingsView({
  currentUser,
  store,
  onReopenSetup,
  onResetTodayCounts,
}: SettingsViewProps) {
  const isCoordinator = currentUser.roleType === 'coordinator';

  return (
    <div className="tab-page-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Configuración y Conexiones</h1>
          <p className="page-main-sub">
            Administra tus integraciones de Teams, estado del Squishy y preferencias.
          </p>
        </div>
      </div>

      <div className="settings-cards-grid">
        {/* Microsoft Teams Card */}
        <div className="feed-card settings-box-card">
          <div className="settings-card-head">
            <span className="settings-ms-tag">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="1" y="1" width="10" height="10" rx="1.5" fill="#F25022" />
                <rect x="13" y="1" width="10" height="10" rx="1.5" fill="#7FBA00" />
                <rect x="1" y="13" width="10" height="10" rx="1.5" fill="#00A4EF" />
                <rect x="13" y="13" width="10" height="10" rx="1.5" fill="#FFB900" />
              </svg>
            </span>
            <div>
              <h3 className="card-box-title">Microsoft Teams</h3>
              <span className="status-connected-pill">● Conectado institucionalmente</span>
            </div>
          </div>
          <p className="settings-desc">
            Squizze se conecta con tu Teams para sincronizar contactos del equipo sin acceder a
            chats privados, archivos ni calendarios confidenciales.
          </p>
          <div className="settings-info-row">
            <span>Cuenta activa:</span>
            <strong>{currentUser.email}</strong>
          </div>
        </div>

        {/* Dispositivo Squishy Card */}
        <div className="feed-card settings-box-card">
          <div className="settings-card-head">
            <Bluetooth size={24} color="#5D131B" />
            <div>
              <h3 className="card-box-title">Dispositivo Squishy</h3>
              <span className="status-connected-pill">● Conectado (BLE)</span>
            </div>
          </div>
          <p className="settings-desc">
            Tu Squishy físico envía pulsos táctiles a la aplicación web cuando lo aprietas durante
            tu jornada.
          </p>
          <div className="settings-info-row">
            <span>Batería del Squishy:</span>
            <strong>92% · Modo ahorro activo</strong>
          </div>
        </div>

        {/* Principios de Privacidad Card */}
        <div className="feed-card settings-box-card full-span">
          <div className="settings-card-head">
            <ShieldCheck size={24} color="#5D131B" />
            <div>
              <h3 className="card-box-title">Reglas de Privacidad y Ética Laboral</h3>
            </div>
          </div>
          <ul className="privacy-rules-list">
            <li>
              <strong>No es una herramienta médica ni diagnóstica:</strong> Squizze no mide estrés biológico ni califica tu salud mental.
            </li>
            <li>
              <strong>Participación 100% voluntaria:</strong> Cada squishazo es una decisión personal. No existen horarios obligatorios.
            </li>
            <li>
              <strong>Agregación mínima de 3 personas:</strong> Ningún coordinador puede ver datos si no hay al menos 3 personas en la tendencia.
            </li>
            <li>
              <strong>Protección contra evaluación laboral:</strong> Las señales nunca deben ser usadas para evaluar el rendimiento laboral.
            </li>
          </ul>
        </div>

        {/* Acciones de administración / Reconfigurar */}
        {isCoordinator && onReopenSetup && (
          <div className="feed-card settings-box-card full-span">
            <h3 className="card-box-title">Acciones del Coordinador</h3>
            <p className="settings-desc">
              Puedes volver a ejecutar el flujo de bienvenida, redefinir los integrantes del equipo
              o restablecer los contadores de demostración para una nueva sesión de usabilidad.
            </p>
            <div className="settings-btn-row">
              <button className="brand-wine-btn" onClick={onReopenSetup}>
                Reconfigurar equipo y privacidad
              </button>
              <button className="ghost-cancel-btn" onClick={onResetTodayCounts}>
                Restablecer contadores de hoy a 0
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
