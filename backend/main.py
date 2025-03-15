from datetime import datetime, time, date, timedelta
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
    activity_id: int
    date: date 
    wake_up_time: Optional[time]
    sleep_time: Optional[time]
    exercise_duration: Optional[float]
    meals: Optional[List[MealActivity]]


class PetStats(BaseModel):
    pet_id: int 
    pet_name: str

    # STATS
    happiness: int
    diet: int
    exercise: int
    sleep: int
    
    # GOALS
    exercise_dur: float
    wake_up_time: time
    sleep_time: time
    unhealthy_food_limit: int
    meal_per_day: int


class User(BaseModel): ## this is the input 
    id: int
    username: str
    email: str

    # GOAL to PETSTATS
    exercise_dur: float
    wake_up_time: time
    sleep_time: time 
    unhealthy_food_limit: int
    meal_per_day: int


@app.post("/user")
async def create_user_db(user: User):
    try:
        # Ensure the table exists
        session.execute(f"""
            CREATE TABLE IF NOT EXISTS {keyspace}.userspace (
                id INT PRIMARY KEY,
                username TEXT,
                email TEXT,
                created_at TIMESTAMP
            );
        """)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating table: {e}")
    
    logging.info("Table 'users' checked/created successfully.")

    try:
        create_at = datetime.now()
        # Insert the user into the database
        session.execute(f"""
            INSERT INTO {keyspace}.userspace (id, username, email, created_at)
            VALUES (%s, %s, %s, %s)
        """, (
            user.id, 
            user.username, 
            user.email, 
            create_at
        ))

        logging.info(f"User {user.id} created successfully")


    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inserting user into database: {e}")
    

    try:
        # Create a pet for the user
        pet_name = f"{user.username}'s Pet"
        pet_stats = PetStats(
            pet_id=user.id,
            pet_name=pet_name,
            happiness=100,
            diet=100,
            exercise=100,
            sleep=100,
            exercise_dur=user.exercise_dur,
            wake_up_time=user.wake_up_time,
            sleep_time=user.sleep_time,
            unhealthy_food_limit=user.unhealthy_food_limit,
            meal_per_day=user.meal_per_day
        )

         # Insert the pet into the database
        session.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {keyspace}.petspace (
                pet_id INT PRIMARY KEY,
                pet_name TEXT,
                happiness INT,
                diet INT,
                exercise INT,
                sleep INT,
                exercise_dur FLOAT,
                wake_up_time TEXT,
                sleep_time TEXT,
                unhealthy_food_limit INT,
                meal_per_day INT
            );
            """
        )

        session.execute(
            f"""
            INSERT INTO {keyspace}.petspace 
            (pet_id, pet_name, happiness, diet, exercise, sleep, exercise_dur, wake_up_time, sleep_time, unhealthy_food_limit, meal_per_day)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                pet_stats.pet_id, 
                pet_stats.pet_name, 
                pet_stats.happiness, 
                pet_stats.diet,
                pet_stats.exercise,
                pet_stats.sleep,
                pet_stats.exercise_dur, 
                str(pet_stats.wake_up_time),
                str(pet_stats.sleep_time), 
                pet_stats.unhealthy_food_limit, 
                pet_stats.meal_per_day
            )
        )
        
        logging.info(f"Pet {pet_name} created for user {user.id} successfully")
    except Exception as e:
        logging.error(f"Error inserting pet: {e}")
        
    
    try:
        # set activity log 
        session.execute(f"""
            CREATE TABLE IF NOT EXISTS {keyspace}.activityspace (
                activity_id INT PRIMARY KEY,
                date DATE,
                wake_up_time TEXT,  -- Store as string (ISO 8601 format) or INT (timestamp)
                sleep_time TEXT,    -- Store as string (ISO 8601 format) or INT (timestamp)
                exercise_duration FLOAT,  -- Float for exercise duration in hours or minutes
                meals TEXT,  -- Store meals as a JSON string or use a list of maps/sets for structured data
            );
        """)

        daily_activity = DailyActivity(
            activity_id=user.id,
            date=date.today(),
            wake_up_time=None,
            sleep_time=None,
            exercise_duration=0,
            meals=[]
        )

        session.execute(
            f"""
            INSERT INTO {keyspace}.activityspace 
            (activity_id, date, wake_up_time, sleep_time, exercise_duration, meals)
            VALUES ( %s, %s, %s, %s, %s, %s)
            """,
            (
                daily_activity.activity_id, 
                daily_activity.date, 
                daily_activity.wake_up_time if daily_activity.wake_up_time is not None else "",  # Default empty string
                daily_activity.sleep_time if daily_activity.sleep_time is not None else "",  # Default empty string
                daily_activity.exercise_duration,
                json.dumps(daily_activity.meals)  # Default empty string
            )
        )

        return {"message": f"Pet {pet_name} created for user {user.id} successfully, Activity log {daily_activity.activity_id}"}
    except Exception as e:
        logging.error(f"Error inserting activity: {e}")
   
   

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
    # Check Redis cache first
    cached_pet = redis_client.get(f"pet_stats:{pet_id}")
    
    if cached_pet:
        return json.loads(cached_pet)  # Deserialize JSON data

    try:
        # Ensure `wake_goal` exists in the database or replace it with `wake_up_time`
        pet_query = """
            SELECT pet_id, pet_name, happiness, diet, exercise, sleep,
                   wake_up_time, sleep_time, exercise_dur, unhealthy_food_limit, meal_per_day
            FROM pet.petspace WHERE pet_id = %s
        """
        pet_row = session.execute(pet_query, (pet_id,)).one()

        if pet_row:
            pet_data = {
                "pet_id": pet_row.pet_id,
                "pet_name": pet_row.pet_name,
                "happiness": pet_row.happiness,
                "diet": pet_row.diet,
                "exercise": pet_row.exercise,
                "sleep": pet_row.sleep,
                "wake_up_time": str(pet_row.wake_up_time),  # Convert time to string
                "sleep_time": str(pet_row.sleep_time),
                "exercise_dur": pet_row.exercise_dur,
                "unhealthy_food_limit": pet_row.unhealthy_food_limit,
                "meal_per_day": pet_row.meal_per_day
            }

            # Cache the pet data for 1 hour (3600 seconds)
            redis_client.set(f"pet_stats:{pet_id}", json.dumps(pet_data), ex=3600)
            
            return pet_data
        else:
            raise HTTPException(status_code=404, detail="Pet not found")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching pet: {e}")



