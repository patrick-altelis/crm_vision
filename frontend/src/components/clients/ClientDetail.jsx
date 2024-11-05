import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, Phone, Mail, MapPin, Tags, 
  BarChart2, Calendar, User, Edit, Trash2,
  AlertCircle, FileText, CreditCard, Users,
  Clock, Euro, Hash, Globe, BookUser
} from 'lucide-react';

export function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      navigate('/clients');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 p-4">
      Erreur: {error}
    </div>
  );

  if (!client) return null;

  const sections = [
    {
      title: "Informations entreprise",
      icon: Building2,
      content: [
        { icon: Building2, label: "Nom", value: client.company_name },
        { icon: Globe, label: "Organisation", value: client.organization },
        { icon: MapPin, label: "Adresse", value: client.address },
        { icon: Hash, label: "SIREN", value: client.siren || 'Non renseigné' },
        { icon: CreditCard, label: "N° TVA", value: client.vat_number || 'Non renseigné' },
        { icon: FileText, label: "Réf. client", value: client.customer_ref || 'Non renseignée' },
        { icon: Euro, label: "Chiffre d'affaires", value: client.revenue ? `${client.revenue}€` : 'Non renseigné' }
      ]
    },
    {
      title: "Contact principal",
      icon: User,
      content: [
        { icon: User, label: "Nom", value: client.contact_name },
        { icon: Mail, label: "Email pro", value: client.work_email },
        { icon: Phone, label: "Tél. pro", value: client.work_phone },
        { icon: Phone, label: "Mobile", value: client.mobile_phone },
        { icon: Mail, label: "Email perso", value: client.home_email },
        { icon: Phone, label: "Tél. domicile", value: client.home_phone },
        { icon: Mail, label: "Email alternatif", value: client.other_email },
        { icon: Phone, label: "Tél. alternatif", value: client.other_phone }
      ]
    },
    {
      title: "Gestion et suivi",
      icon: BookUser,
      content: [
        { icon: Users, label: "Nombre de contacts", value: client.contacts },
        { icon: BookUser, label: "Propriétaire", value: client.owner },
        { icon: Tags, label: "Tags", value: client.tags || 'Aucun tag' },
        { icon: Clock, label: "Prochaine activité", value: formatDate(client.next_activity) },
        { icon: FileText, label: "Nombre de factures", value: client.invoice_count || '0' }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-gray-500" />
            {client.company_name}
          </h1>
          {client.organization && (
            <p className="text-gray-600 mt-1">
              {client.organization}
            </p>
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

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Information sections */}
        {sections.map((section, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <section.icon className="h-5 w-5 text-gray-500" />
              {section.title}
            </h2>
            <div className="space-y-4">
              {section.content.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <item.icon className="h-5 w-5 text-gray-500 mt-1" />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-gray-600">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Metrics card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-gray-500" />
            Métriques
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Affaires en cours</div>
              <div className="text-2xl font-semibold text-blue-600">
                {client.ongoing_deals || 0}
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Affaires clôturées</div>
              <div className="text-2xl font-semibold text-green-600">
                {client.closed_deals || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer {client.company_name} ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDetail;
