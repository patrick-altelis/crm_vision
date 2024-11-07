import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    PORT = int(os.getenv('PORT', 5001))
    HOST = os.getenv('HOST', '0.0.0.0')
    DEBUG = FLASK_ENV == 'development'

    # Supabase
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')

    # API Config
    ITEMS_PER_PAGE = 20
