from pydantic import BaseModel
from datetime import datetime
from models import AssetType, AssetStatus

class AssetBase(BaseModel):
    name: str
    asset_type: AssetType
    model: str
    serial_number: str
    status: AssetStatus = AssetStatus.IN_STOCK

class AssetCreate(AssetBase):
    pass

class Asset(AssetBase):
    id: int
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True