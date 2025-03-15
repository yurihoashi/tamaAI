import redis


# Connect to Redis server
redis_client = redis.StrictRedis(host="localhost", port=6379, db=0, decode_responses=True)



def redis_post_wake_time(key, value):
    redis_client.set(key, value)
    return {"message": f"Key '{key}' set to value '{value}' in cache."}

def redis_post_sleep_time(key, value):
    redis_client.set(key, value)
    return {"message": f"Key '{key}' set to value '{value}' in cache."}