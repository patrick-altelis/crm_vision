from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from supabase import create_client, Client
import traceback
from typing import Dict, List, Any, Optional
from datetime import datetime

# Chargement des variables d'environnement
load_dotenv()

# Configuration Supabase
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# Initialisation de l'application Flask
app = Flask(__name__)
CORS(app)

def handle_error(e: Exception, message: str = "Une erreur est survenue") -> tuple:
    """Gestion centralisée des erreurs"""
    error_details = {
        "error": str(e),
        "message": message,
        "timestamp": datetime.now().isoformat()
    }
    print(f"Erreur: {message} - {str(e)}")
    traceback.print_exc()
    return jsonify(error_details), 500

def get_company_stats(companies: List[Dict]) -> Dict[str, Any]:
    """Calcule les statistiques des entreprises"""
    if not companies:
        return {
            "total_companies": 0,
            "companies_with_deals": 0,
            "ongoing_deals": 0,
            "closed_deals": 0,
            "total_deals": 0,
            "conversion_rate": 0
        }

    companies_with_deals = sum(1 for c in companies if c.get('ongoing_deals', 0) > 0)
    ongoing_deals = sum(c.get('ongoing_deals', 0) for c in companies)
    closed_deals = sum(c.get('closed_deals', 0) for c in companies)
    total_deals = ongoing_deals + closed_deals
    
    return {
        "total_companies": len(companies),
        "companies_with_deals": companies_with_deals,
        "ongoing_deals": ongoing_deals,
        "closed_deals": closed_deals,
        "total_deals": total_deals,
        "conversion_rate": (companies_with_deals / len(companies) * 100) if companies else 0
    }

def get_owner_stats(companies: List[Dict]) -> List[Dict[str, Any]]:
    """Calcule les statistiques par propriétaire"""
    owner_stats = {}
    for company in companies:
        owner = company.get('owner')
        if not owner:
            continue
            
        if owner not in owner_stats:
            owner_stats[owner] = {
                "owner": owner,
                "total_companies": 0,
                "ongoing_deals": 0,
                "closed_deals": 0
            }
            
        stats = owner_stats[owner]
        stats["total_companies"] += 1
        stats["ongoing_deals"] += company.get('ongoing_deals', 0)
        stats["closed_deals"] += company.get('closed_deals', 0)
    
    return sorted(
        owner_stats.values(),
        key=lambda x: (x["ongoing_deals"], x["total_companies"]),
        reverse=True
    )

def get_recent_companies(companies: List[Dict], limit: int = 5) -> List[Dict]:
    """Récupère les entreprises récentes"""
    sorted_companies = sorted(
        companies,
        key=lambda x: x.get('id', 0),
        reverse=True
    )
    
    return [
        {
            "id": company.get('id'),
            "name": company.get('company_name'),
            "owner": company.get('owner'),
            "ongoing_deals": company.get('ongoing_deals', 0),
            "closed_deals": company.get('closed_deals', 0)
        }
        for company in sorted_companies[:limit]
    ]

# Routes de base
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "API is working!", "timestamp": datetime.now().isoformat()})

