from sqlalchemy import create_engine, text
from typing import Dict, List

class AutoComplete:
    def __init__(self):
        # Configuration de la base de données
        DB_USER = "postgres.mtfwvdvimpyoocpfpewf"
        DB_PASSWORD = "_eH`&A}=*o]uP;4Rt+"
        DB_HOST = "aws-0-eu-west-3.pooler.supabase.com"
        DB_NAME = "postgres"
        
        # Création de la connexion
        DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}"
        self.engine = create_engine(DATABASE_URL)
    
    def search(self, query: str, limit: int = 5) -> Dict[str, List[Dict]]:
        """
        Recherche les correspondances dans les entreprises et contacts
        en utilisant la recherche floue
        """
        with self.engine.connect() as conn:
            # Recherche dans les entreprises
            company_query = text("""
                WITH scored_companies AS (
                    SELECT 
                        company_name, 
                        address, 
                        work_phone, 
                        work_email,
                        similarity(LOWER(company_name), LOWER(:query)) as name_score,
                        similarity(LOWER(COALESCE(address, '')), LOWER(:query)) as address_score
                    FROM companies 
                    WHERE 
                        company_name % :query
                        OR LOWER(company_name) LIKE LOWER(:search_pattern)
                        OR address % :query
                        OR LOWER(COALESCE(address, '')) LIKE LOWER(:search_pattern)
                )
                SELECT 
                    company_name, 
                    address, 
                    work_phone, 
                    work_email,
                    GREATEST(name_score, address_score) as score
                FROM scored_companies
                ORDER BY score DESC
                LIMIT :limit
            """)
            
            # Recherche dans les contacts
            contact_query = text("""
                WITH scored_contacts AS (
                    SELECT 
                        contact_name, 
                        company_name, 
                        work_email, 
                        COALESCE(mobile_phone, work_phone) as phone,
                        similarity(LOWER(contact_name), LOWER(:query)) as name_score,
                        similarity(LOWER(COALESCE(company_name, '')), LOWER(:query)) as company_score
                    FROM companies 
                    WHERE 
                        contact_name % :query
                        OR LOWER(contact_name) LIKE LOWER(:search_pattern)
                        OR company_name % :query
                        OR LOWER(COALESCE(company_name, '')) LIKE LOWER(:search_pattern)
                )
                SELECT 
                    contact_name, 
                    company_name, 
                    work_email, 
                    phone,
                    GREATEST(name_score, company_score) as score
                FROM scored_contacts
                ORDER BY score DESC
                LIMIT :limit
            """)
            
            # Paramètres de recherche
            search_pattern = f"%{query}%"
            params = {
                "query": query, 
                "search_pattern": search_pattern,
                "limit": limit
            }
            
            # Exécution des requêtes
            companies = conn.execute(company_query, params).fetchall()
            contacts = conn.execute(contact_query, params).fetchall()
            
            # Formatage des résultats
            return {
                'companies': [
                    {
                        'name': company[0],
                        'address': company[1],
                        'phone': company[2],
                        'email': company[3],
                        'score': round(float(company[4]) * 100, 1) if company[4] else 0
                    } for company in companies
                ],
                'contacts': [
                    {
                        'name': contact[0],
                        'company': contact[1],
                        'email': contact[2],
                        'phone': contact[3],
                        'score': round(float(contact[4]) * 100, 1) if contact[4] else 0
                    } for contact in contacts
                ]
            }

def demo_search():
    """
    Fonction de démonstration interactive
    """
    try:
        print("🔍 Initialisation de la recherche...")
        searcher = AutoComplete()
        print("✅ Connexion établie !")
        print("\nCette recherche inclut :")
        print("- 🏢 Les noms d'entreprises")
        print("- 👤 Les noms des contacts")
        print("- 📍 Les adresses")
        print("- ✨ Recherche approximative (tolère les fautes de frappe)")
        print("Les résultats sont triés par pertinence")
        
        while True:
            query = input("\nRechercher (minimum 2 caractères, 'q' pour quitter): ")
            
            if query.lower() == 'q':
                print("\n👋 Au revoir !")
                break
                
            if len(query) < 2:
                print("⚠️  Veuillez entrer au moins 2 caractères")
                continue
            
            print("\n🔍 Recherche en cours...")
            results = searcher.search(query)
            
            # Affichage des entreprises
            if results['companies']:
                print("\n🏢 Entreprises trouvées:")
                for i, company in enumerate(results['companies'], 1):
                    print(f"\n{i}. {company['name']} (pertinence: {company['score']}%)")
                    print(f"   📍 {company['address'] if company['address'] else 'Adresse non renseignée'}")
                    print(f"   ☎️ {company['phone'] if company['phone'] else 'Téléphone non renseigné'}")
                    print(f"   ✉️ {company['email'] if company['email'] else 'Email non renseigné'}")
            
            # Affichage des contacts
            if results['contacts']:
                print("\n👤 Contacts trouvés:")
                for i, contact in enumerate(results['contacts'], 1):
                    print(f"\n{i}. {contact['name']} (pertinence: {contact['score']}%)")
                    print(f"   🏢 {contact['company'] if contact['company'] else 'Entreprise non renseignée'}")
                    print(f"   ☎️ {contact['phone'] if contact['phone'] else 'Téléphone non renseigné'}")
                    print(f"   ✉️ {contact['email'] if contact['email'] else 'Email non renseigné'}")
            
            if not results['companies'] and not results['contacts']:
                print("\n❌ Aucun résultat trouvé")
            else:
                total = len(results['companies']) + len(results['contacts'])
                print(f"\n📊 Total des résultats : {total}")

    except Exception as e:
        print(f"\n❌ Erreur : {str(e)}")
        print("Contactez le support technique si l'erreur persiste")

if __name__ == "__main__":
    demo_search()