import React from 'react';
import { StatsCard, DashboardStats } from '../stats';

function DashboardLayout() {
  return (
    <div className="p-8 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
      </div>

      {/* Vue d'ensemble */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-700">Vue d'ensemble</h2>
        <StatsCard />
      </section>

      {/* Statistiques détaillées */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-700">Détails</h2>
        <DashboardStats />
      </section>

      {/* Timeline si vous voulez la garder */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-700">Activités récentes</h2>
        <ActivityTimeline />
      </section>
    </div>
  );
}

export default DashboardLayout;