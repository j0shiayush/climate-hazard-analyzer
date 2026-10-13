# app/schemas.py
from pydantic import BaseModel, Field, field_validator

class AnalyzeRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90, description="Latitude between -90 and 90")
    lon: float = Field(..., ge=-180, le=180, description="Longitude between -180 and 180")
    start_year: int = Field(1990, ge=1950, description="Start year (YYYY)")
    end_year: int = Field(2023, le=2024, description="End year (YYYY)")
    hazard_type: str = Field("heatwave", pattern="^heatwave$")

    @field_validator('end_year')
    def check_year_range(cls, v, info):
        if 'start_year' in info.data and v <= info.data['start_year']:
            raise ValueError('end_year must be strictly greater than start_year')
        return v