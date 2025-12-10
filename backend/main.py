from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from postgres_db import PostgresClient
from dotenv import load_dotenv
import os

load_dotenv()
POSTGRES_DSN = os.getenv("POSTGRES_DSN")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def welcome():
    return {"message": "Welcome to the Airline Review API 👋"}

@app.get("/airlines/top-rated")
async def get_top_rated_airlines():
    """Get top rated airlines"""
    db = PostgresClient(POSTGRES_DSN)
    try:
        airlines = db.get_top_rated_airlines()
        return {"status": "success", "data": airlines}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/airlines/{airline_name}/key-data")
async def get_airline_key_data(airline_name: str):
    """Get key data for a specific airline"""
    db = PostgresClient(POSTGRES_DSN)
    try:
        data = db.get_airline_key_data(airline_name)
        
        if not data:
            raise HTTPException(status_code=404, detail="Airline not found")
        
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/airlines/{airline_name}/rating-distribution")
async def get_rating_distribution(airline_name: str):
    """Get rating distribution for a specific airline"""
    db = PostgresClient(POSTGRES_DSN)
    try:
        data = db.get_rating_distribution(airline_name)
        
        if not data:
            raise HTTPException(status_code=404, detail="Airline not found")
        
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/airlines/{airline_name}/sub-item-scoring")
async def get_sub_item_scoring(airline_name: str):
    """Get sub-item scoring comparison for a specific airline"""
    db = PostgresClient(POSTGRES_DSN)
    try:
        data = db.get_sub_item_scoring(airline_name)
        
        if not data:
            raise HTTPException(status_code=404, detail="Airline not found")
        
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/airlines/{airline_name}/city-distribution")
async def get_airline_city_distribution(airline_name: str, cities_csv: str = "worldcities.csv"):
    """Get city distribution for airline routes"""
    db = PostgresClient(POSTGRES_DSN)
    try:
        data = db.get_airline_city_distribution(airline_name, cities_csv)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/airlines/{airline_name}/info")
async def get_airline_info(airline_name: str):
    """Get airline name and image"""
    db = PostgresClient(POSTGRES_DSN)
    try:
        data = db.get_airline_info(airline_name)
        
        if not data:
            raise HTTPException(status_code=404, detail="Airline not found")
        
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/airlines/{airline_name}/reviews")
async def get_airline_reviews(airline_name):
    """Get airline reviews with optional keyword filtering in content"""
    db = PostgresClient(POSTGRES_DSN)
    try:
        data = db.get_reviews_by_airline(airline_name)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()