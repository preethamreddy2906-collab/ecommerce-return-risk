from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database.connection import get_db
from ..database.models import Orders

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

#  id: string; 
# customer: string; 
# email: string; 
# date: string; 
# items: { name: string; quantity: number; price: number }[]; 
# revenue: number; 
# status: OrderStatus; 
# risk: Risk; 
# returnProbability: number | null; customerReturnRate: number; customerOrders: number 
# }
@router.get("/")
def get_orders(
    db: Session = Depends(get_db)
):
    query = text("""
    WITH order_item_stats AS (
        SELECT
            oi.order_id,
            oi.product_id,
            p.name AS product_name,
            COUNT(*) AS quantity,
            SUM(oi.sale_price) AS price
        FROM order_items oi
        JOIN products p
            ON p.id = oi.product_id
        GROUP BY
            oi.order_id,
            oi.product_id,
            p.name
    ),

    order_items_agg AS (
        SELECT
            order_id,
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'name', product_name,
                    'quantity', quantity,
                    'price', price
                )
                ORDER BY product_name
            ) AS items
        FROM order_item_stats
        GROUP BY order_id
    ),

    customer_stats AS (
        SELECT
            o.user_id,
            COUNT(DISTINCT o.order_id) AS customer_orders,
            COALESCE(
                COUNT(DISTINCT o.order_id) FILTER (
                    WHERE EXISTS (
                        SELECT 1
                        FROM order_items oi
                        WHERE oi.order_id = o.order_id
                          AND oi.status = 'Returned'
                    )
                )::numeric
                / NULLIF(COUNT(DISTINCT o.order_id), 0),
                0
            ) AS customer_return_rate
        FROM orders o
        GROUP BY o.user_id
    )

    SELECT
        o.order_id::text AS id,
        COALESCE(u.first_name, '') || ' ' ||
            COALESCE(u.last_name, '') AS customer,
        u.email,
        o.created_at AS date,
        COALESCE(ia.items, '[]'::json) AS items,
        COALESCE(SUM(oi.sale_price), 0) AS revenue,
        o.status,
        COALESCE(cs.customer_return_rate, 0)
            AS customer_return_rate,
        COALESCE(cs.customer_orders, 0)
            AS customer_orders
    FROM orders o
    JOIN users u
        ON u.id = o.user_id
    LEFT JOIN order_items oi
        ON oi.order_id = o.order_id
    LEFT JOIN order_items_agg ia
        ON ia.order_id = o.order_id
    LEFT JOIN customer_stats cs
        ON cs.user_id = o.user_id
    GROUP BY
        o.order_id,
        o.user_id,
        u.first_name,
        u.last_name,
        u.email,
        o.created_at,
        o.status,
        ia.items,
        cs.customer_return_rate,
        cs.customer_orders
    ORDER BY o.created_at DESC
    LIMIT 100;
""")
    result = db.execute(query)
    orders=[
        dict(row._mapping) for row in result
    ]
    return orders