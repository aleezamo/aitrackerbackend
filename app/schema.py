from sqlalchemy import Column, BigInteger, Text, TIMESTAMP
from sqlalchemy.sql import func
from .database import Base

class AIEvent(Base):
    __tablename__ = "ai_traffic_events"

    id = Column(BigInteger, primary_key=True, index=True)

    host_name = Column(Text, nullable=False)
    ai_source = Column(Text, nullable=False)
    path_name = Column(Text, nullable=False)

    created_at = Column(TIMESTAMP, server_default=func.now())