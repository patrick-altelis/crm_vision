import React, { useState, useEffect } from 'react';
import { BarChart2, Users, Building2, AlertCircle, TrendingUp } from 'lucide-react';

function StatsCard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/companies/stats');
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des statistiques');
        }

        const data = await response.json();
        setStats(data);
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

  const cards = [
    {
      title: "Total Clients",
      value: stats.general.total_companies,
      icon: <Building2 className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-100"
    },
    {
      title: "Clients Actifs",
      value: stats.general.companies_with_deals,
      icon: <Users className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-100"
    },
    {
      title: "Affaires en cours",
      value: stats.deals.ongoing,
      icon: <TrendingUp className="h-6 w-6 text-yellow-600" />,
      bgColor: "bg-yellow-100"
    },
    {
      title: "Taux de conversion",
      value: `${stats.conversion_rate.toFixed(1)}%`,
      icon: <BarChart2 className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-2xl font-semibold mt-1">{card.value}</p>
            </div>
            <div className={`${card.bgColor} p-3 rounded-lg`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCard;