# services/inventory-service/security.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from pydantic import BaseModel
import os # Importar para ler variáveis de ambiente

# --- CONFIGURAÇÕES DE SEGURANÇA ---
# Tente ler do .env, se não existir, use o valor padrão
SECRET_KEY = os.getenv("SECRET_KEY", "SEU_SEGREDO_SUPER_SECRETO") # Lê do .env ou usa valor fixo
ALGORITHM = os.getenv("ALGORITHM", "HS256") # Lê do .env ou usa valor padrão

oauth2_scheme = HTTPBearer()

# --- MODELO DE DADOS PARA O TOKEN ---
class TokenData(BaseModel):
    email: str | None = None

# --- FUNÇÃO PRINCIPAL DE VALIDAÇÃO ---

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)):
    """
    Decodifica o token JWT, valida e extrai os dados do usuário.
    """
    # Extrai o token da credencial
    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decodifica o token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"[DEBUG] Payload decodificado: {payload}") # <-- Linha de debug temporária

        # Tenta obter o email do payload
        email: str = payload.get("email")
        print(f"[DEBUG] Email extraído: {email}") # <-- Linha de debug temporária

        if email is None:
            print("[DEBUG] Campo 'email' não encontrado no payload ou é None") # <-- Linha de debug temporária
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError as e:
        print(f"[DEBUG] Erro ao decodificar JWT: {e}") # <-- Linha de debug temporária
        raise credentials_exception

    return token_data