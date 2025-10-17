import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# --- CORREÇÃO AQUI ---
# Verificamos se a variável de ambiente foi realmente carregada
if DATABASE_URL is None:
    raise ValueError("A variável de ambiente DATABASE_URL não foi definida.")

engine = create_engine(DATABASE_URL)
# --- FIM DA CORREÇÃO ---

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()