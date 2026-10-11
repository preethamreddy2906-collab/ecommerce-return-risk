from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..agent.sql_agent import execute_sql

router = APIRouter(
    prefix="/agent",
    tags=["AI Agent"]
)

@router.post("/query")
def agent_query(
    question: str,
    db: Session = Depends(get_db)
):

    try:

        result = execute_sql(
            question,
            db
        )

        return result

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )