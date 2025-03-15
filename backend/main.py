from datetime import datetime
import logging
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider
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
    pet_id: int 
    pet_name: str
    health: float
    happiness: float
    energy: float
    hunger: float

class User(BaseModel):
    id: int
    username: str
    email: str
    sleep_time: datetime
    wake_time: datetime
    screen_time_limit: int 
    unhealthy_food_limit: int 



@app.get("/")
async def root():
    return {"message": "TamaAI Backend API"}


@app.post("/user")
async def create_user_db(user: User):
    try:
        # Ensure the table exists
        session.execute(f"""
            CREATE TABLE IF NOT EXISTS {keyspace}.userspace (
                id INT PRIMARY KEY,
                username TEXT,
                email TEXT,
                created_at TIMESTAMP,
                sleep_time TIME,
                wake_time TIME,
                screen_time_limit INT,
                unhealthy_food_limit INT
            );
        """)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating table: {e}")
    
    logging.info("Table 'users' checked/created successfully.")

    try:
        create_at = datetime.now()
        # Insert the user into the database
        session.execute(
            f"""
            INSERT INTO {keyspace}.userspace (id, username, email, created_at, sleep_time, wake_time, screen_time_limit, unhealthy_food_limit)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                user.id, user.username, user.email, create_at,
                user.sleep_time, user.wake_time, user.screen_time_limit, user.unhealthy_food_limit
            )
        )
        logging.info(f"User {user.id} created successfully")

        # Create a pet for the user
        pet_name = f"{user.username}'s Pet"
        pet_stats = PetStats(
            pet_id=user.id,
            pet_name=pet_name,
            health=100.0,  # Set default values for the pet stats
            happiness=100.0,
            energy=100.0,
            hunger=0.0
        )


         # Insert the pet into the database
        session.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {keyspace}.petspace (
                pet_id INT PRIMARY KEY,
                pet_name TEXT,
                health FLOAT,
                happiness FLOAT,
                energy FLOAT,
                hunger FLOAT
            );
            """
        )

        session.execute(
            f"""
            INSERT INTO {keyspace}.petspace (pet_id, pet_name, health, happiness, energy, hunger)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                pet_stats.pet_id, pet_stats.pet_name, pet_stats.health,
                pet_stats.happiness, pet_stats.energy, pet_stats.hunger
            )
        )
        
        logging.info(f"Pet {pet_name} created for user {user.id} successfully")

        return {"message": f"Pet {pet_name} created for user {user.id} successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inserting user into database: {e}")



@app.get("/user/{user_id}")
async def get_user(user_id: int):
    query = "SELECT id, username, email FROM pet.userspace WHERE id = %s"  # Avoid f-string for query
    try:
        row = session.execute(query, (user_id,)).one()

        if row:
            return {
                "id": row.id,
                "username": row.username,  # Corrected from 'name' to 'username'
                "email": row.email,
            }
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {e}")


@app.get('/user/pet/{user_id}')
async def get_user_pet(user_id: int):
    # First, retrieve the user's information
    try:
        # Now, use the username to find the pet
        pet_query = "SELECT pet_id, pet_name, health, happiness, energy, hunger FROM pet.petspace WHERE pet_id = %s"
        pet_row = session.execute(pet_query, (user_id,)).one()  # Assuming the pet name is formed as "{username}'s Pet"

        if pet_row:
            return {
                "pet_id": pet_row.pet_id,
                "pet_name": pet_row.pet_name,
                "health": pet_row.health,
                "happiness": pet_row.happiness,
                "energy": pet_row.energy,
                "hunger": pet_row.hunger
            }
        else:
            raise HTTPException(status_code=404, detail="Pet not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user or pet: {e}")



@app.post("/user/{}")
async def log_in_activity():
    raise NotImplementedError


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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 