from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, models, schemas
from database import SessionLocal, engine
import security
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AssetForge - Inventory Service",
    description="API para gerenciamento de ativos de TI.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # Permitir apenas o seu frontend
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos os métodos (GET, POST, PUT, DELETE, etc)
    allow_headers=["*"],
)    
# Função de Dependência do Banco de Dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ENDPOINTS DE /assets/ ---

@app.post("/assets/", response_model=schemas.Asset)
def create_new_asset(
    asset: schemas.AssetCreate,
    db: Session = Depends(get_db),
    current_user: security.TokenData = Depends(security.get_current_user),
):
    db_asset = db.query(models.Asset).filter(models.Asset.serial_number == asset.serial_number).first()
    if db_asset:
        raise HTTPException(status_code=400, detail="Serial number already registered")
    return crud.create_asset(db=db, asset=asset)

@app.get("/assets/", response_model=list[schemas.Asset])
def read_assets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    assets = crud.get_assets(db, skip=skip, limit=limit)
    return assets

@app.get("/assets/{asset_id}", response_model=schemas.Asset)
def read_asset_by_id(asset_id: int, db: Session = Depends(get_db)):
    db_asset = crud.get_asset(db, asset_id=asset_id)
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return db_asset

@app.put("/assets/{asset_id}", response_model=schemas.Asset)
def update_existing_asset(
    asset_id: int,
    asset_update: schemas.AssetCreate,
    db: Session = Depends(get_db),
    current_user: security.TokenData = Depends(security.get_current_user),
):
    db_asset = crud.update_asset(db, asset_id=asset_id, asset_update=asset_update)
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return db_asset

@app.delete("/assets/{asset_id}", response_model=schemas.Asset)
def delete_existing_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: security.TokenData = Depends(security.get_current_user),
):
    db_asset = crud.delete_asset(db, asset_id=asset_id)
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return db_asset