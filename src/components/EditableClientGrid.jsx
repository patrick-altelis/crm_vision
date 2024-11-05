import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const EditableClientGrid = () => {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const columns = [
    { key: 'id', header: 'ID', type: 'number', editable: false, sortable: true },
    { key: 'company_name', header: 'Nom de l\'entreprise', type: 'text', editable: true, sortable: true, searchable: true },
    { key: 'contact_name', header: 'Nom du contact', type: 'text', editable: true, sortable: true, searchable: true },
    { key: 'work_email', header: 'Email pro.', type: 'email', editable: true, searchable: true },
    { key: 'work_phone', header: 'Téléphone pro.', type: 'tel', editable: true },
    { key: 'mobile_phone', header: 'Mobile', type: 'tel', editable: true },
    { key: 'closed_deals', header: 'Affaires clôturées', type: 'number', editable: true, sortable: true },
    { key: 'ongoing_deals', header: 'Affaires en cours', type: 'number', editable: true, sortable: true },
    { key: 'siren', header: 'SIREN', type: 'text', editable: true, searchable: true },
    { key: 'city', header: 'Ville', type: 'text', editable: true, sortable: true }
  ];

  const fetchData = async () => {
    try {
      let query = supabase
        .from('companies')  // Utilisation de la table companies
        .select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(
          columns
            .filter(col => col.searchable)
            .map(col => `${col.key}.ilike.%${searchTerm}%`)
            .join(',')
        );
      }

      if (sortConfig.key) {
        query = query.order(sortConfig.key, {
          ascending: sortConfig.direction === 'asc'
        });
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data: records, count, error } = await query;

      if (error) throw error;

      setData(records);
      setTotalPages(Math.ceil(count / itemsPerPage));
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      showMessage('Erreur lors du chargement des données', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, sortConfig, searchTerm]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditedData(row);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleChange = (key, value) => {
    let processedValue = value;
    const column = columns.find(col => col.key === key);
    if (column?.type === 'number') {
      processedValue = value === '' ? null : parseFloat(value);
    }
    setEditedData(prev => ({
      ...prev,
      [key]: processedValue
    }));
  };

  const handleSave = async (row) => {
    try {
      const { data: updatedRecord, error } = await supabase
        .from('companies')  // Utilisation de la table companies
        .update(editedData)
        .eq('id', editedData.id)
        .single();

      if (error) throw error;

      setData(prevData =>
        prevData.map(item =>
          item.id === editedData.id ? editedData : item
        )
      );
      setEditingId(null);
      setEditedData({});
      showMessage('Modifications enregistrées avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showMessage('Erreur lors de la sauvegarde', 'error');
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow">
      <div className="mb-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded"
          />
        </div>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded ${
          message.type === 'error' ? 'bg-red-100 text-red-700' :
          message.type === 'success' ? 'bg-green-100 text-green-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto">
        {!data?.length ? (
          <div className="text-center text-gray-500 py-4">
            Aucune donnée disponible
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(column => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && <ArrowUpDown className="h-4 w-4" />}
                    </div>
                  </th>
                ))}
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map(row => (
                <tr key={row.id}>
                  {columns.map(column => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {editingId === row.id && column.editable ? (
                        <input
                          type={column.type}
                          value={editedData[column.key] || ''}
                          onChange={(e) => handleChange(column.key, e.target.value)}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        row[column.key]
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === row.id ? (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleSave(row)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-red-600 hover:text-red-900"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(row)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Modifier
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> sur{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default EditableClientGrid;