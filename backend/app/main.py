from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, store, profile, admin

app = FastAPI(title="Merch Store API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3100"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(store.router)
app.include_router(profile.router)
app.include_router(admin.router)