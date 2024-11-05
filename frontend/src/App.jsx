import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import {
  ClientList,
  ClientDetail,
  ClientForm,
  StatsCard
} from './components/clients';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            {/* Dashboard */}
            <Route 
              path="/" 
              element={
                <div className="p-8 space-y-6">
                  <h1 className="text-2xl font-bold">Tableau de bord</h1>
                  <StatsCard />
                </div>
              } 
            />
            
            {/* Clients Routes */}
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/nouveau" element={<ClientForm />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/clients/:id/edit" element={<ClientForm />} />
            
            {/* Stats */}
            <Route 
              path="/stats" 
              element={
                <div className="p-8 space-y-6">
                  <h1 className="text-2xl font-bold">Statistiques</h1>
                  <StatsCard />
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
