from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, models, schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AssetForge - Inventory Service",
    description="API para gerenciamento de ativos de TI.",
    version="0.1.0"
)

# Função de Dependência
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoint raiz
@app.get("/")
def read_root():
    return {"message": "Inventory Service is alive!"}

# --- ENDPOINTS DE /assets/ ---

@app.post("/assets/", response_model=schemas.Asset)
def create_new_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    db_asset = db.query(models.Asset).filter(models.Asset.serial_number == asset.serial_number).first()
    if db_asset:
        raise HTTPException(status_code=400, detail="Serial number already registered")
    return crud.create_asset(db=db, asset=asset)

@app.get("/assets/", response_model=list[schemas.Asset])
def read_assets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    assets = crud.get_assets(db, skip=skip, limit=limit)
    return assets

# Endpoint para LER um ativo específico por ID 
@app.get("/assets/{asset_id}", response_model=schemas.Asset)
def read_asset_by_id(asset_id: int, db: Session = Depends(get_db)):
    db_asset = crud.get_asset(db, asset_id=asset_id)
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return db_asset

# Endpoint para ATUALIZAR um ativo
@app.put("/assets/{asset_id}", response_model=schemas.Asset)
def update_existing_asset(asset_id: int, asset_update: schemas.AssetCreate, db: Session = Depends(get_db)):
    db_asset = crud.update_asset(db, asset_id=asset_id, asset_update=asset_update)
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return db_asset

# Endpoint para DELETAR um ativo
@app.delete("/assets/{asset_id}", response_model=schemas.Asset)
def delete_existing_asset(asset_id: int, db: Session = Depends(get_db)):
    db_asset = crud.delete_asset(db, asset_id=asset_id)
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return db_asset