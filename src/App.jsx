import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout';
import EditableClientGrid from './components/EditableClientGrid';

// Composant temporaire pour les routes non encore implémentées
const PlaceholderComponent = ({ title }) => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <p className="text-gray-600">Cette page est en cours de développement.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8">
          <Routes>
            <Route 
              path="/" 
              element={<PlaceholderComponent title="Tableau de bord" />} 
            />
            <Route 
              path="/clients" 
              element={<EditableClientGrid />} 
            />
            <Route 
              path="/clients/nouveau" 
              element={<PlaceholderComponent title="Nouveau client" />} 
            />
            <Route 
              path="/stats" 
              element={<PlaceholderComponent title="Statistiques" />} 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;