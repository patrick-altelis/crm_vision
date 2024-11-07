import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import {
  ClientList,
  ClientDetail,
  ClientForm,
} from './components/clients';
import { StatsCard, DashboardStats } from './components/stats';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            {/* Dashboard - vue simplifiée */}
            <Route 
              path="/" 
              element={
                <div className="p-8 space-y-6">
                  <h1 className="text-2xl font-bold">Tableau de bord</h1>
                  <StatsCard />
                  {/* Seulement les 3 entreprises les plus récentes */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Activité récente</h2>
                    <p className="text-sm text-gray-600">
                      Voir la page Statistiques pour plus de détails
                    </p>
                  </div>
                </div>
              } 
            />
            
            {/* Clients Routes */}
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/nouveau" element={<ClientForm />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/clients/:id/edit" element={<ClientForm />} />
            
            {/* Stats - vue détaillée complète */}
            <Route 
              path="/stats" 
              element={
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Statistiques détaillées</h1>
                    <div className="text-sm text-gray-600">
                      Dernière mise à jour : {new Date().toLocaleDateString()}
                    </div>
                  </div>

                  <section className="grid gap-6">
                    {/* Vue d'ensemble */}
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Vue d'ensemble</h2>
                      <StatsCard />
                    </div>

                    {/* Analyse détaillée */}
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Analyse détaillée</h2>
                      <DashboardStats />
                    </div>

                    {/* Section supplémentaire pour les stats */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-lg font-semibold mb-4">
                        Résumé des performances
                      </h2>
                      <div className="text-sm text-gray-600">
                        Ces statistiques sont mises à jour en temps réel.
                      </div>
                    </div>
                  </section>
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;