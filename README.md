# CRM Database Tools

Scripts de gestion et recherche pour la base de données CRM.

## Structure
- `src/` : Scripts principaux
  - `autocomplete.py` : Recherche dans la base de données
  - `import_data.py` : Import des données
- `tests/` : Tests unitaires et d'intégration
- `utils/` : Scripts utilitaires

## Installation
1. Copier `.env.example` vers `.env`
2. Configurer les variables d'environnement :
   - DB_USER
   - DB_PASSWORD
   - DB_HOST
   - DB_NAME
3. Installer les dépendances : `pip install -r requirements.txt`

## Utilisation
- Recherche : `python src/autocomplete.py`
- Import des données : `python src/import_data.py`

## Développement
- Vérification des données : `python utils/data_check.py`
- Tests : `python -m pytest tests/`
