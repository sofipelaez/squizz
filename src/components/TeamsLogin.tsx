'use client';

import React, { useState } from 'react';
import { SquizzeLogo } from './SquizzeLogo';
import { USERS, UserProfile } from '@/lib/model';
import { AlertCircle, CheckCircle2, ChevronDown, RefreshCw, ShieldCheck } from 'lucide-react';

interface TeamsLoginProps {
  onLoginSuccess: (user: UserProfile) => void;
  currentUser: UserProfile;
  onUserSelect: (user: UserProfile) => void;
}

export function TeamsLogin({ onLoginSuccess, currentUser, onUserSelect }: TeamsLoginProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [showErrorCard, setShowErrorCard] = useState(false);

  const handleTeamsClick = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      if (simulateError) {
        setShowErrorCard(true);
      } else {
        onLoginSuccess(currentUser);
      }
    }, 700);
  };

  const handleRetry = () => {
    setShowErrorCard(false);
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      onLoginSuccess(currentUser);
    }, 600);
  };

  return (
    <div className="teams-login-screen">
      {/* Ambient background blur elements matching Figma Image 5 */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />

      <div className="login-content-box">
        {/* Brand logo at top */}
        <div className="login-logo-header">
          <SquizzeLogo variant="light" size="xl" />
        </div>

        {/* Floating Card */}
        {!showErrorCard ? (
          <div className="teams-modal-card">
            <h1 className="teams-card-title">
              {currentUser.roleType === 'collaborator' ? 'Bienvenida' : 'Bienvenidos'}
            </h1>
            <p className="teams-card-desc">
              Ingresa con tu cuenta institucional de Teams para continuar con tu equipo.
            </p>

            <button
              className="teams-action-btn"
              onClick={handleTeamsClick}
              disabled={isConnecting}
            >
              <span className="teams-ms-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="1" y="1" width="10" height="10" rx="1.5" fill="#F25022" />
                  <rect x="13" y="1" width="10" height="10" rx="1.5" fill="#7FBA00" />
                  <rect x="1" y="13" width="10" height="10" rx="1.5" fill="#00A4EF" />
                  <rect x="13" y="13" width="10" height="10" rx="1.5" fill="#FFB900" />
                </svg>
              </span>
              {isConnecting ? 'Conectando con Microsoft Teams...' : 'Ingresar con Teams'}
            </button>

            {/* Selector de cuenta para pruebas de usabilidad en ambiente real */}
            <div className="teams-account-selector">
              <span className="selector-label">Cuenta para la prueba de usabilidad:</span>
              <div className="selector-pills">
                {USERS.slice(0, 3).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className={`user-pill-btn ${currentUser.id === u.id ? 'active' : ''}`}
                    onClick={() => onUserSelect(u)}
                  >
                    <span className="pill-avatar" style={{ background: u.avatarBg }}>
                      {u.avatar}
                    </span>
                    <span className="pill-name">{u.name}</span>
                    <span className="pill-role">
                      {u.roleType === 'coordinator' ? 'Coord.' : 'Colab.'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="selector-secondary">
                <select
                  value={currentUser.id}
                  onChange={(e) => {
                    const found = USERS.find((u) => u.id === e.target.value);
                    if (found) onUserSelect(found);
                  }}
                  className="more-users-select"
                >
                  {USERS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.title} ({u.roleType === 'coordinator' ? 'Coordinador' : 'Colaboradora'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkbox para probar el escenario de error de Teams */}
            <div className="test-error-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={simulateError}
                  onChange={(e) => setSimulateError(e.target.checked)}
                />
                <span>Simular fallo de conexión (Escenario 8)</span>
              </label>
            </div>

            <div className="teams-card-footer">
              <ShieldCheck size={14} />
              <span>Acceso institucional seguro · Teams Ecosystem</span>
            </div>
          </div>
        ) : (
          /* Error State Screen from Image 5 */
          <div className="teams-modal-card error-card">
            <div className="error-icon-wrap">
              <AlertCircle size={28} color="#5D131B" />
            </div>
            <h2 className="error-title">Error de conexión</h2>
            <p className="error-desc">
              No pudimos conectar con Microsoft Teams. Por favor intenta de nuevo.
            </p>
            <button className="error-retry-btn" onClick={handleRetry} disabled={isConnecting}>
              <RefreshCw size={14} className={isConnecting ? 'spin' : ''} />
              {isConnecting ? 'Reintentando...' : 'Reintentar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
