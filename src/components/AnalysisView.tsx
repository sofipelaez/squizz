'use client';

import React from 'react';
import { UserProfile, SquizzeStore, getTodayKey } from '@/lib/model';
import { EyeOff, ShieldCheck, Lock, AlertCircle, BarChart3, TrendingUp, Sparkles } from 'lucide-react';

interface AnalysisViewProps {
  currentUser: UserProfile;
  store: SquizzeStore;
}

export function AnalysisView({ currentUser, store }: AnalysisViewProps) {
  const isCoordinator = currentUser.roleType === 'coordinator';
  const today = getTodayKey();

  // Distinct members who have registered squishes this week
  const distinctContributorsThisWeek = Array.from(
    new Set(store.records.map((r) => r.userId))
  );

  // Privacy Rule: Coordinator needs at least 3 distinct contributors to see aggregated trend
  const hasEnoughDataForPrivacy = distinctContributorsThisWeek.length >= 3;

  // Days of week
  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const distToMon = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distToMon);

  const teamWeeklyData = daysOfWeek.map((dayLabel, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayRecords = store.records.filter((r) => r.day === key);
    return {
      dayLabel,
      key,
      totalCount: dayRecords.length,
      contributorsCount: new Set(dayRecords.map((r) => r.userId)).size,
    };
  });

  const userWeeklyData = daysOfWeek.map((dayLabel, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayRecords = store.records.filter(
      (r) => r.userId === currentUser.id && r.day === key
    );
    return {
      dayLabel,
      key,
      count: dayRecords.length,
    };
  });

  return (
    <div className="tab-page-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">
            {isCoordinator ? 'Tendencia Colectiva del Equipo' : 'Mi Análisis Semanal'}
          </h1>
          <p className="page-main-sub">
            {isCoordinator
              ? 'Información agrupada para reconocer patrones y cuidar el ritmo general.'
              : 'Resumen privado de tus registros para reconocer cómo varía tu jornada.'}
          </p>
        </div>

        <div className="privacy-badge-indicator">
          {isCoordinator ? (
            <>
              <ShieldCheck size={16} />
              <span>Privacidad Agregada (Mín. 3 personas)</span>
            </>
          ) : (
            <>
              <Lock size={16} />
              <span>100% Privado para ti</span>
            </>
          )}
        </div>
      </div>

      {isCoordinator ? (
        /* VISTA COORDINADOR */
        !hasEnoughDataForPrivacy ? (
          <div className="privacy-locked-card">
            <AlertCircle size={32} color="#8A2E2B" />
            <h3>Aún no hay datos suficientes esta semana</h3>
            <p>
              Con menos de 3 personas que hayan reportado señales no podemos mostrar la tendencia
              para proteger la privacidad individual de cada integrante.
            </p>
            <span className="privacy-pill-sub">
              Participantes actuales con señal esta semana: {distinctContributorsThisWeek.length}/3 necesarios
            </span>
          </div>
        ) : (
          <div className="analysis-grid-layout">
            <div className="feed-card analysis-chart-card">
              <h3 className="card-box-title">Distribución semanal de señales colectivas</h3>
              <p className="card-expl-text">
                Muestra la concentración de señales por día sin revelar identidades.
              </p>

              <div className="chart-bars-container large">
                {teamWeeklyData.map((d) => {
                  const maxVal = Math.max(...teamWeeklyData.map((x) => x.totalCount), 6);
                  const pct = Math.max(12, Math.round((d.totalCount / maxVal) * 88));
                  return (
                    <div key={d.dayLabel} className="chart-bar-column">
                      <span className="chart-bar-value">{d.totalCount}</span>
                      <div className="bar-track">
                        <div
                          className={`bar-fill ${d.totalCount >= 5 ? 'peak-bar' : ''}`}
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <span className="chart-day-label">{d.dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="feed-card analysis-insights-card">
              <h3 className="card-box-title">Observaciones de carga</h3>
              <ul className="recommendations-list">
                <li>
                  <strong>Pico de la semana:</strong> Miércoles presentó la mayor concentración de squishazos.
                </li>
                <li>
                  <strong>Recomendación:</strong> Evaluar mover entregas de mitad de semana hacia el jueves o viernes.
                </li>
                <li>
                  <strong>Tendencia:</strong> El ritmo promedio se mantiene dentro de parámetros sostenibles los lunes y viernes.
                </li>
              </ul>
            </div>
          </div>
        )
      ) : (
        /* VISTA COLABORADORA (LAURA) */
        <div className="analysis-grid-layout">
          <div className="feed-card analysis-chart-card">
            <h3 className="card-box-title">Tus squishazos por día</h3>
            <p className="card-expl-text">
              Solo tú puedes ver este gráfico. No es compartido con Miguel ni con tus compañeros.
            </p>

            <div className="chart-bars-container large">
              {userWeeklyData.map((d) => {
                const pct = Math.max(12, Math.round((d.count / 5) * 88));
                return (
                  <div key={d.dayLabel} className="chart-bar-column">
                    <span className="chart-bar-value">{d.count}</span>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${d.count >= 5 ? 'peak-bar' : ''}`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className="chart-day-label">{d.dayLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="feed-card analysis-insights-card">
            <h3 className="card-box-title">Consejos para tu ritmo</h3>
            <ul className="recommendations-list">
              <li>
                Identifica las franjas horarias con más interrupciones y bloquea tu calendario.
              </li>
              <li>
                Cuando llegues a 3 squishazos, toma un descanso breve de 5 minutos.
              </li>
              <li>
                Recuerda que tus señales anónimas ayudan a que el coordinador implemente medidas como bloques sin reuniones.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
