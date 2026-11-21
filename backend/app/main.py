from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="LoadStream API",
    description="Backend API for LoadStream",
    version="1.0.0",
)

# Configure CORS so the Next.js frontend can communicate with FastAPI
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "status": "connected",
        "message": "Welcome to LoadStream Backend API",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LoadStream Backend",
        "frontend_connected": True,
    }
