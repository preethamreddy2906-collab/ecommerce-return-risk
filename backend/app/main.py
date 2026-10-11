from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes_products import router as products_router
from .api.routes_orders import router as orders_router
from .api.routes_users import router as users_router
from .api.routes_analytics import router as analytics_router
from .api.routes_reports import router as reports_router
from .api.routes_agent import router as agent_router
from .api.routes_predictions import router as predictions_router


app = FastAPI(
    title="E-Commerce AI API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(products_router)
app.include_router(orders_router)
app.include_router(users_router)
app.include_router(analytics_router)
app.include_router(reports_router)
app.include_router(agent_router)
app.include_router(predictions_router)

@app.get("/")
def root():
    return {
        "message": "E-Commerce AI API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