@app.post("/user/pet/{user_id}")
async def post_user_pet(user_id: int, pet_update: PetStats):
    try:
        # Correct SQL query with proper field assignments
        update_query = """
            UPDATE pet.petspace 
            SET pet_name = %s, happiness = %s, diet = %s, exercise = %s, sleep=%s,
                wake_up_time = %s, sleep_time = %s, exercise_dur = %s, 
                unhealthy_food_limit = %s, meal_per_day= %s
            WHERE pet_id = %s
        """
        session.execute(update_query, (
            pet_update.pet_name, 
            pet_update.happiness,  # Fixed order
            pet_update.diet, 
            pet_update.exercise, 
            pet_update.sleep,
            pet_update.wake_up_time,
            pet_update.sleep_time,
            pet_update.exercise_dur,
            pet_update.unhealthy_food_limit,
            pet_update.meal_per_day,
            user_id
        ))

        # After updating the database, update the cache in Redis
        pet_data = {
            "pet_id": user_id,
            "pet_name": pet_update.pet_name,
            "happiness": pet_update.happiness,
            "diet": pet_update.diet,
            "exercise": pet_update.exercise,
            "sleep": pet_update.sleep,
            "wake_up_time": str(pet_update.wake_up_time),  # Convert to string
            "sleep_time": str(pet_update.sleep_time),
            "exercise_dur": pet_update.exercise_dur,
            "unhealthy_food_limit": pet_update.unhealthy_food_limit,
            "meal_per_day": pet_update.meal_per_day
        }

        # Store the updated pet data in Redis for 24 hours (86400 seconds)
        redis_client.set(f"pet_stats:{user_id}", json.dumps(pet_data), ex=86400)

        return {"message": "Pet data updated successfully", "pet_data": pet_data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating pet data: {e}")


@app.get('/user/activity/{activity_id}')
async def get_activity(activity_id: int):
    # Check Redis cache first
    cached_activity = redis_client.get(f"activity:{activity_id}")

    if cached_activity:
        return json.loads(cached_activity)  # Deserialize JSON data

    try:
        # Query activity data from the database
        activity_query = """
            SELECT activity_id, date, wake_up_time, sleep_time, exercise_duration, meals
            FROM pet.activityspace WHERE activity_id = %s
        """
        activity_row = session.execute(activity_query, (activity_id,)).one()

        if activity_row:
            activity_data = {
                "activity_id": activity_row.activity_id,
                "date": str(activity_row.date),  # Convert to string
                "wake_up_time": str(activity_row.wake_up_time) if activity_row.wake_up_time else None,
                "sleep_time": str(activity_row.sleep_time) if activity_row.sleep_time else None,
                "exercise_duration": activity_row.exercise_duration,
                "meals": json.loads(activity_row.meals) if activity_row.meals else []
            }

            # Cache activity data for 1 hour (3600 seconds)
            redis_client.set(f"activity:{activity_id}", json.dumps(activity_data), ex=3600)
            
            return activity_data
        else:
            raise HTTPException(status_code=404, detail="Activity not found")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching activity: {e}")

@app.post("/user/activity/{user_id}")
async def post_activity(user_id: int ,activity_update: DailyActivity):
    try:
        # Correct SQL query with proper field assignments
        update_query = """
            UPDATE pet.activityspace 
            SET date = %s, wake_up_time = %s, sleep_time = %s, 
                exercise_duration = %s, meals = %s
            WHERE activity_id = %s
        """

        meals_to_store = [meal.dict() for meal in activity_update.meals] if activity_update.meals else None
        meals_param = json.dumps(meals_to_store) if meals_to_store is not None else ""
        
        session.execute(update_query, (
            activity_update.date,
            activity_update.wake_up_time,
            activity_update.sleep_time,
            activity_update.exercise_duration,
            meals_param,  # Store as JSON string
            user_id
        ))

        # After updating the database, update the cache in Redis
        activity_data = {
            "activity_id": activity_update.activity_id,
            "date": activity_update.date.isoformat() if activity_update.date else None,
            "wake_up_time": activity_update.wake_up_time.isoformat() if activity_update.wake_up_time else None,
            "sleep_time": activity_update.sleep_time.isoformat() if activity_update.sleep_time else None,
            "exercise_duration": activity_update.exercise_duration,
            "meals": [meal.dict() for meal in activity_update.meals] if activity_update.meals else []
        }

        # Store updated activity data in Redis for 24 hours (86400 seconds)
        redis_client.set(f"activity:{activity_update.activity_id}", json.dumps(activity_data), ex=86400)

        return {"message": "Activity data updated successfully", "activity_data": activity_data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating activity data: {e}")
    

@app.post("/user/activity/wake")
async def set_wake():
    activity_data = await get_activity(0)

    wake_time = datetime.now()
    sleep_time = activity_data.sleep_time - wake_time

    return {"message": "Daily activity stored successfully!", "key": key}

    

@app.post("/user/activity/sleep")
async def set_sleep():

    currentdate = datetime.date - timedelta(day=1)
    

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