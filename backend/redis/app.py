import redis


# Connect to Redis server
redis_client = redis.Redis(host='localhost', port=6379, db=0)