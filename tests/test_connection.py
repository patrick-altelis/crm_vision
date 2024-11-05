import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Charger les variables d'environnement du fichier .env
load_dotenv()

def test_connection():
    # Récupérer les informations de connexion
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_HOST = os.getenv('DB_HOST')
    DB_NAME = os.getenv('DB_NAME')

    # Construire l'URL de connexion
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}"
    
    try:
        # Tenter de créer une connexion
        engine = create_engine(DATABASE_URL)
        
        # Tester la connexion
        with engine.connect() as connection:
            print("✅ Connexion réussie à la base de données!")
            
            # Tester une requête simple
            result = connection.execute(text("SELECT current_timestamp;")).fetchone()
            print(f"🕒 Heure actuelle sur le serveur: {result[0]}")
            
            # Afficher les informations de connexion (masquées)
            print("\nInformations de connexion:")
            print(f"Host: {DB_HOST}")
            print(f"Database: {DB_NAME}")
            print(f"User: {DB_USER}")
            print(f"Password: {'*' * len(str(DB_PASSWORD))}")
            
    except Exception as e:
        print("❌ Erreur de connexion!")
        print(f"Détails de l'erreur: {str(e)}")

if __name__ == "__main__":
    test_connection()