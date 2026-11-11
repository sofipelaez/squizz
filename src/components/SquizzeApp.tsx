'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  USERS,
  SquizzeStore,
  SYNC_CHANNEL,
  STORE_KEY,
} from '@/lib/model';
import { loadStore, saveStore } from '@/lib/store';
import { TeamsLogin } from './TeamsLogin';
import { CoordinatorSetup } from './CoordinatorSetup';
import { CoordinatorFeed } from './CoordinatorFeed';
import { CollaboratorFeed } from './CollaboratorFeed';
import { AnalysisView } from './AnalysisView';
import { TeamView } from './TeamView';
import { SettingsView } from './SettingsView';
import { UsabilityTestPanel } from './UsabilityTestPanel';
import { SquizzeLogo } from './SquizzeLogo';
import {
  LayoutGrid,
  BarChart3,
  Settings,
  Users as UsersIcon,
  LogOut,
  Bell,
} from 'lucide-react';

export function SquizzeApp() {
  const [store, setStore] = useState<SquizzeStore>(loadStore);
  const [currentUser, setCurrentUser] = useState<UserProfile>(USERS[0]); // Miguel by default, can switch to Laura
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('Feed');
  const [isSettingUpCoordinator, setIsSettingUpCoordinator] = useState<boolean>(false);

  // Cross-tab / Multi-device real-time sync
  useEffect(() => {
    // Initial sync
    setStore(loadStore());

    // Storage event for other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORE_KEY) {
        setStore(loadStore());
      }
    };

    // BroadcastChannel for instant same-browser cross-tab sync
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && typeof window.BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel(SYNC_CHANNEL);
      bc.onmessage = (event) => {
        if (event.data?.type === 'STORE_UPDATED') {
          setStore(loadStore());
        }
      };
    }

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, []);

  const handleUpdateStore = useCallback((nextStore: SquizzeStore) => {
    setStore(nextStore);
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setActiveTab('Feed');

    // If Miguel logs in and hasn't finished setup, show setup flow
    if (user.roleType === 'coordinator' && !store.coordinatorSetupDone) {
      setIsSettingUpCoordinator(true);
    } else {
      setIsSettingUpCoordinator(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsSettingUpCoordinator(false);
    setActiveTab('Feed');
  };

  const handleCompleteCoordinatorSetup = (selectedIds: string[]) => {
    const nextStore: SquizzeStore = {
      ...store,
      selectedMemberIds: selectedIds,
      coordinatorSetupDone: true,
      coordinatorAcceptedPrivacy: true,
    };
    saveStore(nextStore);
    setStore(nextStore);
    setIsSettingUpCoordinator(false);
    setActiveTab('Feed');
  };

  const handleSwitchUserFromPanel = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setIsSettingUpCoordinator(false);
  };

  // 1. Unauthenticated: Show Teams Login Screen (Image 5)
  if (!isLoggedIn) {
    return (
      <>
        <TeamsLogin
          onLoginSuccess={handleLoginSuccess}
          currentUser={currentUser}
          onUserSelect={setCurrentUser}
        />
        <UsabilityTestPanel
          currentUser={currentUser}
          onSwitchUser={handleSwitchUserFromPanel}
          store={store}
          onUpdateStore={handleUpdateStore}
          onNavigateTab={setActiveTab}
          onSimulateError={() => {}}
        />
      </>
    );
  }

  // 2. Coordinator Onboarding / Setup Flow (Images 6, 7, 8, 9)
  if (currentUser.roleType === 'coordinator' && isSettingUpCoordinator) {
    return (
      <>
        <CoordinatorSetup
          currentUser={currentUser}
          initialSelectedMemberIds={store.selectedMemberIds}
          onCompleteSetup={handleCompleteCoordinatorSetup}
          onLogout={handleLogout}
        />
        <UsabilityTestPanel
          currentUser={currentUser}
          onSwitchUser={handleSwitchUserFromPanel}
          store={store}
          onUpdateStore={handleUpdateStore}
          onNavigateTab={setActiveTab}
          onSimulateError={() => {}}
        />
      </>
    );
  }

  // 3. Tab views when NOT on Feed
  if (activeTab === 'Análisis') {
    return (
      <div className="app-workspace">
        <aside className="app-sidebar">
          <div className="sidebar-logo-container">
            <SquizzeLogo variant="light" size="sm" />
          </div>
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => setActiveTab('Feed')}>
              <LayoutGrid size={16} />
              <span>Feed</span>
            </button>
            <button className="nav-item active" onClick={() => setActiveTab('Análisis')}>
              <BarChart3 size={16} />
              <span>Análisis</span>
            </button>
            <button className="nav-item" onClick={() => setActiveTab('Configuración')}>
              <Settings size={16} />
              <span>Configuración</span>
            </button>
            <button className="nav-item" onClick={() => setActiveTab('Equipo')}>
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
                <span className="profile-user-role">
                  {currentUser.roleType === 'coordinator' ? 'Coordinador' : 'Colaboradora'}
                </span>
              </div>
              <button className="sidebar-logout-icon" title="Cerrar sesión" onClick={handleLogout}>
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>

        <main className="app-main-pane">
          <header className="app-top-header">
            <div className="header-greeting-wrap">
              <h2 className="header-greeting-title">Buenos días, {currentUser.name}</h2>
              <span className="header-greeting-sub">¿Cómo va tu ritmo hoy?</span>
            </div>
          </header>
          <AnalysisView currentUser={currentUser} store={store} />
        </main>

        <UsabilityTestPanel
          currentUser={currentUser}
          onSwitchUser={handleSwitchUserFromPanel}
          store={store}
          onUpdateStore={handleUpdateStore}
          onNavigateTab={setActiveTab}
          onSimulateError={() => {}}
        />
      </div>
    );
  }

  if (activeTab === 'Equipo') {
    return (
      <div className="app-workspace">
        <aside className="app-sidebar">
          <div className="sidebar-logo-container">
            <SquizzeLogo variant="light" size="sm" />
          </div>
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => setActiveTab('Feed')}>
              <LayoutGrid size={16} />
              <span>Feed</span>
            </button>
            <button className="nav-item" onClick={() => setActiveTab('Análisis')}>
              <BarChart3 size={16} />
              <span>Análisis</span>
            </button>
            <button className="nav-item" onClick={() => setActiveTab('Configuración')}>
              <Settings size={16} />
              <span>Configuración</span>
            </button>
            <button className="nav-item active" onClick={() => setActiveTab('Equipo')}>
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
                <span className="profile-user-role">
                  {currentUser.roleType === 'coordinator' ? 'Coordinador' : 'Colaboradora'}
                </span>
              </div>
              <button className="sidebar-logout-icon" title="Cerrar sesión" onClick={handleLogout}>
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>

        <main className="app-main-pane">
          <header className="app-top-header">
            <div className="header-greeting-wrap">
              <h2 className="header-greeting-title">Buenos días, {currentUser.name}</h2>
              <span className="header-greeting-sub">¿Cómo va tu ritmo hoy?</span>
            </div>
          </header>
          <TeamView
            currentUser={currentUser}
            store={store}
            onEditTeamClick={() => setIsSettingUpCoordinator(true)}
          />
        </main>

        <UsabilityTestPanel
          currentUser={currentUser}
          onSwitchUser={handleSwitchUserFromPanel}
          store={store}
          onUpdateStore={handleUpdateStore}
          onNavigateTab={setActiveTab}
          onSimulateError={() => {}}
        />
      </div>
    );
  }

  if (activeTab === 'Configuración') {
    return (
      <div className="app-workspace">
        <aside className="app-sidebar">
          <div className="sidebar-logo-container">
            <SquizzeLogo variant="light" size="sm" />
          </div>
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => setActiveTab('Feed')}>
              <LayoutGrid size={16} />
              <span>Feed</span>
            </button>
            <button className="nav-item" onClick={() => setActiveTab('Análisis')}>
              <BarChart3 size={16} />
              <span>Análisis</span>
            </button>
            <button className="nav-item active" onClick={() => setActiveTab('Configuración')}>
              <Settings size={16} />
              <span>Configuración</span>
            </button>
            <button className="nav-item" onClick={() => setActiveTab('Equipo')}>
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
                <span className="profile-user-role">
                  {currentUser.roleType === 'coordinator' ? 'Coordinador' : 'Colaboradora'}
                </span>
              </div>
              <button className="sidebar-logout-icon" title="Cerrar sesión" onClick={handleLogout}>
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>

        <main className="app-main-pane">
          <header className="app-top-header">
            <div className="header-greeting-wrap">
              <h2 className="header-greeting-title">Buenos días, {currentUser.name}</h2>
              <span className="header-greeting-sub">¿Cómo va tu ritmo hoy?</span>
            </div>
          </header>
          <SettingsView
            currentUser={currentUser}
            store={store}
            onReopenSetup={() => setIsSettingUpCoordinator(true)}
            onResetTodayCounts={() => {
              const next = { ...store, records: store.records.filter((r) => r.day !== 'today') };
              saveStore(next);
              setStore(next);
            }}
          />
        </main>

        <UsabilityTestPanel
          currentUser={currentUser}
          onSwitchUser={handleSwitchUserFromPanel}
          store={store}
          onUpdateStore={handleUpdateStore}
          onNavigateTab={setActiveTab}
          onSimulateError={() => {}}
        />
      </div>
    );
  }

  // 4. FEED PRINCIPAL
  return (
    <>
      {currentUser.roleType === 'coordinator' ? (
        <CoordinatorFeed
          currentUser={currentUser}
          store={store}
          onUpdateStore={handleUpdateStore}
          onNavigateTab={setActiveTab}
          activeTab={activeTab}
          onLogout={handleLogout}
        />
      ) : (
        <CollaboratorFeed
          currentUser={currentUser}
          store={store}
          onUpdateStore={handleUpdateStore}
          onNavigateTab={setActiveTab}
          activeTab={activeTab}
          onLogout={handleLogout}
        />
      )}

      {/* Floating Usability Testing Tool */}
      <UsabilityTestPanel
        currentUser={currentUser}
        onSwitchUser={handleSwitchUserFromPanel}
        store={store}
        onUpdateStore={handleUpdateStore}
        onNavigateTab={setActiveTab}
        onSimulateError={() => {}}
      />
    </>
  );
}
