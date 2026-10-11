from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database.connection import get_db
from ..database.models import User

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/")
def get_users(
    db: Session = Depends(get_db)
):
    query=text("""
WITH customer_stats AS
(SELECT u.user_id,u.first_name || ' ' || u.last_name as name,
COUNT(DISTINCT o.order_id) AS orders,
COALESCE(SUM(o.sale_price),0) as revenue,

COALESCE(
        COUNT(*) FILTER(WHERE o.status='Returned')::numeric
        / NULLIF(COUNT(*),0),0
)AS return_rate

FROM users u
LEFT  JOIN order_items o 
ON o.user_id=u.user_id
AND o.created_at >=  DATE '12-06-2022' - INTERVAL '1 year'
AND o.created_at < DATE '12-06-2022'
GROUP BY u.user_id,u.first_name,u.last_name)



SELECT
    cs.user_id AS id,
    cs.name,
    cs.orders,
    cs.revenue,

    cs.return_rate AS "returnRate",

    CASE
        WHEN cs.return_rate >= 0.30 THEN 'HIGH'
        WHEN cs.return_rate >= 0.15 THEN 'MEDIUM'
        ELSE 'LOW'
    END AS risk,

    CASE
        WHEN cs.orders > 1 THEN true
        ELSE false
    END AS "returningCustomer"



FROM customer_stats cs
LIMIT 1000;

""")
    result = db.execute(query)
    users=[
        dict(row._mapping)
        for row in result
    ]
    return users

@router.get("/{user_id}")
def get_user_history(
    user_id:int,
    db:Session=Depends(get_db)
):
    query=text("""
        WITH 
        customer_history AS(
        SELECT o.user_id,
            json_agg(
                        json_build_object(
                            'orderId',o.order_id,
                            'date',o.created_at,
                            'amount',o.sale_price,
                            'returned',o.status='Returned'

                        )    ORDER BY o.created_at DESC   
            ) AS history
            FROM order_items o
            WHERE o.user_id=:user_id AND  o.created_at >= DATE '12-06-2022' - INTERVAL '1 year'
        AND o.created_at < DATE '12-06-2022'
            GROUP BY o.user_id

        ),

        favourite_categories AS (
        SELECT user_id,array_agg(product_category ORDER BY category_count DESC) AS categories
        FROM(
        SELECT o.user_id,p.category AS product_category,
        COUNT(*) AS category_count,

        ROW_NUMBER() OVER(
                PARTITION BY o.user_id
                ORDER BY Count(*) DESC
        )AS rn
        FROM order_items o
        JOIN products p
        ON p.id=o.product_id
        WHERE o.user_id=:user_id AND o.created_at >= DATE '12-06-2022'- INTERVAL '1 year'
                AND o.created_at < DATE '12-06-2022'
        GROUP BY
        o.user_id,p.category
            )x
            WHERE rn<=3
            GROUP BY user_id
        )

        SELECT 
        COALESCE(fc.categories, ARRAY[]::text[]) AS "favoriteCategories",

            COALESCE(
                ch.history,
                '[]'::json
            ) AS history

        FROM customer_history ch
        LEFT JOIN favourite_categories fc
            ON fc.user_id = ch.user_id;

        """)

    result=db.execute(query,{"user_id":user_id})
    row=result.fetchone()
    if row is None:
        return {
            "favoriteCategories": [],
            "history": []
        }

    return dict(row._mapping)


    
