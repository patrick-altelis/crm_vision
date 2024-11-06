from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from supabase import create_client, Client

# Chargement des variables d'environnement
load_dotenv()

# Configuration Supabase
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# Initialisation de l'application Flask
app = Flask(__name__)
CORS(app)

# Route de test
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "API is working!"})

# Route pour récupérer toutes les entreprises
@app.route('/api/companies', methods=['GET'])
def get_companies():
    try:
        response = supabase.table('companies').select("*").execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route pour rechercher des entreprises
@app.route('/api/companies/search', methods=['GET'])
def search_companies():
    try:
        search_term = request.args.get('q', '')
        if not search_term:
            return jsonify({"error": "Paramètre de recherche manquant"}), 400

        response = supabase.table('companies')\
            .select("*")\
            .or_(f"company_name.ilike.%{search_term}%,organization.ilike.%{search_term}%")\
            .execute()
        
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route pour obtenir une entreprise par ID
@app.route('/api/companies/<int:id>', methods=['GET'])
def get_company(id):
    try:
        response = supabase.table('companies').select("*").eq('id', id).execute()
        if not response.data:
            return jsonify({"error": "Entreprise non trouvée"}), 404
        return jsonify(response.data[0])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route pour mettre à jour une entreprise
@app.route('/api/companies/<int:id>', methods=['PUT'])
def update_company(id):
    try:
        data = request.json
        response = supabase.table('companies').update(data).eq('id', id).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route pour créer une nouvelle entreprise
@app.route('/api/companies', methods=['POST'])
def create_company():
    try:
        data = request.json
        required_fields = ['company_name', 'organization']
        
        # Vérification des champs obligatoires
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({
                "error": f"Champs obligatoires manquants: {', '.join(missing_fields)}"
            }), 400

        response = supabase.table('companies').insert(data).execute()
        return jsonify(response.data), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route pour obtenir les statistiques
