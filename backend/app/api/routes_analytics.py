from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from ..database.connection import get_db

router=APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.get("/customers")
def customer_analytics(db:Session=Depends(get_db)):
    query=text(
        """
SELECT u.user_id,u.first_name,u.last_name,
COUNT(o.order_id) AS total_orders,
COUNT(*) FILTER(
    WHERE o.status='Returned'
)AS returned_orders,

COUNT(*) FILTER(
    WHERE o.status='Cancelled'
)AS cancelled_orders,

COUNT(*) FILTER(
    WHERE o.status='Complete'
)AS successful_orders,

ROUND(
COUNT(*) FILTER(
    WHERE o.status='Returned'
    )*100
    /
    NULLIF(COUNT(o.order_id),0),2
)AS return_rate

FROM users u
LEFT JOIN orders o
ON u.user_id=o.user_id
GROUP BY(u.user_id,u.first_name,u.last_name)
ORDER BY u.user_id
LIMIT 100
"""
    ) 
    result=db.execute(query)
    return [
        dict(row._mapping) for row in result
    ]



@router.get("/products")
def product_analytics(db:Session=Depends(get_db)):
    query=text(
        """
    SELECT p.id AS product_id,p.name,p.category,p.brand,p.cost,p.retail_price,
    COUNT(oi.id) AS total_items_sold,
    COUNT(*) FILTER(
        WHERE oi.status='Returned'
        )AS returned,

    COUNT(*) FILTER(
        WHERE oi.status='Cancelled'
    )as cancelled,

    COUNT(*)FILTER(
        WHERE oi.status='Complete'
    )as successful,

    COALESCE(
        SUM(oi.sale_price),0
    )AS total_revenue,

    ROUND(
        COUNT(*) FILTER(
            WHERE oi.status='Returned'
        ) 
        /
        NULLIF(COUNT(oi.id),0),2
    )as return_rate

    FROM products p
    LEFT JOIN order_items oi
    ON p.id=oi.product_id

    GROUP BY p.id,p.name,p.category,p.brand,p.cost,p.retail_price
    ORDER BY total_revenue DESC
    LIMIT 100    
"""
    )  
    result=db.execute(query)
    return [
        dict(row._mapping)
        for row in result
    ]

@router.get("/categories")
def category_analysis(db:Session=Depends(get_db)):
    query=text(
        """
    SELECT p.category,
    COUNT(oi.id) AS total_items_sold,
    COUNT(*) FILTER (
                WHERE oi.status = 'Returned'
            ) AS returned,

            COUNT(*) FILTER (
                WHERE oi.status = 'Cancelled'
            ) AS cancelled,

            COALESCE(
                SUM(oi.sale_price),
                0
            ) AS total_revenue,

            ROUND(
                COUNT(*) FILTER (
                    WHERE oi.status = 'Returned'
                ) * 100.0
                / NULLIF(COUNT(oi.id), 0),
                2
            ) AS return_rate

        FROM products p

        LEFT JOIN order_items oi
            ON p.id = oi.product_id

        GROUP BY p.category

        ORDER BY total_revenue DESC
    """
    )
    result=db.execute(query)
    return[
        dict(row._mapping)
        for row in result
    ]


@router.get("/revenue")
def revenue_analytics(db:Session=Depends(get_db)):
    query=text(
        """
        SELECT DATE_TRUNC('month',oi.created_at)AS month,
        COUNT(DISTINCT oi.order_id) AS total_orders,
        COUNT(oi.id) AS total_items_sold,
        COALESCE(
        SUM(oi.sale_price),0
        )AS total_revenue
        FROM order_items oi
        GROUP BY DATE_TRUNC('month',oi.created_at)
        ORDER BY month;        
        """
    )

    result=db.execute(query)
    return[
        dict(row._mapping)
        for row in result
    ]




