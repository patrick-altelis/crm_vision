from sqlalchemy import create_engine, text

# Configuration
DB_USER = "postgres.mtfwvdvimpyoocpfpewf"
DB_PASSWORD = "_eH`&A}=*o]uP;4Rt+"
DB_HOST = "aws-0-eu-west-3.pooler.supabase.com"
DB_NAME = "postgres"

# Connexion
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}"
engine = create_engine(DATABASE_URL)

# Test de la connexion
with engine.connect() as conn:
    # Compter le nombre d'enregistrements
    result = conn.execute(text("SELECT COUNT(*) FROM companies"))
    count = result.scalar()
    print(f"Nombre total d'enregistrements: {count}")
    
    # Afficher quelques exemples
    print("\nExemples d'enregistrements:")
    result = conn.execute(text("SELECT * FROM companies LIMIT 2"))
    rows = result.fetchall()
    
    for row in rows:
        print("\nEnregistrement:")
        for column, value in zip(result.keys(), row):
            print(f"{column}: {value}")
            