# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routers import analyze

# 1. Rate Limiter Setup (limits IP to 10 requests per minute)
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Climate Hazard API", version="1.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 2. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Register Routers
app.include_router(analyze.router)

@app.get("/")
@limiter.limit("5/minute")
def health_check(request: Request):
    return {"status": "healthy", "service": "Climate Hazard API"}