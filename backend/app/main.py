from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Online Exhibition API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers.auth import router as auth_router
from app.routers.works import router as works_router
from app.routers.reviews import router as reviews_router
from app.routers.likes import router as likes_router

app.include_router(auth_router)
app.include_router(works_router)
app.include_router(reviews_router)
app.include_router(likes_router)

@app.get("/")
def root():
    return {"message": "Online Exhibition API"}
