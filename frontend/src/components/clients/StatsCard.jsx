import React, { useState, useEffect } from 'react';
import { BarChart2, Users, Building2, AlertCircle, User } from 'lucide-react';

function StatsCard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const generalStatsResponse = await fetch('/api/companies/stats');
        const generalStats = await generalStatsResponse.json();

        if (!generalStatsResponse.ok) {
          throw new Error('Erreur lors de la récupération des statistiques générales');
        }

        const ownerStatsResponse = await fetch('/api/companies/stats/by-owner');
        const ownerStats = await ownerStatsResponse.json();

        if (!ownerStatsResponse.ok) {
          console.error('Erreur stats propriétaire:', ownerStats);
          throw new Error(ownerStats.error || 'Erreur lors de la récupération des statistiques par propriétaire');
        }

        setStats({
          ...generalStats,
          byOwner: ownerStats
        });
      } catch (error) {
        console.error('Erreur détaillée:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
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

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-semibold mt-1">{stats.total_companies || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clients Actifs</p>
              <p className="text-2xl font-semibold mt-1">{stats.companies_with_ongoing_deals || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux d'activité</p>
              <p className="text-2xl font-semibold mt-1">
                {stats.total_companies 
                  ? `${((stats.companies_with_ongoing_deals / stats.total_companies) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {stats.byOwner && stats.byOwner.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Répartition par propriétaire</h3>
          <div className="grid gap-3">
            {stats.byOwner.map((stat, index) => (
              <div key={index} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">{stat.owner || 'Non assigné'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{stat.count}</span>
                  <span className="text-gray-500 text-sm">clients</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsCard;
export { StatsCard };
