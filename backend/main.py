import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider
from datetime import datetime
from dotenv import load_dotenv
import json


# Load environment variables
app = FastAPI()

# Setup Cassandra connection
cloud_config = {
    'secure_connect_bundle': 'secure-connect-pet-db.zip'
}

with open("token.json") as f:
    secrets = json.load(f)

CLIENT_ID = secrets["clientId"]
CLIENT_SECRET = secrets["secret"]

auth_provider = PlainTextAuthProvider(CLIENT_ID, CLIENT_SECRET)
cluster = Cluster(cloud=cloud_config, auth_provider=auth_provider)
session = cluster.connect()

# Define the keyspace
keyspace = "pet"

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class PetStats(BaseModel):
    health: float = 100.0
    happiness: float = 100.0
    energy: float = 100.0
    hunger: float = 100.0

# Pydantic model for user data
class User(BaseModel):
    id: int
    name: str
    email: str
    age: int
    create_at: datetime




@app.get("/")
async def root():
    return {"message": "TamaAI Backend API"}



@app.post("/user")
async def create_user_db(user: User):
    try:
        # Make sure the table exists
        session.execute(f"""
            CREATE TABLE IF NOT EXISTS {keyspace}.users (
                id INT PRIMARY KEY,
                name TEXT,
                email TEXT,
                age INT
            );
        """)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating table: {e}")
    
    logging.info("Table 'users' checked/created successfully.")
    
    # Initialize the PetStats with default values
    pet_stats = PetStats()

    # Serialize pet_stats into JSON
    pet_stats_json = pet_stats.json()

    try:
        # Insert the user and their settings as JSON
        session.execute(
            f"""
            INSERT INTO {keyspace}.users (id, name, email, age)
            VALUES (%s, %s, %s, %s)
            """,
            (user.id, user.name, user.email, user.age, pet_stats_json)
        )
        logging.info(f"User {user.id} created successfully")
        return {"message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inserting user into database: {e}")
    
@app.get("/user/{user_id}")
async def get_user(user_id: int):
    query = f"SELECT id, name, email, age FROM {keyspace}.users WHERE id = %s"
    row = session.execute(query, (user_id,)).one()

    if row:
        petsetting = PetStats.parse_raw(row.petsetting)

        return {
            "id": row.id,
            "name": row.name,
            "email": row.email,
            "age": row.age
        }
    else:
        raise HTTPException(status_code=404, detail="User not found")
    

# @app.post("/analyze-food")
# async def analyze_food(file: UploadFile = File(...)):
#     try:
#         # Read and preprocess the image
#         contents = await file.read()
#         image = Image.open(io.BytesIO(contents))
        
#         # TODO: Implement actual food classification
#         # For now, return a mock response
#         return {
#             "food_type": "healthy",
#             "confidence": 0.85,
#             "calories": 250,
#             "nutrition_score": 8.5
#         }
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

# @app.post("/settings")
# async def update_settings(settings: UserSettings):
#     try:
#         # TODO: Save settings to database
#         return {"status": "success", "settings": settings}
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

# @app.get("/pet-stats")
# async def get_pet_stats():
#     # TODO: Calculate actual stats based on user behavior
#     return PetStats(
#         health=85.0,
#         happiness=90.0,
#         energy=75.0,
#         hunger=80.0
#     )

# @app.post("/screen-time")
# async def log_screen_time(minutes: int):
#     try:
#         # TODO: Log screen time and update pet stats
#         return {"status": "success", "minutes_logged": minutes}
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000) 