# Routes statistiques
@app.route('/api/companies/stats', methods=['GET'])
def get_stats():
    """Route pour les statistiques basiques"""
    try:
        response = supabase.from_('companies').select('*').execute()
        companies = response.data if response.data else []
        
        stats = get_company_stats(companies)
        return jsonify({
            "general": {
                "total_companies": stats["total_companies"],
                "companies_with_deals": stats["companies_with_deals"]
            },
            "deals": {
                "ongoing": stats["ongoing_deals"],
                "closed": stats["closed_deals"],
                "total": stats["total_deals"]
            },
            "conversion_rate": stats["conversion_rate"]
        })
        
    except Exception as e:
        return handle_error(e, "Erreur lors de la récupération des statistiques")

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Route pour le tableau de bord complet"""
    try:
        response = supabase.from_('companies').select('*').execute()
        companies = response.data if response.data else []
        
        company_stats = get_company_stats(companies)
        owner_stats = get_owner_stats(companies)
        recent = get_recent_companies(companies, limit=5)
        
        dashboard_data = {
            "stats": {
                "total_companies": company_stats["total_companies"],
                "active_companies": company_stats["companies_with_deals"],
                "conversion_rate": company_stats["conversion_rate"]
            },
            "deals": {
                "ongoing": company_stats["ongoing_deals"],
                "closed": company_stats["closed_deals"],
                "total": company_stats["total_deals"]
            },
            "by_owner": owner_stats,
            "recent_companies": recent
        }
        
        return jsonify(dashboard_data)
        
    except Exception as e:
        return handle_error(e, "Erreur lors de la récupération du tableau de bord")

# Routes CRUD pour les entreprises (inchangées)
@app.route('/api/companies', methods=['GET'])
def get_companies():
    try:
        response = supabase.from_('companies').select('*').execute()
        return jsonify(response.data if response.data else [])
    except Exception as e:
        return handle_error(e, "Erreur lors de la récupération des entreprises")

@app.route('/api/companies/<int:id>', methods=['GET'])
def get_company(id):
    try:
        response = supabase.from_('companies').select('*').eq('id', id).execute()
        if not response.data:
            return jsonify({"error": "Entreprise non trouvée"}), 404
        return jsonify(response.data[0])
    except Exception as e:
        return handle_error(e, f"Erreur lors de la récupération de l'entreprise {id}")

@app.route('/api/companies', methods=['POST'])
def create_company():
    try:
        data = request.json
        required_fields = ['company_name', 'organization']
        
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({
                "error": f"Champs obligatoires manquants: {', '.join(missing_fields)}"
            }), 400

        response = supabase.from_('companies').insert(data).execute()
        return jsonify(response.data), 201
    except Exception as e:
        return handle_error(e, "Erreur lors de la création de l'entreprise")

@app.route('/api/companies/<int:id>', methods=['PUT'])
def update_company(id):
    try:
        data = request.json
        response = supabase.from_('companies').update(data).eq('id', id).execute()
        return jsonify(response.data)
    except Exception as e:
        return handle_error(e, f"Erreur lors de la mise à jour de l'entreprise {id}")

@app.route('/api/companies/<int:id>', methods=['DELETE'])
def delete_company(id):
    try:
        response = supabase.from_('companies').delete().eq('id', id).execute()
        if not response.data:
            return jsonify({"error": "Entreprise non trouvée"}), 404
        return jsonify({"message": "Entreprise supprimée avec succès"}), 200
    except Exception as e:
        return handle_error(e, f"Erreur lors de la suppression de l'entreprise {id}")

# Routes de recherche
@app.route('/api/companies/search', methods=['GET'])
def search_companies():
    try:
        search_term = request.args.get('q', '')
        if not search_term:
            return jsonify({"error": "Paramètre de recherche manquant"}), 400

        response = supabase.from_('companies')\
            .select('*')\
            .or_(f"company_name.ilike.%{search_term}%,organization.ilike.%{search_term}%")\
            .execute()
        
        return jsonify(response.data if response.data else [])
    except Exception as e:
        return handle_error(e, "Erreur lors de la recherche")

@app.route('/api/companies/advanced-search', methods=['GET'])
def advanced_search():
    try:
        filters = {
            'owner': request.args.get('owner'),
            'has_deals': request.args.get('has_deals'),
            'city': request.args.get('city'),
            'search_term': request.args.get('q')
        }

        query = supabase.from_('companies').select('*')

        if filters['owner']:
            query = query.eq('owner', filters['owner'])
        if filters['has_deals'] == 'true':
            query = query.gt('ongoing_deals', 0)
        if filters['city']:
            query = query.ilike('address', f"%{filters['city']}%")
        if filters['search_term']:
            query = query.or_(f"company_name.ilike.%{filters['search_term']}%,organization.ilike.%{filters['search_term']}%")

        response = query.execute()
        return jsonify(response.data if response.data else [])
    except Exception as e:
        return handle_error(e, "Erreur lors de la recherche avancée")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)