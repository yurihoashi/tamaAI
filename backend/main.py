from datetime import datetime, time, date
import logging
import shutil
from typing import List, Optional
import uuid
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider
import json
import redis 

# Load environment variables
app = FastAPI()
# Connect to Redis server
redis_client = redis.StrictRedis(host="localhost", port=6379, db=0, decode_responses=True)


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

class MealActivity(BaseModel):
    meal_name: str
    healthy_score: int  # Healthy score

class DailyActivity(BaseModel):
    date: date 
    wake_up_time: Optional[time]
    sleep_time: Optional[time]
    exercise_durection: Optional[float]
    meals: Optional[List[MealActivity]]



class PetStats(BaseModel):
    pet_id: int 
    pet_name: str

    # STATS
    happiness: float
    diet: float
    exercise: float
    
    # GOALS
    exercise: time
    wake_goal: datetime
    unhealthy_food_limit: int

    #temporary
    sleep_time: Optional[time] = None


class User(BaseModel):
    id: int
    username: str
    email: str
    sleep_time: datetime
    wake_time: datetime
    screen_time_limit: int 
    unhealthy_food_limit: int


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
            INSERT INTO {keyspace}.userspace (id, username, email, created_at)
            VALUES (%s, %s, %s, %s)
            """,
            (
                user.id, user.username, user.email, create_at
            )
        )
        logging.info(f"User {user.id} created successfully")

        # Create a pet for the user
        pet_name = f"{user.username}'s Pet"
        pet_stats = PetStats(
            pet_id=user.id,
            pet_name=pet_name,
            happiness=100.0,
            diet=100.0,
            exercise=100.0,
            wake_goal=user.wake_time, 
            unhealthy_food_limit=user.unhealthy_food_limit
        )


         # Insert the pet into the database
        session.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {keyspace}.petspace (
                pet_id INT PRIMARY KEY,
                pet_name TEXT,
                happiness FLOAT,
                diet FLOAT,
                exercise FLOAT,
                sleep_time TIME
            );
            """
        )

        session.execute(
            f"""
            INSERT INTO {keyspace}.petspace (pet_id, pet_name, happiness, diet, exercise, sleep_time)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                pet_stats.pet_id, 
                pet_stats.pet_name, 
                pet_stats.happiness, 
                pet_stats.diet, 
                pet_stats.exercise,
                pet_stats.sleep_time if pet_stats.sleep_time is not None else None
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


@app.get('/user/pet/{pet_id}')
async def get_user_pet(pet_id: int):
    # First, retrieve the user's information
    cached_pet = redis_client.get(f"pet_stats:{pet_id}")
    
    if cached_pet:
        return json.loads(cached_pet)  # Deserialize JSON data
    
    try:
        # Now, use the username to find the pet
        pet_query = "SELECT pet_id, pet_name, happiness, diet, exercise, sleep_time FROM pet.petspace WHERE pet_id = %s"
        pet_row = session.execute(pet_query, (pet_id,)).one()  # Assuming the pet name is formed as "{username}'s Pet"

        if pet_row:
            pet_data = {
                "pet_id": pet_row.pet_id,
                "pet_name": pet_row.pet_name,
                "happiness": pet_row.happiness,
                "diet": pet_row.diet,
                "exercise": pet_row.exercise,
                "sleep_time": pet_row.sleep_time
            }

            redis_client.set(f"pet_stats:{pet_id}", json.dumps(pet_data), ex=86400)  # Cache for 1 hour
            
            return pet_data
        
        else:
            raise HTTPException(status_code=404, detail="Pet not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user or pet: {e}")


@app.post("/user/pet/{user_id}")
async def post_user_pet(user_id: int, pet_update: PetStats):
    try:
        # Update the pet information in the database
        update_query = """
            UPDATE pet.petspace 
            SET pet_name = %s, happiness = %s, exercise = %s, diet = %s, sleep_time= %s
            WHERE pet_id = %s
        """
        session.execute(update_query, (
            pet_update.pet_name, 
            pet_update.exercise, 
            pet_update.happiness, 
            pet_update.diet, 
            pet_update.sleep_time,
            user_id
        ))

        # After updating the database, update the cache in Redis
        pet_data = {
            "pet_id": user_id,
            "pet_name": pet_update.pet_name,
            "exercise": pet_update.exercise, 
            "happiness": pet_update.happiness,
            "diet":  pet_update.diet,
            "sleep_time": pet_update.sleep_time
        }

        # Store the updated pet data in Redis for 24 hours
        redis_client.set(f"pet_stats:{user_id}", json.dumps(pet_data), ex=86400)

        return {"message": "Pet data updated successfully", "pet_data": pet_data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating pet data: {e}")
    

@app.post("/user/{pet_id}/")

@app.get("/user/{pet_id}/wake")
async def log_in_wake(pet_id: int):

    pet_data = await get_user_pet(pet_id)  # Call the async function
    pet_data = pet_data["pet_data"]


    

    # Process pet_data if needed
    return {"message": f"{pet_data['pet_name']} has woken up!", "pet_info": pet_data}
    
# @app.post("/user/{pet_id}")
# async def log_in_activity():
#     raise NotImplementedError

# @app.post("/pet/{pet_id}/sleep")
# async def log_in_sleep(pet_id: int):

#     query = f"""
    
#     """

#     raise NotImplementedError

# @app.post("/pet/{pet_id}/exercise")
# async def log_in_exercise():
#     raise NotImplementedError


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