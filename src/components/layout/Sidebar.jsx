import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PlusCircle, BarChart } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Tableau de bord', 
      path: '/' 
    },
    { 
      icon: Users, 
      label: 'Liste des clients', 
      path: '/clients' 
    },
    { 
      icon: PlusCircle, 
      label: 'Nouveau client', 
      path: '/clients/nouveau' 
    },
    { 
      icon: BarChart, 
      label: 'Statistiques', 
      path: '/stats' 
    }
  ];

  return (
    <div className="w-64 bg-white border-r min-h-screen">
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-bold text-gray-800">CRM BDD</h1>
      </div>
      
      <nav className="p-4">
        {menuItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`
              flex items-center space-x-2 px-4 py-2.5 rounded-lg mb-1
              transition-colors duration-200
              ${location.pathname === path
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;