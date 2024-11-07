# Documentation API CRM Vision

## 🔑 Authentification

L'API utilise l'authentification Supabase. Un token JWT valide doit être inclus dans l'en-tête \`Authorization\` de chaque requête.

## 📊 Endpoints

### Entreprises

#### \`GET /api/companies\`

Récupère la liste de toutes les entreprises.

**Paramètres de requête**
- \`page\` (optionnel): Numéro de page (défaut: 1)
- \`limit\` (optionnel): Nombre d'éléments par page (défaut: 20)
- \`sort\` (optionnel): Champ de tri
- \`order\` (optionnel): Ordre de tri ("asc" ou "desc")

**Réponse**
\`\`\`json
{
  "data": [
    {
      "id": 1,
      "company_name": "Example Corp",
      "organization": "Example Org",
      "contact_name": "John Doe",
      "work_email": "john@example.com",
      "work_phone": "+33123456789",
      "address": "123 Example St",
      "owner": "Patrick",
      "ongoing_deals": 2,
      "closed_deals": 5
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 200
  }
}
\`\`\`

#### \`GET /api/companies/search\`

Recherche d'entreprises.

**Paramètres**
- \`q\`: Terme de recherche
- \`owner\` (optionnel): Filtrer par propriétaire
- \`has_deals\` (optionnel): Filtrer par présence d'affaires

Pour plus de détails sur les autres endpoints, consultez la documentation complète.
