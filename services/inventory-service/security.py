from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from pydantic import BaseModel

# --- CONFIGURAÇÕES DE SEGURANÇA ---

SECRET_KEY = "SEU_SEGREDO_SUPER_SECRETO"
ALGORITHM = "HS256"

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
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    return token_data