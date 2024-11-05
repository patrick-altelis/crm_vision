import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, Phone, Mail, MapPin, Tags, 
  BarChart2, Calendar, User, Edit, Trash2,
  AlertCircle, Loader2
} from 'lucide-react';

export function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/companies/${id}`);
      if (!response.ok) throw new Error('Client non trouvé');
      const data = await response.json();
      setClient(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      navigate('/clients', { 
        state: { 
          notification: {
            type: 'success',
            message: `${client.company_name} a été supprimé avec succès`
          }
        }
      });
    } catch (err) {
      setError(err.message);
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500 p-4">
        <AlertCircle className="h-5 w-5" />
        {error}
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-gray-500" />
              {client.company_name}
            </h1>
            {client.organization && (
              <p className="text-gray-600 mt-1">{client.organization}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/clients/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg text-red-600 hover:bg-red-50 transition"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Informations contact</h2>
            <div className="space-y-4">
              {client.contact_name && (
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{client.contact_name}</span>
                </div>
              )}
              {client.work_email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{client.work_email}</span>
                </div>
              )}
              {client.work_phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{client.work_phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 mt-1" />
                  <span>{client.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Activité</h2>
            <div className="space-y-4">
              {client.ongoing_deals > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <BarChart2 className="h-4 w-4" />
                  <span>{client.ongoing_deals} affaire(s) en cours</span>
                </div>
              )}
              {client.closed_deals > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <BarChart2 className="h-4 w-4" />
                  <span>{client.closed_deals} affaire(s) clôturée(s)</span>
                </div>
              )}
              {client.next_activity && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Prochaine activité : {new Date(client.next_activity).toLocaleDateString()}</span>
                </div>
              )}
              {client.owner && (
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Géré par : {client.owner}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md m-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer <span className="font-medium">{client.company_name}</span> ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDetail;
