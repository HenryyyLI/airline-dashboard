from dotenv import load_dotenv, find_dotenv
import os
import psycopg

load_dotenv(find_dotenv())
POSTGRES_DSN = os.getenv("POSTGRES_DSN")

class PostgresClient:
    def __init__(self, dsn):
        self.conn = psycopg.connect(dsn)
        self.cur = self.conn.cursor()

    def insert_airline(self, item):
        name = item.get("name")
        image = item.get("image")
        review_count = item.get("reviewCount")

        try:
            self.cur.execute(
                """
                INSERT INTO airlines (name, image, reviewCount)
                VALUES (%s, %s, %s)
                ON CONFLICT (name) DO UPDATE
                SET image = EXCLUDED.image,
                    reviewCount = EXCLUDED.reviewCount;
                """, (name, image, review_count),
            )
        except Exception as e:
            print(f"Error inserting into airlines: {e}")
            self.conn.rollback()
        else:
            self.conn.commit()

    def insert_review(self, item):
        data = dict(item)
        required_keys = [
            "reviewId", "title", "score", "content", "verifiedType",
            "airlineName", "userName", "country", "dateReview",
            "aircraft", "typeOfTraveller", "seatType", "route", "dateFlown",
            "seatComfort", "cabinStaffService", "foodBeverages",
            "inflightEntertainment", "groundService", "wifiConnectivity",
            "valueForMoney", "recommended",
        ]

        for key in required_keys:
            if key not in data:
                if key in (
                    "score", "seatComfort", "cabinStaffService", "foodBeverages",
                    "inflightEntertainment", "groundService", "wifiConnectivity",
                    "valueForMoney", "dateReview",
                ):
                    data[key] = None
                else:
                    data[key] = ""

        try:
            self.cur.execute(
                """
                INSERT INTO reviews (
                    reviewId, userName, airlineName,
                    title, score, content, verifiedType, 
                    country, dateReview,
                    aircraft, typeOfTraveller, seatType, route, dateFlown,
                    seatComfort, cabinStaffService, foodBeverages,
                    inflightEntertainment, groundService, wifiConnectivity,
                    valueForMoney, recommended
                ) VALUES (
                    %(reviewId)s, %(userName)s, %(airlineName)s, 
                    %(title)s, %(score)s, %(content)s, %(verifiedType)s,
                    %(country)s, %(dateReview)s,
                    %(aircraft)s, %(typeOfTraveller)s, %(seatType)s, %(route)s, %(dateFlown)s,
                    %(seatComfort)s, %(cabinStaffService)s, %(foodBeverages)s,
                    %(inflightEntertainment)s, %(groundService)s, %(wifiConnectivity)s,
                    %(valueForMoney)s, %(recommended)s
                );
                """, data,
            )
        except Exception as e:
            print(f"Error inserting into reviews: {e}")
            self.conn.rollback()
        else:
            self.conn.commit()

    def get_airline_key_data(self, airline_name):
        try:
            self.cur.execute(
                """
                SELECT 
                    seatComfort,
                    cabinStaffService,
                    foodBeverages,
                    inflightEntertainment,
                    groundService,
                    wifiConnectivity,
                    valueForMoney,
                    score,
                    calculatedReviewCount
                FROM airlines
                WHERE LOWER(name) = LOWER(%s);
                """,
                (airline_name,)
            )
            
            airline_row = self.cur.fetchone()
            
            if not airline_row:
                return None
            
            categories = {
                'Seat Comfort': airline_row[0],
                'Cabin Staff Service': airline_row[1],
                'Food & Beverages': airline_row[2],
                'Inflight Entertainment': airline_row[3],
                'Ground Service': airline_row[4],
                'Wifi Connectivity': airline_row[5],
                'Value For Money': airline_row[6]
            }
            
            valid_categories = {k: v for k, v in categories.items() if v is not None}
            
            if valid_categories:
                top_category = max(valid_categories, key=valid_categories.get)
                top_score = valid_categories[top_category]
                lowest_category = min(valid_categories, key=valid_categories.get)
                lowest_score = valid_categories[lowest_category]
                
                top_rated_item = {
                    "score": f"{round(top_score, 1)} / 5",
                    "category": top_category
                }
                lowest_rated_item = {
                    "score": f"{round(lowest_score, 1)} / 5",
                    "category": lowest_category
                }
            else:
                top_rated_item = {
                    "score": "N/A",
                    "category": "N/A"
                }
                lowest_rated_item = {
                    "score": "N/A",
                    "category": "N/A"
                }
            
            self.cur.execute(
                """
                SELECT 
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score) as median_score
                FROM reviews
                WHERE LOWER(airlineName) = LOWER(%s) AND score IS NOT NULL;
                """,
                (airline_name,)
            )
            median_row = self.cur.fetchone()
            median_score = int(median_row[0]) if median_row and median_row[0] else 0
            
            self.cur.execute(
                """
                SELECT 
                    COUNT(*) + 1 as rank,
                    (SELECT COUNT(*) FROM airlines) as total_airlines
                FROM airlines
                WHERE calculatedReviewCount > (
                    SELECT calculatedReviewCount 
                    FROM airlines 
                    WHERE LOWER(name) = LOWER(%s)
                );
                """,
                (airline_name,)
            )
            rank_row = self.cur.fetchone()
            rank = rank_row[0] if rank_row else 0
            total_airlines = rank_row[1] if rank_row else 0
            
            self.cur.execute(
                """
                SELECT 
                    MODE() WITHIN GROUP (ORDER BY seatType) as preferred_seat,
                    MODE() WITHIN GROUP (ORDER BY route) as preferred_route,
                    MIN(dateReview) as earliest_review,
                    MAX(dateReview) as latest_review,
                    TO_CHAR(MIN(
                        CASE 
                            WHEN dateFlown ~ '^[A-Za-z]+\s+\d{4}$'
                            THEN TO_DATE(dateFlown, 'FMMonth YYYY')
                            ELSE NULL
                        END
                    ), 'YYYY-MM') as earliest_flight,
                    TO_CHAR(MAX(
                        CASE 
                            WHEN dateFlown ~ '^[A-Za-z]+\s+\d{4}$'
                            THEN TO_DATE(dateFlown, 'FMMonth YYYY')
                            ELSE NULL
                        END
                    ), 'YYYY-MM') as latest_flight
                FROM reviews
                WHERE LOWER(airlineName) = LOWER(%s)
                    AND seatType IS NOT NULL 
                    AND route IS NOT NULL
                    AND dateReview IS NOT NULL
                    AND dateFlown IS NOT NULL;
                """,
                (airline_name,)
            )
            
            pref_row = self.cur.fetchone()
            
            return {
                "top_rated_item": top_rated_item,
                "total_rated_users": {
                    "count": airline_row[8],
                    "medium_number": median_score
                },
                "overall_score": {
                    "score": f"{round(airline_row[7], 1)} / 10" if airline_row[7] else "N/A",
                    "rank": f"{rank} out of {total_airlines} airlines"
                },
                "lowest_rated_item": lowest_rated_item,
                "preferred_seat_type": pref_row[0] if pref_row and pref_row[0] else "N/A",
                "preferred_route": pref_row[1] if pref_row and pref_row[1] else "N/A",
                "review_time": {
                    "start": pref_row[2].strftime("%Y-%m-%d") if pref_row and pref_row[2] else "N/A",
                    "end": pref_row[3].strftime("%Y-%m-%d") if pref_row and pref_row[3] else "N/A"
                },
                "flown_time": {
                    "start": pref_row[4] if pref_row and pref_row[4] else "N/A",
                    "end": pref_row[5] if pref_row and pref_row[5] else "N/A"
                }
            }
            
        except Exception as e:
            print(f"Error getting airline key data: {e}")
            return None

    def get_rating_distribution(self, airline_name):
        try:
            self.cur.execute(
                """
                SELECT 
                    COUNT(*) FILTER (WHERE seatComfort = 0) as seat_0,
                    COUNT(*) FILTER (WHERE seatComfort = 1) as seat_1,
                    COUNT(*) FILTER (WHERE seatComfort = 2) as seat_2,
                    COUNT(*) FILTER (WHERE seatComfort = 3) as seat_3,
                    COUNT(*) FILTER (WHERE seatComfort = 4) as seat_4,
                    COUNT(*) FILTER (WHERE seatComfort = 5) as seat_5,
                    
                    COUNT(*) FILTER (WHERE cabinStaffService = 0) as cabin_0,
                    COUNT(*) FILTER (WHERE cabinStaffService = 1) as cabin_1,
                    COUNT(*) FILTER (WHERE cabinStaffService = 2) as cabin_2,
                    COUNT(*) FILTER (WHERE cabinStaffService = 3) as cabin_3,
                    COUNT(*) FILTER (WHERE cabinStaffService = 4) as cabin_4,
                    COUNT(*) FILTER (WHERE cabinStaffService = 5) as cabin_5,
                    
                    COUNT(*) FILTER (WHERE foodBeverages = 0) as food_0,
                    COUNT(*) FILTER (WHERE foodBeverages = 1) as food_1,
                    COUNT(*) FILTER (WHERE foodBeverages = 2) as food_2,
                    COUNT(*) FILTER (WHERE foodBeverages = 3) as food_3,
                    COUNT(*) FILTER (WHERE foodBeverages = 4) as food_4,
                    COUNT(*) FILTER (WHERE foodBeverages = 5) as food_5,
                    
                    COUNT(*) FILTER (WHERE inflightEntertainment = 0) as entertainment_0,
                    COUNT(*) FILTER (WHERE inflightEntertainment = 1) as entertainment_1,
                    COUNT(*) FILTER (WHERE inflightEntertainment = 2) as entertainment_2,
                    COUNT(*) FILTER (WHERE inflightEntertainment = 3) as entertainment_3,
                    COUNT(*) FILTER (WHERE inflightEntertainment = 4) as entertainment_4,
                    COUNT(*) FILTER (WHERE inflightEntertainment = 5) as entertainment_5,
                    
                    COUNT(*) FILTER (WHERE groundService = 0) as ground_0,
                    COUNT(*) FILTER (WHERE groundService = 1) as ground_1,
                    COUNT(*) FILTER (WHERE groundService = 2) as ground_2,
                    COUNT(*) FILTER (WHERE groundService = 3) as ground_3,
                    COUNT(*) FILTER (WHERE groundService = 4) as ground_4,
                    COUNT(*) FILTER (WHERE groundService = 5) as ground_5,
                    
                    COUNT(*) FILTER (WHERE wifiConnectivity = 0) as wifi_0,
                    COUNT(*) FILTER (WHERE wifiConnectivity = 1) as wifi_1,
                    COUNT(*) FILTER (WHERE wifiConnectivity = 2) as wifi_2,
                    COUNT(*) FILTER (WHERE wifiConnectivity = 3) as wifi_3,
                    COUNT(*) FILTER (WHERE wifiConnectivity = 4) as wifi_4,
                    COUNT(*) FILTER (WHERE wifiConnectivity = 5) as wifi_5,
                    
                    COUNT(*) FILTER (WHERE valueForMoney = 0) as value_0,
                    COUNT(*) FILTER (WHERE valueForMoney = 1) as value_1,
                    COUNT(*) FILTER (WHERE valueForMoney = 2) as value_2,
                    COUNT(*) FILTER (WHERE valueForMoney = 3) as value_3,
                    COUNT(*) FILTER (WHERE valueForMoney = 4) as value_4,
                    COUNT(*) FILTER (WHERE valueForMoney = 5) as value_5
                FROM reviews
                WHERE LOWER(airlineName) = LOWER(%s);
                """,
                (airline_name,)
            )
            
            row = self.cur.fetchone()
            
            if not row:
                return None
            
            total_seat = sum(row[0:6])
            total_cabin = sum(row[6:12])
            total_food = sum(row[12:18])
            total_entertainment = sum(row[18:24])
            total_ground = sum(row[24:30])
            total_wifi = sum(row[30:36])
            total_value = sum(row[36:42])
            
            return {
                "Seat Comfort": [
                    row[i] / total_seat if total_seat > 0 else 0 
                    for i in range(0, 6)
                ],
                "Cabin & Staff Service": [
                    row[i] / total_cabin if total_cabin > 0 else 0 
                    for i in range(6, 12)
                ],
                "Food & Beverages": [
                    row[i] / total_food if total_food > 0 else 0 
                    for i in range(12, 18)
                ],
                "Inflight Entertainment": [
                    row[i] / total_entertainment if total_entertainment > 0 else 0 
                    for i in range(18, 24)
                ],
                "Ground Service": [
                    row[i] / total_ground if total_ground > 0 else 0 
                    for i in range(24, 30)
                ],
                "Wifi Connectivity": [
                    row[i] / total_wifi if total_wifi > 0 else 0 
                    for i in range(30, 36)
                ],
                "Value For Money": [
                    row[i] / total_value if total_value > 0 else 0 
                    for i in range(36, 42)
                ]
            }
            
        except Exception as e:
            print(f"Error getting rating distribution: {e}")
            return None

    def get_sub_item_scoring(self, airline_name):
        try:
            self.cur.execute(
                """
                SELECT 
                    seatComfort,
                    cabinStaffService,
                    foodBeverages,
                    inflightEntertainment,
                    groundService,
                    wifiConnectivity,
                    valueForMoney
                FROM airlines
                WHERE LOWER(name) = LOWER(%s);
                """,
                (airline_name,)
            )
            
            target_row = self.cur.fetchone()
            
            if not target_row:
                return None
            
            self.cur.execute(
                """
                SELECT 
                    SUM(seatComfort * calculatedReviewCount) / SUM(calculatedReviewCount) as avg_seatComfort,
                    SUM(cabinStaffService * calculatedReviewCount) / SUM(calculatedReviewCount) as avg_cabinStaffService,
                    SUM(foodBeverages * calculatedReviewCount) / SUM(calculatedReviewCount) as avg_foodBeverages,
                    SUM(inflightEntertainment * calculatedReviewCount) / SUM(calculatedReviewCount) as avg_inflightEntertainment,
                    SUM(groundService * calculatedReviewCount) / SUM(calculatedReviewCount) as avg_groundService,
                    SUM(wifiConnectivity * calculatedReviewCount) / SUM(calculatedReviewCount) as avg_wifiConnectivity,
                    SUM(valueForMoney * calculatedReviewCount) / SUM(calculatedReviewCount) as avg_valueForMoney
                FROM airlines
                WHERE calculatedReviewCount > 0
                AND seatComfort IS NOT NULL
                AND cabinStaffService IS NOT NULL
                AND foodBeverages IS NOT NULL
                AND inflightEntertainment IS NOT NULL
                AND groundService IS NOT NULL
                AND wifiConnectivity IS NOT NULL
                AND valueForMoney IS NOT NULL;
                """
            )
            
            avg_row = self.cur.fetchone()
            
            return {
                "target_airline": {
                    "Seat Comfort": round(target_row[0], 1) if target_row[0] is not None else 0,
                    "Cabin Staff & Service": round(target_row[1], 1) if target_row[1] is not None else 0,
                    "Food & Beverages": round(target_row[2], 1) if target_row[2] is not None else 0,
                    "Inflight Entertainment": round(target_row[3], 1) if target_row[3] is not None else 0,
                    "Ground Service": round(target_row[4], 1) if target_row[4] is not None else 0,
                    "Wifi Connectivity": round(target_row[5], 1) if target_row[5] is not None else 0,
                    "Value for Money": round(target_row[6], 1) if target_row[6] is not None else 0
                },
                "average_score": {
                    "Seat Comfort": round(avg_row[0], 1) if avg_row and avg_row[0] is not None else 0,
                    "Cabin Staff & Service": round(avg_row[1], 1) if avg_row and avg_row[1] is not None else 0,
                    "Food & Beverages": round(avg_row[2], 1) if avg_row and avg_row[2] is not None else 0,
                    "Inflight Entertainment": round(avg_row[3], 1) if avg_row and avg_row[3] is not None else 0,
                    "Ground Service": round(avg_row[4], 1) if avg_row and avg_row[4] is not None else 0,
                    "Wifi Connectivity": round(avg_row[5], 1) if avg_row and avg_row[5] is not None else 0,
                    "Value for Money": round(avg_row[6], 1) if avg_row and avg_row[6] is not None else 0
                }
            }
            
        except Exception as e:
            print(f"Error getting sub-item scoring: {e}")
            return None
    
    def get_top_rated_airlines(self):
        try:
            self.cur.execute(
                """
                SELECT 
                    name,
                    score,
                    calculatedReviewCount
                FROM airlines
                WHERE score IS NOT NULL
                AND calculatedReviewCount IS NOT NULL
                ORDER BY score DESC;
                """
            )
            
            results = self.cur.fetchall()
            
            if not results:
                return []

            colors = ['#0095ff', '#00e096', '#884dff', '#ff8f0d', '#f64e60']
        
            return [
                {
                    "rank": str(i + 1).zfill(2),
                    "name": row[0],
                    "rating": round(row[1], 1) if row[1] else 0,
                    "reviewCount": row[2] if row[2] else 0,
                    "color": colors[i % len(colors)]
                }
                for i, row in enumerate(results)
            ]
            
        except Exception as e:
            print(f"Error getting top rated airlines: {e}")
            return []

    def get_airline_city_distribution(self, airline_name, cities_csv_path='worldcities.csv'):
        try:
            import csv
            city_coords = {}
            
            with open(cities_csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    city_name = row['city']
                    city_coords[city_name] = {
                        'lng': float(row['lng']),
                        'lat': float(row['lat'])
                    }
            
            self.cur.execute(
                """
                SELECT 
                    route,
                    COUNT(*) as route_count
                FROM reviews
                WHERE LOWER(airlineName) = LOWER(%s)
                AND route IS NOT NULL
                AND route != ''
                AND route LIKE '%%to%%'
                GROUP BY route;
                """,
                (airline_name,)
            )
            
            results = self.cur.fetchall()

            if not results:
                return []
            
            city_counts = {}
            
            for row in results:
                route = row[0]
                count = row[1]
                
                if ' to ' in route:
                    parts = route.split(' to ')
                    if len(parts) == 2:
                        origin = parts[0].strip()
                        destination = parts[1].strip()
                        
                        city_counts[origin] = city_counts.get(origin, 0) + count
                        city_counts[destination] = city_counts.get(destination, 0) + count
            
            scatter_data = []
            colors = ['#fbbf24', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981', '#22c55e']
            
            for i, (city, count) in enumerate(sorted(city_counts.items(), key=lambda x: x[1], reverse=True)):
                coords = city_coords.get(city)
                if coords:
                    scatter_data.append({
                        "name": city,
                        "value": [coords['lng'], coords['lat'], count],
                        "itemStyle": {"color": colors[i % len(colors)]}
                    })
            
            return scatter_data
            
        except Exception as e:
            print(f"Error getting city distribution: {e}")
            return []

    def get_airline_info(self, airline_name):
        try:
            self.cur.execute(
                """
                SELECT 
                    name,
                    image
                FROM airlines
                WHERE LOWER(name) = LOWER(%s);
                """,
                (airline_name,)
            )
            
            row = self.cur.fetchone()
            
            if not row:
                return None
            
            return {
                "name": row[0],
                "image": row[1] if row[1] else ""
            }
            
        except Exception as e:
            print(f"Error getting airline info: {e}")
            return None

    def get_reviews_by_airline(self, airline_name, keyword=None):
        try:
            self.cur.execute(
                """
                SELECT 
                    reviewId, title, score, content, verifiedType, userName, country,
                    dateReview, aircraft, typeOfTraveller, seatType, dateFlown, recommended
                FROM reviews
                WHERE LOWER(airlineName) = LOWER(%s)
                ORDER BY dateReview DESC;
                """,
                (airline_name,)
            )
            
            results = self.cur.fetchall()
            
            if not results:
                return []
            
            return [
                {
                    "reviewId": row[0] or "N/A",
                    "title": row[1] or "",
                    "score": round(row[2], 1) if row[2] is not None else 0,
                    "content": row[3] or "N/A",
                    "verifiedType": row[4] or "N/A",
                    "userName": row[5] or "N/A",
                    "country": row[6] or "N/A",
                    "reviewDate": row[7].strftime("%Y-%m-%d") if row[7] else "N/A",
                    "aircraft": row[8] or "N/A",
                    "typeOfTraveller": row[9] or "N/A",
                    "seatType": row[10] or "N/A",
                    "flownDate": row[11] or "N/A",
                    "recommended": row[12] or "N/A",
                }
                for row in results
            ]
            
        except Exception as e:
            print(f"Error getting reviews: {e}")
            return []

    def close(self):
        if self.conn:
            self.cur.close()
            self.conn.close()