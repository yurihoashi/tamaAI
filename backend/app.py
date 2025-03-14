from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.models import PetDB
from backend.db.database import get_db
from backend.db.schemas import PetSchema
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()

# CORS Middleware (allows frontend requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific frontend URLs for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🟢 Create Pet
@app.post("/pets/")
def create_pet(pet: PetSchema, db: Session = Depends(get_db)):
    db_pet = PetDB(**pet.dict(), last_updated=datetime.utcnow())
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet