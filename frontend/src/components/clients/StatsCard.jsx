import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, Building2 } from 'lucide-react';

export function StatsCard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsResponse, ownerStatsResponse] = await Promise.all([
        fetch('/api/companies/stats'),
        fetch('/api/companies/stats/by-owner')
      ]);

      const stats = await statsResponse.json();
      const ownerStats = await ownerStatsResponse.json();

      setStats({
        ...stats,
        byOwner: ownerStats
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: 'Total Clients',
      value: stats.total_companies,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Clients Actifs',
      value: stats.companies_with_ongoing_deals,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Taux d\'activité',
      value: `${((stats.companies_with_ongoing_deals / stats.total_companies) * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Moyenne affaires/client',
      value: (stats.total_ongoing_deals / stats.total_companies).toFixed(1),
      icon: BarChart2,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-2xl font-semibold mt-1">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.byOwner && stats.byOwner.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Répartition par propriétaire</h3>
          <div className="space-y-3">
            {stats.byOwner.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-2" />
                  <span>{stat.owner || 'Non assigné'}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">{stat.count}</span>
                  <span className="text-gray-500 text-sm ml-1">clients</span>
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
