# app/services/climate_logic.py
import pandas as pd
import numpy as np

def detect_heatwaves(df: pd.DataFrame) -> dict:
    """
    Detects heatwaves: 3+ consecutive days with Tmax > 95th percentile.
    Returns the baseline, individual events, and annual aggregates.
    """
    if df.empty:
        return {"events": [], "annual_stats": []}

    # 1. Calculate the 95th percentile baseline
    threshold_95 = df["tmax"].quantile(0.95)
    
    # 2. Identify days exceeding the threshold
    df["is_hot"] = df["tmax"] > threshold_95
    
    # 3. Find consecutive hot days (Run-length encoding)
    # Create a unique ID for each group of consecutive hot days
    df["block"] = (~df["is_hot"]).cumsum()
    hot_blocks = df[df["is_hot"]].groupby("block")
    
    events = []
    for _, group in hot_blocks:
        duration = len(group)
        if duration >= 3:  # Heatwave definition: 3+ consecutive days
            events.append({
                "start_date": group["date"].iloc[0].strftime("%Y-%m-%d"),
                "end_date": group["date"].iloc[-1].strftime("%Y-%m-%d"),
                "duration_days": duration,
                "peak_tmax": round(group["tmax"].max(), 2),
                "avg_tmax": round(group["tmax"].mean(), 2)
            })
            
    # 4. Calculate Annual Aggregates
    df["year"] = df["date"].dt.year
    annual_groups = df.groupby("year")
    
    annual_stats = []
    event_df = pd.DataFrame(events)
    if not event_df.empty:
        event_df["start_year"] = pd.to_datetime(event_df["start_date"]).dt.year
    
    for year, _ in annual_groups:
        year_events = event_df[event_df["start_year"] == year] if not event_df.empty else pd.DataFrame()
        annual_stats.append({
            "year": int(year),
            "heatwave_count": len(year_events),
            "total_heatwave_days": int(year_events["duration_days"].sum()) if not year_events.empty else 0,
            "max_intensity": float(year_events["peak_tmax"].max()) if not year_events.empty else 0.0
        })

    return {
        "baseline_95th": round(threshold_95, 2),
        "events": events,
        "annual_stats": annual_stats
    }