import pandas as pd
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration de la base de données
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('DB_NAME')

# Création de la connexion à la base de données
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}"

# Création du modèle de base de données
Base = declarative_base()

class Company(Base):
    __tablename__ = 'companies'  # Correction des underscores

    id = Column(Integer, primary_key=True)
    company_name = Column(String)  # Nom_x
    tags = Column(String)          # Étiquettes_x
    address = Column(String)       # Adresse
    contacts = Column(String)      # Personnes
    closed_deals = Column(Float)   # Affaires clôturées_x
    ongoing_deals = Column(Float)  # Affaires en cours_x
    next_activity = Column(String) # Date de la prochaine activité_x
    owner = Column(String)         # Propriétaire_x
    contact_name = Column(String)  # Nom_y
    contact_tags = Column(String)  # Étiquettes_y
    organization = Column(String)  # Organisation
    work_email = Column(String)    # E-mail - Travail
    home_email = Column(String)    # E-mail - Domicile
    other_email = Column(String)   # E-mail - Autre
    work_phone = Column(String)    # Téléphone - Travail
    home_phone = Column(String)    # Téléphone - Domicile
    mobile_phone = Column(String)  # Téléphone - Mobile
    other_phone = Column(String)   # Téléphone - Autre

def create_database():
    """Création de la base de données et des tables"""
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)
    return engine

def import_csv_to_db(csv_file, engine):
    """Import des données du CSV vers la base de données"""
    # Lecture du CSV
    df = pd.read_csv(csv_file)
    
    # Renommage des colonnes pour correspondre à la structure de la base de données
    column_mapping = {
        'Nom_x': 'company_name',
        'Étiquettes_x': 'tags',
        'Adresse': 'address',
        'Personnes': 'contacts',
        'Affaires clôturées_x': 'closed_deals',
        'Affaires en cours_x': 'ongoing_deals',
        'Date de la prochaine activité_x': 'next_activity',
        'Propriétaire_x': 'owner',
        'Nom_y': 'contact_name',
        'Étiquettes_y': 'contact_tags',
        'Organisation': 'organization',
        'E-mail - Travail': 'work_email',
        'E-mail - Domicile': 'home_email',
        'E-mail - Autre': 'other_email',
        'Téléphone - Travail': 'work_phone',
        'Téléphone - Domicile': 'home_phone',
        'Téléphone - Mobile': 'mobile_phone',
        'Téléphone - Autre': 'other_phone'
    }
    
    df = df.rename(columns=column_mapping)
    
    # Import dans la base de données
    df.to_sql('companies', engine, if_exists='replace', index=False)

def main():
    """Fonction principale"""
    try:
        # Création de la base de données
        engine = create_database()
        print("Base de données créée avec succès")
        
        # Import des données
        import_csv_to_db('cleaned_consolidated_data.csv', engine)
        print("Données importées avec succès")
        
        # Test de la connexion
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM companies")).scalar()
            print(f"Nombre d'enregistrements importés : {result}")
            
    except Exception as e:
        print(f"Erreur : {str(e)}")

if __name__ == "__main__":  # Correction des underscores
    main()