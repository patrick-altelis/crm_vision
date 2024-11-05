import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, Phone, Mail, MapPin, Tags, 
  User, Euro, Hash, Globe, BookUser,
  ArrowLeft, Save, FileText, CreditCard,
  AlertCircle
} from 'lucide-react';

export function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    organization: '',
    address: '',
    siren: '',
    vat_number: '',
    customer_ref: '',
    revenue: '',
    contact_name: '',
    work_email: '',
    work_phone: '',
    mobile_phone: '',
    home_email: '',
    home_phone: '',
    other_email: '',
    other_phone: '',
    tags: '',
    owner: '',
    ongoing_deals: 0,
    closed_deals: 0,
    next_activity: '',
    invoice_count: 0
  });

  // Nouveau state pour les erreurs
  const [fieldErrors, setFieldErrors] = useState({});

  // Règles de validation basiques
  const validateField = (name, value) => {
    if (!value) return '';

    switch (name) {
      case 'work_email':
      case 'home_email':
      case 'other_email':
        if (value && !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          return "Format d'email invalide";
        }
        break;
      case 'siren':
        if (value && !/^[0-9]{9}$/.test(value)) {
          return "Le SIREN doit contenir exactement 9 chiffres";
        }
        break;
      case 'vat_number':
        if (value && !/^FR[0-9A-Z]{2}[0-9]{9}$/.test(value)) {
          return "Format TVA invalide (ex: FRXX999999999)";
        }
        break;
    }
    return '';
  };

  useEffect(() => {
    if (id) {
      fetchClient();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/companies/${id}`);
      if (!response.ok) throw new Error('Client non trouvé');
      const data = await response.json();
      setFormData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? Number(value) : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validation à la frappe
    const error = validateField(name, newValue);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Valider tous les champs
    const errors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Veuillez corriger les erreurs avant de sauvegarder");
      setLoading(false);
      return;
    }

    try {
      const url = id ? `/api/companies/${id}` : '/api/companies';
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'enregistrement');
      
      navigate('/clients');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formSections = [
    {
      title: "Informations entreprise",
      icon: Building2,
      fields: [
        { name: 'company_name', label: "Nom de l'entreprise", type: 'text', required: true, icon: Building2 },
        { name: 'organization', label: "Organisation", type: 'text', icon: Globe },
        { name: 'address', label: "Adresse", type: 'textarea', icon: MapPin },
        { name: 'siren', label: "SIREN", type: 'text', icon: Hash },
        { name: 'vat_number', label: "Numéro de TVA", type: 'text', icon: CreditCard },
        { name: 'customer_ref', label: "Référence client", type: 'text', icon: FileText },
        { name: 'revenue', label: "Chiffre d'affaires", type: 'number', icon: Euro }
      ]
    },
    {
      title: "Contact principal",
      icon: User,
      fields: [
        { name: 'contact_name', label: "Nom du contact", type: 'text', icon: User },
        { name: 'work_email', label: "Email professionnel", type: 'email', icon: Mail },
        { name: 'work_phone', label: "Téléphone professionnel", type: 'tel', icon: Phone },
        { name: 'mobile_phone', label: "Téléphone mobile", type: 'tel', icon: Phone },
        { name: 'home_email', label: "Email personnel", type: 'email', icon: Mail },
        { name: 'home_phone', label: "Téléphone domicile", type: 'tel', icon: Phone },
        { name: 'other_email', label: "Email alternatif", type: 'email', icon: Mail },
        { name: 'other_phone', label: "Téléphone alternatif", type: 'tel', icon: Phone }
      ]
    },
    {
      title: "Gestion et suivi",
      icon: BookUser,
      fields: [
        { name: 'tags', label: "Tags", type: 'text', icon: Tags },
        { name: 'owner', label: "Propriétaire", type: 'text', icon: User },
        { name: 'ongoing_deals', label: "Affaires en cours", type: 'number', icon: FileText },
        { name: 'closed_deals', label: "Affaires clôturées", type: 'number', icon: FileText },
        { name: 'next_activity', label: "Prochaine activité", type: 'date', icon: FileText },
        { name: 'invoice_count', label: "Nombre de factures", type: 'number', icon: FileText }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="bg-white border-b shadow-sm flex-none">
        <div className="max-w-4xl mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {id ? `Modifier ${formData.company_name}` : 'Nouveau client'}
            </h1>
            <button
              onClick={() => navigate('/clients')}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {formSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <section.icon className="h-5 w-5 text-gray-500" />
                  {section.title}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center gap-2">
                          <field.icon className="h-4 w-4 text-gray-400" />
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </div>
                      </label>
                      
                      <div className="relative">
                        {field.type === 'textarea' ? (
                          <textarea
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            required={field.required}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              fieldErrors[field.name] ? 'border-red-300 bg-red-50' : ''
                            }`}
                            rows={3}
                          />
                        ) : (
                          <input
                            type={field.type}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            required={field.required}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              fieldErrors[field.name] ? 'border-red-300 bg-red-50' : ''
                            }`}
                          />
                        )}

                        {fieldErrors[field.name] && (
                          <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          </div>
                        )}
                      </div>

                      {fieldErrors[field.name] && (
                        <p className="mt-1 text-sm text-red-600">
                          {fieldErrors[field.name]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="h-24"></div>
          </form>
        </div>
      </div>

      <div className="bg-white border-t py-4 px-6 flex-none">
        <div className="max-w-4xl mx-auto flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientForm;
