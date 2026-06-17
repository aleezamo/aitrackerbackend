from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .schema import AIEvent, Site
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from uuid import UUID
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TrackEventRequest(BaseModel):
    hostName: str = Field(..., min_length=4)
    aiSource: str = Field(..., min_length=5)
    pathName: str = Field(..., min_length=1)
    pageTitle: str = Field(..., min_length=0)
    siteID: UUID
    
@app.get("/healthcheck")
def health():
    return {"status": "ok"}

@app.post("/track")
def track_event(payload: TrackEventRequest, db: Session = Depends(get_db)):
    try:
        site = db.query(Site).filter(
            Site.id== payload.siteID,
            Site.domain == payload.hostName
        ).first()
    except:
        raise HTTPException(
            status_code=500,
            detail="Could not connect to database"
        )

    if not site:

        if (payload.hostName[0:4]=="www."):
            site = db.query(Site).filter(
            Site.id==payload.siteID,
            Site.domain == payload.hostName[4:]
            ).first()
        else:
            site = db.query(Site).filter(
                Site.id==payload.siteID,
                Site.domain == "www."+payload.hostName
            ).first()

        if not site:
            raise HTTPException(
                status_code=404,
                detail="Site not found (invalid siteID or domain)"
            ) 


    event = AIEvent(
        site_id = site.id,
        ai_source=payload.aiSource,
        path_name=payload.pathName,
        page_title=payload.pageTitle
    )

    db.add(event)
    db.commit()

    return {"status": "stored"}