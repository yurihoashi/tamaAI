from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider
from cassandra.cqlengine import connection
from cassandra.cqlengine.management import sync_table
from cassandra.cqlengine.models import Model
from cassandra.cqlengine import columns
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_cluster():
    cloud_config = {
        'secure_connect_bundle': 'secure-connect-pet-db.zip'
    }
    auth_provider = PlainTextAuthProvider(
        username=os.getenv('CLIENT_ID'),
        password=os.getenv('CLIENT_SECRET')
    )
    
    cluster = Cluster(
        contact_points=eval(os.getenv('DB_CONTACT_POINTS', '["localhost"]')),
        port=int(os.getenv('DB_PORT', 9042)),
        auth_provider=auth_provider
    )

    cluster = Cluster(cloud=cloud_config, auth_provider=auth_provider)

    return cluster

def init_database():
    cluster = get_cluster()
    session = cluster.connect()
    
    # Create keyspace if it doesn't exist
    keyspace = os.getenv('DB_KEYSPACE', 'tamaai')
    session.execute(f"""
        CREATE KEYSPACE IF NOT EXISTS {keyspace}
        WITH replication = {{
            'class': 'SimpleStrategy',
            'replication_factor': 1
        }}
    """)
    
    # Connect to the keyspace
    session.set_keyspace(keyspace)
    
    # Set up connection for models
    connection.setup(
        eval(os.getenv('DB_CONTACT_POINTS', '["localhost"]')),
        keyspace,
        auth_provider=PlainTextAuthProvider(
            username=os.getenv('DB_USERNAME'),
            password=os.getenv('DB_PASSWORD')
        )
    )
    
    # Sync tables
    sync_table(User)
    sync_table(PetStats)
    sync_table(ScreenTime)
    sync_table(FoodLog)
    
    return session

# Database Models
class User(Model):
    __keyspace__ = os.getenv('DB_KEYSPACE', 'tamaai')
    __table_name__ = 'users'
    
    user_id = columns.UUID(primary_key=True)
    username = columns.Text(required=True, index=True)
    email = columns.Text(required=True)
    sleep_time = columns.Time()
    wake_time = columns.Time()
    screen_time_limit = columns.Integer()
    unhealthy_food_limit = columns.Integer()
    created_at = columns.DateTime(default=datetime.utcnow)

class PetStats(Model):
    __keyspace__ = os.getenv('DB_KEYSPACE', 'tamaai')
    __table_name__ = 'pet_stats'
    
    user_id = columns.UUID(primary_key=True)
    timestamp = columns.DateTime(primary_key=True, clustering_order="DESC")
    health = columns.Float()
    happiness = columns.Float()
    energy = columns.Float()
    hunger = columns.Float()

class ScreenTime(Model):
    __keyspace__ = os.getenv('DB_KEYSPACE', 'tamaai')
    __table_name__ = 'screen_time'
    
    user_id = columns.UUID(primary_key=True)
    date = columns.Date(primary_key=True)
    minutes = columns.Integer()
    updated_at = columns.DateTime()

class FoodLog(Model):
    __keyspace__ = os.getenv('DB_KEYSPACE', 'tamaai')
    __table_name__ = 'food_logs'
    
    user_id = columns.UUID(primary_key=True)
    timestamp = columns.DateTime(primary_key=True, clustering_order="DESC")
    food_type = columns.Text()
    is_healthy = columns.Boolean()
    calories = columns.Integer()
    nutrition_score = columns.Float() 