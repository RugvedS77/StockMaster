from fastapi import FastAPI
from router import authRoutes

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(authRoutes.router)