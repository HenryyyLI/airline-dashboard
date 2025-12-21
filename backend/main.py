from fastapi import Body, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from postgres_db import PostgresClient
from dotenv import load_dotenv
import os
from datetime import datetime
from sentModel import sentModel
import numpy as np
from sklearn.linear_model import LinearRegression

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
async def get_airline_reviews(airline_name: str):
    """Get airline reviews with optional keyword filtering in content"""
    db = PostgresClient(POSTGRES_DSN)
    try:
        data = db.get_reviews_by_airline(airline_name)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/sentiment-tool/submit")
async def submit_sentiment_text(text: str = Body(...)):
    """Submit text for sentiment analysis"""
    db = PostgresClient(POSTGRES_DSN)
    try:
        if not text:
            raise HTTPException(status_code=404, detail="Text field is required")
        
        sm = sentModel()
        score, sent_lab, pos_dict, neg_dict = sm.run_score(text, num_features=50)
        submit_time = datetime.utcnow()
        
        db.insert_sentiment(text, submit_time, sent_lab, pos_dict, neg_dict)
        
        return {
            "status": "success",
            "data": {
                "text": text,
                "score": float(score),
                "sent_lab": sent_lab,
                "pos_dict": pos_dict,
                "neg_dict": neg_dict
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/airlines/{airline_name}/wordcloud-data")
async def get_airline_wordcloud_data(airline_name: str):
    """Get wordcloud data from random airline reviews"""
    db = PostgresClient(POSTGRES_DSN)
    try:
        reviews = db.get_random_reviews(airline_name, limit=10)
        
        if not reviews:
            raise HTTPException(status_code=404, detail="No reviews found for this airline")
        
        sm = sentModel()
        combined_pos_dict = {}
        combined_neg_dict = {}
        
        for review in reviews:
            content = review.get('content', '')
                
            _, _, pos_dict, neg_dict = sm.run_score(content)
            
            for word, metrics in pos_dict.items():
                if word in combined_pos_dict:
                    combined_pos_dict[word]['score'] += metrics['score']
                else:
                    combined_pos_dict[word] = {'score': metrics['score']}
            
            for word, metrics in neg_dict.items():
                if word in combined_neg_dict:
                    combined_neg_dict[word]['score'] += metrics['score']
                else:
                    combined_neg_dict[word] = {'score': metrics['score']}
        
        pos_score = sum(abs(m['score']) for m in combined_pos_dict.values())
        neg_score = sum(abs(m['score']) for m in combined_neg_dict.values())
        pos_count = len(combined_pos_dict)
        neg_count = len(combined_neg_dict)
        overall_score = pos_score - neg_score
        overall_count = pos_count + neg_count
        
        return {
            "status": "success",
            "data": {
                "pos_dict": combined_pos_dict,
                "neg_dict": combined_neg_dict,
                "pos_score": float(pos_score),
                "neg_score": float(-neg_score),
                "overall_score": float(overall_score),
                "pos_count": pos_count,
                "neg_count": neg_count,
                "overall_count": overall_count,
                "review_count": len(reviews)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/airlines/{airline_name}/feature-importance")
async def get_airline_feature_importance(airline_name: str):
    """Get feature importance from linear regression on airline reviews"""
    db = PostgresClient(POSTGRES_DSN)
    try:
        reviews = db.get_reviews_for_regression(airline_name)
        
        if not reviews or len(reviews) < 10:
            raise HTTPException(status_code=404, detail="Not enough reviews for regression analysis")
        
        X = []
        y = []
        feature_names = [
            'seatComfort', 'cabinStaffService', 'foodBeverages',
            'inflightEntertainment', 'groundService', 'wifiConnectivity', 'valueForMoney'
        ]
        
        for review in reviews:
            features = [
                review.get('seatComfort', 0) or 0,
                review.get('cabinStaffService', 0) or 0,
                review.get('foodBeverages', 0) or 0,
                review.get('inflightEntertainment', 0) or 0,
                review.get('groundService', 0) or 0,
                review.get('wifiConnectivity', 0) or 0,
                review.get('valueForMoney', 0) or 0
            ]
            X.append(features)
            y.append(review.get('score', 0) or 0)
        
        X = np.array(X)
        y = np.array(y)
        
        model = LinearRegression()
        model.fit(X, y)
        
        coefficients = {
            feature_names[i]: float(model.coef_[i])
            for i in range(len(feature_names))
        }
        
        return {
            "status": "success",
            "data": coefficients
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()