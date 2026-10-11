from fastapi import APIRouter,Depends,Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import date

from ..database.connection import get_db
from ..llm.weekly_report import generate_weekly_report,generate_weekly_comparision


router=APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

@router.get("/weekly")
def weekly_report(start_date:date=Query(...),end_date:date=Query(...),db:Session=Depends(get_db)):
    query=text(
        """
        SELECT COUNT(DISTINCT oi.order_id) AS total_orders,
        COUNT(oi.id) AS total_items,

       ROUND(COALESCE(
            SUM(oi.sale_price),0)::numeric
            ,2)AS total_revenue,

        COALESCE(
            SUM(oi.sale_price-p.cost)
        ) AS gross_profit,

        COALESCE(
            SUM(p.cost)
        )AS product_cost,


        COUNT(*) FILTER(
            WHERE oi.status='Returned'
        )AS returned,

        COUNT(*) FILTER(
            WHERE oi.status='Cancelled'
        )AS cancelled,

        ROUND(
            COUNT(*) FILTER(
                WHERE oi.status='Returned'
            )*100
            /
            NULLIF(COUNT(oi.id),0),2
        )as return_rate
        FROM order_items oi
        JOIN products p
        ON p.id=oi.product_id
        WHERE oi.created_at>=:start_date AND oi.created_at<:end_date;
        """
    )
    result=db.execute(query,{"start_date":start_date,"end_date":end_date}).first()

    product_query=text(
        """
        SELECT p.id as product_id,p.name as product_name,p.category as product_category,
        COUNT(oi.id) as items_sold,
        COALESCE(
            SUM(oi.sale_price),0
        )AS revenue,

        COUNT(*) FILTER(
        WHERE oi.status = 'Returned'
        ) AS returned_items,
        
        ROUND(
            COUNT(*) FILTER (
                WHERE oi.status = 'Returned'
            ) * 100.0
            / NULLIF(COUNT(oi.id), 0),
            2
        ) AS return_rate

        FROM order_items oi
        JOIN products p
        ON oi.product_id=p.id

        WHERE oi.created_at>=:start_date AND oi.created_at<:end_date
        GROUP BY p.id
        ORDER BY revenue DESC
        LIMIT 10;
        """
    )
    product_result=db.execute(product_query,{"start_date":start_date,"end_date":end_date})

    category_query=text("""
        SELECT p.category,
        COUNT(oi.id) AS items_sold,

        COALESCE(SUM(oi.sale_price), 0) AS revenue,

        COUNT(*) FILTER (
        WHERE oi.status = 'Returned'
    ) AS returned_items,

    ROUND(
        COUNT(*) FILTER (
            WHERE oi.status = 'Returned'
        ) * 100.0
        / NULLIF(COUNT(oi.id), 0),
        2
    ) AS return_rate

    FROM order_items oi
    JOIN products p
    ON p.id=oi.product_id
    WHERE oi.created_at>=:start_date AND oi.created_at<:end_date
    GROUP BY p.category
    ORDER BY revenue DESC
    LIMIT 10;
    """)

    category_result=db.execute(category_query,{"start_date":start_date,"end_date":end_date})
    report_data={"weekly_metrics":dict(result._mapping),
            "top_products":[dict(row._mapping) for row in product_result],
            "top_categories":[dict(row._mapping) for row in category_result]}
    # report=generate_weekly_report(report_data)
    return report_data


@router.get("/weekly-comparision")
def weekly_comparision(start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db)):
    duration = end_date - start_date

    # Current week
    current_week = weekly_report(
        start_date,
        end_date,
        db
    )

    # Previous week
    previous_week = weekly_report(
        start_date - duration,
        start_date,
        db
    )

    # Send both weeks to LLM
    report = generate_weekly_comparision(
        current_week,
        previous_week
    )

    return {
        "current_week": current_week,
        "previous_week": previous_week,
        "report": report
    }
    

