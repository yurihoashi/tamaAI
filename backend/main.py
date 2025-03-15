from datetime import datetime
import logging
import uuid
from fastapi import FastAPI, HTTPException, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider
import json
import analysis
import os
from PIL import Image
import io

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
keyspace = "health"

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
        return {"message": "User created successfully"}
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

processor, model = analysis.load_model()

# Endpoint to analyze the food image
@app.post("/analyse-food")
async def analyze_food(file: UploadFile = File(...)):
    global processor, model
    try:
        # # Read and preprocess the image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        # processor, model = analysis.load_model()
        # image_dir = "../images/image_downloads/healthy_dinner_3.jpg"
        # image_path = "../images/image_downloads/healthy_dinner_3.jpg"
        description = analysis.describe_food_image(image, processor, model)
        if description:
            nut_score, filtered = analysis.extract_score(description)
            if filtered:
                print(f"Filtered: {filtered}")

                if filtered == "food":
                    nut_score = 0.0

                return {
                    "food_type": filtered,
                    "nutrition_score": nut_score
                }
        else:
            logging.error("No description found for image")
        
        # TODO: Implement actual food classification
        # For now, return a mock response
        return {
            "food_type": "Not Found",
            "nutrition_score": 0.0
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# Pydantic model for the confirmation request
class FoodConfirmation(BaseModel):
    updated_description: str

# Endpoint to change the food item, then add
@app.post("/confirm-food")
async def confirm_food(confirmation: FoodConfirmation):
    try:
        # Re-filter the updated description
        nut_score, food_item = analysis.extract_score(confirmation.updated_description)
        
        # Store in DataStax
        # session.execute(
        #     "INSERT INTO food_keyspace.food_ratings (food_item, nutrition_score, timestamp) VALUES (%s, %s, toTimestamp(now()))",
        #     (food_item, nut_score)
        # )

        return {
            "food_type": food_item,
            "nutrition_score": nut_score,
            "message": "Food item confirmed and stored."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Endpoint to add the food item
@app.post("/add-food")
async def add_food(food_item: str, nutrition_score: float):
    try:
        # Store in DataStax
        # session.execute(
        #     "INSERT INTO food_keyspace.food_ratings (food_item, nutrition_score, timestamp) VALUES (%s, %s, toTimestamp(now()))",
        #     (food_item, nutrition_score)
        # )
        return {
            "food_type": food_item,
            "nutrition_score": nutrition_score,
            "message": "Food item stored."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
    

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