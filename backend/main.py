from fastapi import FastAPI

app = FastAPI(title="Climate Hazard API", version="1.0")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Climate Hazard API is running."}