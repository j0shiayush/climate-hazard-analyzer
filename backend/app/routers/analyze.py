from fastapi import APIRouter, HTTPException, Request
from app.schemas import AnalyzeRequest
from app.services.ingestion import get_clean_climate_data
from app.services.climate_logic import detect_heatwaves
from app.services.statistics import calculate_trends

router = APIRouter(prefix="/api/v1/analyze", tags=["Analyze"])

@router.post("/")
async def analyze_climate_hazard(request: Request, payload: AnalyzeRequest):
    try:
        start_date = f"{payload.start_year}-01-01"
        end_date = f"{payload.end_year}-12-31"
        
        df = await get_clean_climate_data(
            lat=payload.lat, 
            lon=payload.lon, 
            start_date=start_date, 
            end_date=end_date
        )
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No weather data found for this region/time.")

        hazard_results = detect_heatwaves(df)
        
        trends = calculate_trends(hazard_results["annual_stats"])
        
        return {
            "status": "success",
            "region": {"lat": payload.lat, "lon": payload.lon},
            "period": f"{payload.start_year}-{payload.end_year}",
            "baseline_threshold_celsius": hazard_results["baseline_95th"],
            "insights": trends.get("insights", {}),
            "trends": trends,
            "annual_stats": hazard_results["annual_stats"],
            "events": hazard_results["events"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))