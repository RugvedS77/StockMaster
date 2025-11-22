from fastapi import FastAPI
from router import authRoutes, inventoryRoutes, productRoutes

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(authRoutes.router)
app.include_router(productRoutes.router)
app.include_router(inventoryRoutes.router)