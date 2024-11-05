import React, { useState, useEffect } from 'react';
import { SearchBar } from './SearchBar';
import { 
 Building2, Phone, Mail, MapPin, Tags, 
 BarChart2, ChevronDown, ChevronUp, 
 ArrowUpDown
} from 'lucide-react';

export function ClientList() {
 const [clients, setClients] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [sortConfig, setSortConfig] = useState({
   key: 'id',
   direction: 'desc'  // Par défaut, tri par ID décroissant
 });

 useEffect(() => {
   fetchClients();
 }, []);

 const fetchClients = async () => {
   try {
     const response = await fetch('/api/companies');
     if (!response.ok) throw new Error('Erreur lors du chargement des clients');
     const data = await response.json();
     setClients(data);
   } catch (err) {
     setError(err.message);
   } finally {
     setLoading(false);
   }
 };

 const handleSort = (key) => {
   let direction = 'asc';
   if (sortConfig.key === key && sortConfig.direction === 'asc') {
     direction = 'desc';
   }
   setSortConfig({ key, direction });
 };

 const sortedClients = React.useMemo(() => {
   let sortedItems = [...clients];
   if (sortConfig.key) {
     sortedItems.sort((a, b) => {
       // Gestion des valeurs nulles ou undefined
       if (!a[sortConfig.key] && !b[sortConfig.key]) return b.id - a.id; // Tri par ID si les deux valeurs sont nulles
       if (!a[sortConfig.key]) return 1;
       if (!b[sortConfig.key]) return -1;

       // Pour le tri par ID
       if (sortConfig.key === 'id') {
         return sortConfig.direction === 'asc' ? a.id - b.id : b.id - a.id;
       }

       // Pour le tri alphabétique
       const aValue = String(a[sortConfig.key]).toLowerCase();
       const bValue = String(b[sortConfig.key]).toLowerCase();

       // Si les valeurs sont égales, trier par ID décroissant
       if (aValue === bValue) {
         return b.id - a.id;
       }

       // Tri principal selon la direction
       return sortConfig.direction === 'asc'
         ? aValue.localeCompare(bValue, 'fr')  // Utilisation du locale français
         : bValue.localeCompare(aValue, 'fr');
     });
   }
   return sortedItems;
 }, [clients, sortConfig]);

 const SortIcon = ({ column }) => {
   if (sortConfig.key !== column) {
     return <ArrowUpDown className="h-4 w-4" />;
   }
   return sortConfig.direction === 'asc' ? 
     <ChevronUp className="h-4 w-4" /> : 
     <ChevronDown className="h-4 w-4" />;
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

 return (
   <div className="h-screen flex flex-col p-8">
     <div className="flex-none space-y-6">
       <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold">Clients</h1>
         <button 
           className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
           onClick={() => window.location.href = '/clients/nouveau'}
         >
           Nouveau client
         </button>
       </div>

       <SearchBar onSearch={results => console.log('Résultats:', results)} />
     </div>

     <div className="flex-1 overflow-auto mt-6">
       <div className="bg-white rounded-lg shadow overflow-hidden">
         <table className="min-w-full divide-y divide-gray-200">
           <thead className="bg-gray-50 sticky top-0">
             <tr>
               <th 
                 className="px-6 py-3 text-left cursor-pointer hover:bg-gray-100 transition"
                 onClick={() => handleSort('company_name')}
               >
                 <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Entreprise
                   <SortIcon column="company_name" />
                 </div>
               </th>
               <th className="px-6 py-3 text-left">
                 <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Contact
                 </div>
               </th>
               <th className="px-6 py-3 text-left">
                 <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Coordonnées
                 </div>
               </th>
               <th className="px-6 py-3 text-left">
                 <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Activité
                 </div>
               </th>
             </tr>
           </thead>
           <tbody className="bg-white divide-y divide-gray-200">
             {sortedClients.map((client) => (
               <tr 
                 key={client.id}
                 className="hover:bg-gray-50 cursor-pointer transition"
                 onClick={() => window.location.href = `/clients/${client.id}`}
               >
                 <td className="px-6 py-4">
                   <div className="flex items-start gap-2">
                     <Building2 className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                     <div>
                       <div className="font-medium text-gray-900">{client.company_name || "Sans nom"}</div>
                       {client.organization && (
                         <div className="text-sm text-gray-500">{client.organization}</div>
                       )}
                       {client.address && (
                         <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                           <MapPin className="h-4 w-4" />
                           <span className="truncate max-w-xs">{client.address}</span>
                         </div>
                       )}
                     </div>
                   </div>
                 </td>
                 <td className="px-6 py-4">
                   <div className="text-sm">
                     {client.contact_name && (
                       <div className="font-medium text-gray-900">{client.contact_name}</div>
                     )}
                     {client.owner && (
                       <div className="text-gray-500">Géré par: {client.owner}</div>
                     )}
                   </div>
                 </td>
                 <td className="px-6 py-4">
                   <div className="text-sm space-y-1">
                     {client.work_email && (
                       <div className="flex items-center gap-2 text-gray-500">
                         <Mail className="h-4 w-4" />
                         <span>{client.work_email}</span>
                       </div>
                     )}
                     {client.work_phone && (
                       <div className="flex items-center gap-2 text-gray-500">
                         <Phone className="h-4 w-4" />
                         <span>{client.work_phone}</span>
                       </div>
                     )}
                   </div>
                 </td>
                 <td className="px-6 py-4">
                   <div className="text-sm">
                     {(client.closed_deals > 0 || client.ongoing_deals > 0) && (
                       <div className="flex items-center gap-2 text-gray-600">
                         <BarChart2 className="h-4 w-4" />
                         <span>
                           {client.closed_deals || 0} clôturée{client.closed_deals !== 1 ? 's' : ''} 
                           {client.ongoing_deals > 0 && ` • ${client.ongoing_deals} en cours`}
                         </span>
                       </div>
                     )}
                     {client.tags && (
                       <div className="flex items-center gap-2 text-gray-500 mt-1">
                         <Tags className="h-4 w-4" />
                         <span>{client.tags}</span>
                       </div>
                     )}
                   </div>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </div>
   </div>
 );
}

export default ClientList;
