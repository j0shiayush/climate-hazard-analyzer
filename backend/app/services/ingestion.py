import pandas as pd
from app.database import weather_cache
from app.services.weather_client import fetch_historical_weather

async def get_clean_climate_data(lat: float, lon: float, start_date: str, end_date: str) -> pd.DataFrame:
    cache_key = f"{round(lat, 2)}_{round(lon, 2)}_{start_date}_{end_date}"
    
    # 1. Check Cache
    cached_data = await weather_cache.find_one({"_id": cache_key})
    if cached_data:
        return pd.DataFrame(cached_data["data"])
    
    # 2. Fetch from API on Cache Miss
    raw_data = await fetch_historical_weather(lat, lon, start_date, end_date)
    
    if "daily" not in raw_data:
        raise ValueError("Invalid data format received from API")

    # 3. Clean Data with Pandas
    df = pd.DataFrame({
        "date": raw_data["daily"]["time"],
        "tmax": raw_data["daily"]["temperature_2m_max"]
    })
    
    # Convert date strings to datetime and handle missing values (forward fill)
    df["date"] = pd.to_datetime(df["date"])
    df["tmax"] = df["tmax"].ffill() # Fill gaps in real-world data
    
    # 4. Save to Cache
    records = df.to_dict(orient="records")
    await weather_cache.insert_one({
        "_id": cache_key,
        "lat": lat,
        "lon": lon,
        "start_date": start_date,
        "end_date": end_date,
        "data": records
    })
    
    return df