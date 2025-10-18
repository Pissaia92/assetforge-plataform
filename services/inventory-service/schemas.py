from pydantic import BaseModel
from datetime import datetime
from models import AssetType, AssetStatus

# Contém os campos que são comuns tanto na criação quanto na leitura de um ativo.
class AssetBase(BaseModel):
    name: str
    asset_type: AssetType
    model: str
    serial_number: str
    status: AssetStatus = AssetStatus.IN_STOCK # Valor padrão

# --- Esquema de Criação (O que a API recebe para criar um novo ativo) ---
# Herda tudo de AssetBase.
class AssetCreate(AssetBase):
    pass

# --- Esquema de Leitura (O que a API retorna ao usuário) ---
# Herda de AssetBase e adiciona os campos que são gerados pelo banco de dados.
class Asset(AssetBase):
    id: int
    created_at: datetime
    updated_at: datetime | None = None # Pode ser Nulo

    class Config:
        orm_mode = True # Permite que o Pydantic leia dados de objetos do SQLAlchemy