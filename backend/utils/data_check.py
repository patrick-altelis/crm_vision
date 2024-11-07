import os
from sqlalchemy import create_engine, text

def check_database():
    # Configuration
    DB_USER = "postgres.mtfwvdvimpyoocpfpewf"
    DB_PASSWORD = "_eH`&A}=*o]uP;4Rt+"
    DB_HOST = "aws-0-eu-west-3.pooler.supabase.com"
    DB_NAME = "postgres"
    
    try:
        # Connexion
        DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}"
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            # Vérifier la structure de la table
            print("\n1. Structure de la table companies:")
            columns = conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns
                WHERE table_name = 'companies';
            """)).fetchall()
            
            for col in columns:
                print(f"   - {col[0]}: {col[1]}")
            
            # Compter le nombre total d'enregistrements
            count = conn.execute(text("""
                SELECT COUNT(*) FROM companies;
            """)).scalar()
            
            print(f"\n2. Nombre total d'enregistrements: {count}")
            
            # Afficher quelques exemples
            print("\n3. Exemples d'enregistrements:")
            samples = conn.execute(text("""
                SELECT company_name, contact_name, work_phone, work_email
                FROM companies
                LIMIT 3;
            """)).fetchall()
            
            for sample in samples:
                print(f"\nEntreprise: {sample[0]}")
                print(f"Contact: {sample[1]}")
                print(f"Téléphone: {sample[2]}")
                print(f"Email: {sample[3]}")
            
            # Vérifier les index
            print("\n4. Index existants:")
            indexes = conn.execute(text("""
                SELECT indexname, indexdef
                FROM pg_indexes
                WHERE tablename = 'companies';
            """)).fetchall()
            
            for idx in indexes:
                print(f"\n- {idx[0]}")
                print(f"  {idx[1]}")

if __name__ == "__main__":
    check_database()