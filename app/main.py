from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .schema import AIEvent
from pydantic import BaseModel, Field

app = FastAPI()

class TrackEventRequest(BaseModel):
    hostName: str = Field(..., min_length=4)
    aiSource: str = Field(..., min_length=5)
    pathName: str = Field(..., min_length=1)

@app.get("/healthcheck")
def health():
    return {"status": "ok"}

@app.post("/track")
def track_event(payload: TrackEventRequest, db: Session = Depends(get_db)):

    event = AIEvent(
        host_name=payload.hostName,
        ai_source=payload.aiSource,
        path_name=payload.pathName,
    )

    db.add(event)
    db.commit()

    return {"status": "stored"}