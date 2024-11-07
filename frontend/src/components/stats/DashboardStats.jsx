import React, { useState, useEffect } from 'react';
import { User, Building2, AlertCircle, Clock, ArrowUpRight } from 'lucide-react';

function DashboardStats() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/dashboard');
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données du tableau de bord');
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Erreur détaillée:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-40 bg-gray-200 rounded"></div>
        <div className="h-60 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        {error}
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="space-y-6">
      {/* Statistiques des affaires */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Affaires</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">En cours</p>
            <p className="text-2xl font-semibold">{dashboardData.deals.ongoing}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Clôturées</p>
            <p className="text-2xl font-semibold">{dashboardData.deals.closed}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-semibold">{dashboardData.deals.total}</p>
          </div>
        </div>
      </div>

      {/* Répartition par propriétaire */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Répartition par propriétaire</h3>
        <div className="space-y-3">
          {dashboardData.by_owner.map((owner, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{owner.owner}</p>
                  <p className="text-sm text-gray-500">
                    {owner.ongoing_deals} affaires en cours
                  </p>
                </div>
              </div>
              <p className="font-semibold">{owner.total_companies} clients</p>
            </div>
          ))}
        </div>
      </div>

      {/* Entreprises récentes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Entreprises récentes</h3>
        <div className="space-y-3">
          {dashboardData.recent_companies.map((company, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{company.name}</p>
                  <p className="text-sm text-gray-500">{company.owner}</p>
                </div>
              </div>
              {company.ongoing_deals > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <Clock className="h-4 w-4" />
                  <span>{company.ongoing_deals} en cours</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;