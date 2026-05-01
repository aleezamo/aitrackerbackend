from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .schema import AIEvent

app = FastAPI()

@app.get("/healthcheck")
def health():
    return {"status": "ok"}

@app.post("/track")
def track_event(payload: dict, db: Session = Depends(get_db)):

    event = AIEvent(
        host_name=payload.get("hostName"),
        ai_source=payload.get("aiSource"),
        path_name=payload.get("pathName"),
    )

    db.add(event)
    db.commit()

    return {"status": "stored"}