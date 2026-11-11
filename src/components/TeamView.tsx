'use client';

import React from 'react';
import { UserProfile, SquizzeStore, USERS } from '@/lib/model';
import { Users, ShieldCheck, Mail, CheckCircle2, UserCheck, Lock } from 'lucide-react';

interface TeamViewProps {
  currentUser: UserProfile;
  store: SquizzeStore;
  onEditTeamClick?: () => void;
}

export function TeamView({ currentUser, store, onEditTeamClick }: TeamViewProps) {
  const isCoordinator = currentUser.roleType === 'coordinator';
  const teamMembers = USERS.filter((u) => store.selectedMemberIds.includes(u.id));

  return (
    <div className="tab-page-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">{store.teamName}</h1>
          <p className="page-main-sub">
            {teamMembers.length} integrantes · Conectados con Microsoft Teams
          </p>
        </div>

        {isCoordinator && onEditTeamClick && (
          <button className="brand-wine-btn" onClick={onEditTeamClick}>
            Editar integrantes
          </button>
        )}
      </div>

      <div className="team-roster-grid">
        {/* Coordinador Card */}
        <div className="feed-card member-profile-card coordinator-card">
          <div className="member-card-header">
            <span className="member-avatar-large" style={{ background: '#5D131B' }}>
              M
            </span>
            <div className="member-card-meta">
              <span className="member-badge-pill coord">Coordinador</span>
              <h3 className="member-card-name">Miguel</h3>
              <span className="member-card-email">miguel@empresa.com</span>
            </div>
          </div>
          <p className="member-card-role-desc">
            Gestiona la organización del equipo y atiende señales de carga colectiva.
          </p>
        </div>

        {/* Colaboradores Cards */}
        {teamMembers.map((member) => (
          <div key={member.id} className="feed-card member-profile-card">
            <div className="member-card-header">
              <span className="member-avatar-large" style={{ background: member.avatarBg }}>
                {member.avatar}
              </span>
              <div className="member-card-meta">
                <span className="member-badge-pill colab">Colaboradora/or</span>
                <h3 className="member-card-name">{member.name}</h3>
                <span className="member-card-email">{member.email}</span>
              </div>
            </div>
            <p className="member-card-role-desc">{member.title}</p>
            <div className="member-card-footer">
              <CheckCircle2 size={12} color="#47734D" />
              <span>Conectado · Señales anónimas</span>
            </div>
          </div>
        ))}
      </div>

      <div className="privacy-banner-card">
        <Lock size={20} color="#5D131B" />
        <div>
          <strong>Privacidad garantizada en el equipo</strong>
          <p>
            Esta lista es administrativa. Ningún integrante ni el coordinador puede ver cuántos
            squishazos ha hecho otra persona. Solo se comparten señales agregadas cuando se alcanza
            el umbral de protección colectiva.
          </p>
        </div>
      </div>
    </div>
  );
}
