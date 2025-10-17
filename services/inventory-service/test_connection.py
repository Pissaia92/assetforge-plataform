import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

print("--- Iniciando teste de conexão direta ---")

try:
    print("1. Carregando o arquivo .env...")
    # Força a especificação da codificação para UTF-8 durante a leitura
    load_dotenv(encoding='utf-8')
    print("   Arquivo .env carregado.")

    DATABASE_URL = os.getenv("DATABASE_URL")

    if DATABASE_URL is None:
        print("\nERRO: Não foi possível encontrar a DATABASE_URL no arquivo .env!")
    else:
        print(f"2. URL do banco encontrada: {DATABASE_URL}")
        print("3. Tentando criar a engine de conexão...")
        engine = create_engine(DATABASE_URL)
        print("   Engine criada com sucesso.")

        print("4. Tentando conectar ao banco de dados...")
        with engine.connect() as connection:
            print("   Conexão bem-sucedida!")
            print("\n--- SUCESSO! A conexão com o banco de dados está funcionando. ---")

except Exception as e:
    print("\n--- FALHA NO TESTE ---")
    print(f"Ocorreu um erro: {e}")