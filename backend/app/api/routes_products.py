from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database.connection import get_db
from ..database.models import Products

router=APIRouter(
    prefix="/products",
    tags=["Products"]
)

@router.get("/")
def get_products(db:Session=Depends(get_db)):
    query=text("""
WITH product_stats AS (
    SELECT
        p.id,
        p.name,
        p.category,
        p.brand,
        COALESCE(SUM(oi.sale_price), 0) AS revenue,
        COUNT(*) AS units_sold,

        COALESCE(
            COUNT(*) FILTER (WHERE oi.status = 'Returned')::numeric
            / NULLIF(COUNT(*), 0),
            0
        ) AS returnRate,

        COALESCE(
            SUM(oi.sale_price - p.cost),
            0
        ) AS profit

    FROM products p
    LEFT JOIN order_items oi
        ON oi.product_id = p.id
        AND oi.created_at >= DATE '2022-06-12' - INTERVAL '1 year'
        AND oi.created_at < DATE '2022-06-12'

    GROUP BY p.id, p.name, p.category
)

SELECT
    id,
    name,
    category,
    brand,
    revenue,
    units_sold AS orders,
    returnRate AS "returnRate",
    profit,

    CASE
        WHEN returnRate >= 0.30 THEN 'HIGH'
        WHEN returnRate >= 0.15 THEN 'MEDIUM'
        ELSE 'LOW'
    END AS risk

FROM product_stats
ORDER BY revenue DESC
LIMIT 1000;
""")
    result=db.execute(query)
    products=[
        dict(row._mapping)
        for row in result
    ]
    return products