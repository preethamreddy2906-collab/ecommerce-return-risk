from fastapi import APIRouter,Depends,HTTPException
from pydantic import BaseModel,Field
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..ml.predictor import predict_return
from ..ml.features import get_features

router=APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)

class ReturnPredictionRequest(BaseModel):
    user_id:int
    product_id:int
    order_id:int
    sale_price:float=Field(ge=0)

@router.post("/return-risk")
def predict_order_return(request:ReturnPredictionRequest,db:Session=Depends(get_db)):
    try:
        features=get_features(
            user_id=request.user_id,
            product_id=request.product_id,
            order_id=request.order_id,
            sale_price=request.sale_price,
            db=db
        )
        result=predict_return(features)
        probability=result["return_prob"]
        return {
            "order_id": request.order_id,
            "product_id": request.product_id,
            "prediction": result["prediction"],
            "returnProbability": probability,
            "risk": (
                "HIGH" if probability >= 0.70
                else "MEDIUM" if probability >= 0.40
                else "LOW"
            )
        }
    except ValueError as e:
        raise HTTPException(status_code=404,detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500,detail="Return prediction failed") from e
