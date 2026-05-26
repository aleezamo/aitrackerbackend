from sqlalchemy import Column, BigInteger, Text, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy.dialects.postgresql import UUID

class User(Base):
    __tablename__ = "users"
    id = Column(BigInteger, primary_key=True, index=True)
    username = Column(Text, nullable=False)
    password = Column(Text, nullable=False)
    sites = relationship("Site", back_populates="user")

class Site(Base):
    __tablename__ = "ai_traffic_sites"
    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    domain = Column(Text, nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="sites")

    events = relationship("AIEvent", back_populates="site")

class AIEvent(Base):
    __tablename__ = "ai_traffic_events"

    id = Column(BigInteger, primary_key=True, index=True)

    ai_source = Column(Text, nullable=False)
    path_name = Column(Text, nullable=False)
    page_title = Column(Text, nullable=False)
    site_id = Column(UUID, ForeignKey("ai_traffic_sites.id"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    site = relationship("Site", back_populates="events")