@app.route('/api/companies/stats', methods=['GET'])
def get_stats():
    try:
        # Nombre total d'entreprises
        total = supabase.table('companies').select("id", count="exact").execute()
        
        # Entreprises avec des affaires en cours
        with_ongoing_deals = supabase.table('companies')\
            .select("id", count="exact")\
            .gt('ongoing_deals', 0)\
            .execute()

        return jsonify({
            "total_companies": total.count,
            "companies_with_ongoing_deals": with_ongoing_deals.count
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route pour recherche avancée avec filtres multiples
@app.route('/api/companies/advanced-search', methods=['GET'])
def advanced_search():
    try:
        # Récupération des paramètres de recherche
        owner = request.args.get('owner')
        has_deals = request.args.get('has_deals')
        city = request.args.get('city')
        search_term = request.args.get('q')

        query = supabase.table('companies').select("*")

        # Application des filtres si présents
        if owner:
            query = query.eq('owner', owner)
        if has_deals == 'true':
            query = query.gt('ongoing_deals', 0)
        if city:
            query = query.ilike('address', f'%{city}%')
        if search_term:
            query = query.or_(f"company_name.ilike.%{search_term}%,organization.ilike.%{search_term}%")

        response = query.execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route pour obtenir les statistiques par propriétaire
@app.route('/api/companies/stats/by-owner', methods=['GET'])
def stats_by_owner():
    try:
        # Modification de la requête Supabase
        response = supabase.table('companies').select(
            "owner", 
            "count"
        ).neq(
            'owner', 
            None
        ).execute()
        
        # Traitement des résultats
        owner_stats = {}
        for row in response.data:
            owner = row.get('owner', 'Non assigné')
            if owner in owner_stats:
                owner_stats[owner] += 1
            else:
                owner_stats[owner] = 1
        
        # Conversion en format attendu
        formatted_stats = [
            {"owner": owner, "count": count}
            for owner, count in owner_stats.items()
        ]
        
        return jsonify(formatted_stats)
    except Exception as e:
        print(f"Erreur dans stats_by_owner: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# Route pour obtenir les entreprises avec activité récente
@app.route('/api/companies/with-activity', methods=['GET'])
def companies_with_activity():
    try:
        response = supabase.table('companies')\
            .select("*")\
            .not_('next_activity', 'is', None)\
            .order('next_activity')\
            .execute()
        
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route de suppression d'une entreprise
@app.route('/api/companies/<int:id>', methods=['DELETE'])
def delete_company(id):
    try:
        response = supabase.table('companies').delete().eq('id', id).execute()
        if not response.data:
            return jsonify({"error": "Entreprise non trouvée"}), 404
        return jsonify({"message": "Entreprise supprimée avec succès"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route pour obtenir le schéma des companies
@app.route('/api/schema/companies', methods=['GET'])
def get_companies_schema():
    try:
        response = supabase.table('companies').select("*").limit(1).execute()
        
        if response.data:
            sample = response.data[0]
            schema = {
                key: {
                    'type': type(value).__name__,
                    'value_example': str(value)[:50] if value is not None else None
                }
                for key, value in sample.items()
            }
            return jsonify(schema)
        return jsonify({"message": "Aucune donnée trouvée dans la table"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route pour nettoyer la structure de la table (doublons)
@app.route('/api/cleanup/duplicates', methods=['POST'])
def cleanup_duplicates():
    try:
        # Construction de la requête SQL pour la mise à jour
        sql = """
        update companies set 
            closed_deals = COALESCE("Affaires clôturées_y", closed_deals),
            ongoing_deals = COALESCE("Affaires en cours_y", ongoing_deals),
            owner = COALESCE("Propriétaire_y", owner);
        """
        # Exécution de la mise à jour
        response = supabase.table('companies').select("*").execute()
        
        return jsonify({"message": "Mise à jour effectuée", "affected_rows": len(response.data)})
    except Exception as e:
        print(f"Erreur : {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/cleanup/addresses', methods=['POST'])
def cleanup_addresses():
    try:
        # Récupérer toutes les entreprises
        response = supabase.table('companies').select("id, address").execute()
        
        updated_count = 0
        for company in response.data:
            if not company['address']:
                continue
                
            # Découper l'adresse sur les virgules
            parts = [part.strip() for part in company['address'].split(',')]
            
            update_data = {}
            
            # Premier élément = adresse de rue
            if len(parts) > 0:
                update_data['address'] = parts[0]
            
            # Deuxième élément = ville
            if len(parts) > 1:
                update_data['city'] = parts[1]
            
            # Ajouter France par défaut si pas de pays
            if len(parts) <= 2:
                update_data['country'] = 'France'
            
            # Mise à jour si nous avons des données
            if update_data:
                supabase.table('companies')\
                    .update(update_data)\
                    .eq('id', company['id'])\
                    .execute()
                updated_count += 1
        
        return jsonify({
            "message": "Adresses mises à jour",
            "updated_count": updated_count
        })
        
    except Exception as e:
        print(f"Erreur dans cleanup_addresses: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/cleanup/addresses/v2', methods=['POST'])
def cleanup_addresses_v2():
   try:
       # Récupérer toutes les entreprises
       response = supabase.table('companies').select("id, address").execute()
       
       updated_count = 0
       for company in response.data:
           if not company['address']:
               continue
               
           # Découper l'adresse sur les virgules
           parts = [part.strip() for part in company['address'].split(',')]
           
           update_data = {
               'country': 'France'  # Ajouter France par défaut
           }
           
           # Traiter la première partie (rue + éventuel code postal)
           if len(parts) > 0:
               street_parts = parts[0].split(' ')
               # Chercher le code postal (5 chiffres)
               postal_code = None
               for part in street_parts:
                   if part.isdigit() and len(part) == 5:
                       postal_code = part
                       street_parts.remove(part)
                       break
               update_data['address'] = ' '.join(street_parts)
               if postal_code:
                   update_data['postal_code'] = postal_code
           
           # Deuxième élément = ville
           if len(parts) > 1:
               city_parts = parts[1].split(' ')
               # Vérifier si un code postal est dans la partie ville
               if city_parts[0].isdigit() and len(city_parts[0]) == 5:
                   update_data['postal_code'] = city_parts[0]
                   update_data['city'] = ' '.join(city_parts[1:])
               else:
                   update_data['city'] = parts[1]
           
           # Mise à jour si nous avons des données
           if update_data:
               supabase.table('companies')\
                   .update(update_data)\
                   .eq('id', company['id'])\
                   .execute()
               updated_count += 1
       
       return jsonify({
           "message": "Adresses mises à jour (v2)",
           "updated_count": updated_count
       })
       
   except Exception as e:
       print(f"Erreur dans cleanup_addresses_v2: {str(e)}")
       return jsonify({"error": str(e)}), 500

@app.route('/api/cleanup/addresses/v3', methods=['POST'])
def cleanup_addresses_v3():
    try:
        response = supabase.table('companies').select("id, address").execute()
        
        updated_count = 0
        for company in response.data:
            if not company['address']:
                continue
            
            address = company['address']
            update_data = {
                'country': 'France'
            }
            
            # Chercher le code postal (format XXXXX)
            import re
            postal_match = re.search(r'\b\d{5}\b', address)
            if postal_match:
                update_data['postal_code'] = postal_match.group(0)
                # Retirer le code postal de l'adresse
                address = address.replace(postal_match.group(0), '').strip()
            
            # Séparer sur les virgules
            parts = [p.strip() for p in address.split(',')]
            
            # Premier élément = rue
            if parts:
                update_data['address'] = parts[0]
            
            # Deuxième élément = ville
            if len(parts) > 1:
                update_data['city'] = parts[1]
            
            # Mise à jour
            if update_data:
                supabase.table('companies')\
                    .update(update_data)\
                    .eq('id', company['id'])\
                    .execute()
                updated_count += 1
        
        return jsonify({
            "message": "Adresses mises à jour (v3)",
            "updated_count": updated_count
        })
        
    except Exception as e:
        print(f"Erreur dans cleanup_addresses_v3: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/cleanup/addresses/v4', methods=['POST'])
def cleanup_addresses_v4():
   try:
       response = supabase.table('companies').select("id, address").execute()
       
       updated_count = 0
       for company in response.data:
           if not company['address']:
               continue
           
           # Données par défaut
           update_data = {
               'country': 'France'
           }
           
           address = company['address']
           
           # Traitement des adresses avec plusieurs lignes (cas spécial)
           if '\n' in address:
               parts = [p.strip() for p in address.split('\n')]
               # Premier élément = rue
               update_data['address'] = parts[0]
               # Dernier élément = ville et code postal
               if len(parts) > 1:
                   city_part = parts[-1]
           else:
               # Pour les adresses sur une seule ligne
               parts = [p.strip() for p in address.split(',')]
               city_part = parts[-1] if len(parts) > 1 else address
               update_data['address'] = parts[0]
           
           # Extraction du code postal (format XXXXX)
           import re
           postal_match = re.search(r'\b\d{5}\b', address)
           if postal_match:
               update_data['postal_code'] = postal_match.group(0)
               # Retirer le code postal de la ville
               city_part = re.sub(r'\b\d{5}\b', '', city_part).strip()
           
           # Nettoyage de la ville
           if len(parts) > 1:
               # Retirer les mentions "France", "Île-de-France", etc.
               city_part = re.sub(r'(?i),?\s*france\b', '', city_part)
               city_part = re.sub(r'(?i),?\s*[îiI]le-[dD]e-[fF]rance\b', '', city_part)
               city_part = re.sub(r'(?i),?\s*nouvelle-aquitaine\b', '', city_part)
               city_part = re.sub(r'(?i),?\s*occitanie\b', '', city_part)
               # Nettoyer les espaces multiples et virgules
               city_part = re.sub(r'\s+', ' ', city_part).strip()
               city_part = re.sub(r'^,\s*|\s*,\s*$', '', city_part)
               
               if city_part:
                   update_data['city'] = city_part
           
           # Mise à jour si nous avons des données
           if len(update_data) > 1:  # Plus que juste le pays
               supabase.table('companies')\
                   .update(update_data)\
                   .eq('id', company['id'])\
                   .execute()
               updated_count += 1
       
       return jsonify({
           "message": "Adresses mises à jour (v4)",
           "updated_count": updated_count
       })
       
   except Exception as e:
       print(f"Erreur dans cleanup_addresses_v4: {str(e)}")
       return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)