from sqlalchemy.orm import Session
import models, schemas

# Função para LER um único ativo por ID
def get_asset(db: Session, asset_id: int):
    return db.query(models.Asset).filter(models.Asset.id == asset_id).first()

# Função para LER uma lista de ativos
def get_assets(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Asset).offset(skip).limit(limit).all()

# Função para CRIAR um novo ativo
def create_asset(db: Session, asset: schemas.AssetCreate):
    db_asset = models.Asset(**asset.model_dump())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

# Função para ATUALIZAR um ativo 
def update_asset(db: Session, asset_id: int, asset_update: schemas.AssetCreate):
    db_asset = get_asset(db, asset_id)
    if db_asset:
        # Pega os dados do Pydantic e converte para um dicionário
        update_data = asset_update.model_dump(exclude_unset=True)
        # Itera sobre os dados para atualizar o objeto do banco
        for key, value in update_data.items():
            setattr(db_asset, key, value)
        db.commit()
        db.refresh(db_asset)
    return db_asset

# Função para DELETAR um ativo
def delete_asset(db: Session, asset_id: int):
    db_asset = get_asset(db, asset_id)
    if db_asset:
        db.delete(db_asset)
        db.commit()
    return db_asset