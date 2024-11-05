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
        response = supabase.table('companies')\
            .select("owner, count(*)", count="exact")\
            .not_('owner', 'is', None)\
            .group_by('owner')\
            .execute()
        
        return jsonify(response.data)
    except Exception as e:
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
