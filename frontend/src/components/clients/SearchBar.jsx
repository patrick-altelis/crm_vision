import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length >= 2) {
        try {
          const response = await fetch(`/api/companies/search?q=${encodeURIComponent(query)}`);
          const data = await response.json();
          
          setResults(data);
          if (onSearch) onSearch(data);
        } catch (error) {
          console.error('Erreur de recherche:', error);
          setResults([]);
        }
      } else {
        setResults([]);
      }
    };

    const debounceTimeout = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query, onSearch]);

  const handleCompanyClick = (company) => {
    navigate(`/clients/${company.id}`);
    setQuery(''); // Réinitialise la recherche
    setResults([]); // Vide les résultats
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une entreprise..."
          className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          min={2}
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      
      {results && results.length > 0 && (
        <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border p-2 z-10 max-h-96 overflow-y-auto">
          {results.map((company, i) => (
            <div 
              key={i} 
              className="p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors duration-150"
              onClick={() => handleCompanyClick(company)}
            >
              <div className="font-medium">{company.company_name}</div>
              {company.organization && (
                <div className="text-sm text-gray-600">{company.organization}</div>
              )}
              {company.address && (
                <div className="text-sm text-gray-500">{company.address}</div>
              )}
              <div className="mt-1 flex gap-2 text-xs">
                {company.contact_name && (
                  <span className="text-blue-600">👤 {company.contact_name}</span>
                )}
                {company.work_phone && (
                  <span className="text-gray-600">☎️ {company.work_phone}</span>
                )}
                {company.work_email && (
                  <span className="text-gray-600">✉️ {company.work_email}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
