from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLAlchemyEnum
from sqlalchemy.sql import func
import enum
from database import Base

class AssetStatus(str, enum.Enum):
    IN_STOCK = "IN_STOCK"
    IN_USE = "IN_USE"
    IN_REPAIR = "IN_REPAIR"
    RETIRED = "RETIRED"

class AssetType(str, enum.Enum):
    NOTEBOOK = "NOTEBOOK"
    MONITOR = "MONITOR"
    KEYBOARD = "KEYBOARD"
    MOUSE = "MOUSE"
    HEADSET = "HEADSET"
    OTHER = "OTHER"


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    asset_type = Column(SQLAlchemyEnum(AssetType), nullable=False)
    model = Column(String, nullable=False)
    serial_number = Column(String, unique=True, index=True, nullable=False)
    status = Column(SQLAlchemyEnum(AssetStatus), nullable=False, default=AssetStatus.IN_STOCK)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())