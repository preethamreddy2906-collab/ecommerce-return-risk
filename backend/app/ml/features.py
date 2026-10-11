from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime,date


from ..database.connection import get_db

# def get_features(user_id,product_id,order_id,sale_price,db):
#     #Customer return ratio

#     query=text("""
#         ROUND((SELECT COUNT(*)
#         FROM order_items
#         WEHERE user_id=:user_id AND status='Returned')
#         /
#         (SELECT COUNT(*)
#         FROM order_items
#         WHERE user_id=:user_id
#         ),2)
# """)


#     #Product Return ratio

#     query=text("""
#             ROUND((SELECT COUNT(*)
#             FROM order_items
#             WEHERE product_id=:product_id AND status='Returned')
#             /
#             (SELECT COUNT(*)
#             FROM order_items
#             WHERE product_id=:product_id
#             ),2)
#     """)

#     # Product Total Orders

#     query=text("""
#             SELECT COUNT(*)
#             FROM order_items
#             WHERE product_id=:product_id
#     """)

#     # PRoduct Total cancel
#     query=text("""
#         SELECT COUNT(*)
#         FROM order_items
#         WEHERE product_id=:product_id AND status='Canclled';
#         """)

#     # PRoduct Total Return
#     query=text("""
#             SELECT COUNT(*)
#             FROM order_items
#             WEHERE product_id=:product_id AND status='Returned';
#             """)   

#     # Product total Success
#     query=text("""
#             SELECT COUNT(*)
#             FROM order_items
#             WEHERE product_id=:product_id AND status='Complete';
#             """) 

#     # Product_loss_ratio
#     query=text("""
#             SELECT COUNT(*)
#             FROM order_items
#             WHERE product_id=:product_id AND status IN ('Returned','Cancelled'),
#              /
#               SELECT COUNT(*)
#               FROM order_items
#               WHERE product_id:=product_id;
#     """)

#     # Product Success Ratio
#     query=text("""
#             (SELECT COUNT(*)
#             FROM order_items
#             WEHERE product_id=:product_id AND status='Complete';
#             )        
#             /
#             (
#             SELECT COUNT(*)
#             FROM order_items
#             WHERE product_id=:product_id; 
#             )
# """)
#     # Product_Return_days_Avg_3  

#     query=text(
#         """
#             SELECT AVG(Return_days) OVER(
#             PARTITION BY product_id
#             ORDER BY created_at
#             ROWS BETWEEN 3 PRECEEDING AND 1 PRECEEDING
#             ) AS Product_Return_days_Avg_3
#             FROM order_items;
# """
#     )
#     #  9   Product_Return_days_Avg_all

#     query=text("""
#             SELECT AVG(Return_days)
#             OVER (
#         PARTITION BY product_id
#         ORDER BY created_at
#         ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
#     ) AS Product_Return_days_Avg_all

# FROM order_items oi;
# """)

#     # User Total Order
#     query=text("""
#         SELECT COUNT(*)
#         FROM order_items
#         WHERE user_id=:user_id
# """)

#     # USer Total Cancel
#     query=text("""
#             SELECT COUNT(*)
#             FROM order_items
#             WHERE user_id=:user_id AND status='Cancelled'
#     """)

#     # User total Return
#     query=text("""
#             SELECT COUNT(*)
#             FROM order_items
#             WHERE user_id=:user_id  AND status='Returned'
#     """)

#     # User Total Success
#     query=text("""
#             SELECT COUNT(*)
#             FROM order_items
#             WHERE user_id=:user_id AND status='Complete'
#     """)

# #      User_return_days_Avg_3      

#     query=text("""
#     SELECT  AVG(Return_days)
#     OVER (
#         PARTITION BY user_id
#         ORDER BY created_at
#         ROWS BETWEEN 3 PRECEDING AND 1 PRECEDING
#     ) AS User_Return_days_Avg_3

#     FROM order_items;

# """)
# #  15  User_return_days_Avg_all    

#     query=text("""
#         SELECT  AVG(Return_days)
#         OVER (
#             PARTITION BY user_id
#             ORDER BY created_at
#             ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
#         ) AS User_Return_days_Avg_all
    
#         FROM order_items;
    
#     """)
# #  16  User_loss_ratio   
#     query=text("""
#                 (SELECT COUNT(*)
#                 FROM order_items
#                 WHERE user_id=:user_id AND status IN ('Returned','Cancelled')
#                 /
#                 SELECT COUNT(*)
#                 FROM order_items
#                 WHERE user_id:=user_id;
#                 )
#         """)


# #  17  User_Success_ratio   
#     curr_date=datetime.now()
#     order_month=curr_date.month
#     order_day=curr_date.day
#     order_hour=curr_date.hour

#     # country
#     query=("""
#         SELECT country
#         FROM users
#         WHERE user_id=:user_id
# """)

#     # gender
#     query("""
#         SELECT gender 
#         FROM users
#         WHERE user_id=:user_id
# """)

#     # age
#     query=("""
#         SELECT age 
#         FROM users
#         WHERE user_id=:user_id
# """)


#     #traffic_source
#     query=("""
#         SELECT traffic_source 
#         FROM users
#         WHERE user_id=:user_id
# """)

#     # acc_age
#     query=("""
#         SELECT created_at
#         FROM users
#         WHERE user_id=:user_id
# """)

#     #product_Cat
#     query=("""
#         SELECT category 
#         FROM products
#         WHERE id=:product_id
# """)

#     # product_brand
#     query=("""
#             SELECT brand 
#             FROM products
#             WHERE id=:product_id
#     """)

#     # Dept
#     query=("""
#                 SELECT department 
#                 FROM products
#                 WHERE id=:product_id
#         """)


#     # sale_price

#     # num_of_items
#     num_of_items=1

#     # UserCat_loss_ratio


#     query=text("""
#         WITH user_cat_features AS (
#     SELECT
#         oi.*,

#         ROW_NUMBER() OVER (
#             PARTITION BY user_id, product_category
#             ORDER BY created_at, id
#         ) - 1 AS UserCat_total_orders,

#         SUM(
#             CASE
#                 WHEN status = 'Cancelled' THEN 1
#                 ELSE 0
#             END
#         ) OVER (
#             PARTITION BY user_id, product_category
#             ORDER BY created_at, id
#             ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
#         ) AS UserCat_total_cancel,

#         SUM(
#             CASE
#                 WHEN status = 'Returned' THEN 1
#                 ELSE 0
#             END
#         ) OVER (
#             PARTITION BY user_id, product_category
#             ORDER BY created_at, id
#             ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
#         ) AS UserCat_total_return,

#         SUM(
#             CASE
#                 WHEN status = 'Complete' THEN 1
#                 ELSE 0
#             END
#         ) OVER (
#             PARTITION BY user_id, product_category
#             ORDER BY created_at, id
#             ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
#         ) AS UserCat_total_success

#     FROM order_items oi
# )

# SELECT
#     *,
    

#     COALESCE(
#         (UserCat_total_cancel + UserCat_total_return)::numeric
#         / NULLIF(UserCat_total_orders, 0),
#         0
#     ) AS UserCat_loss_ratio,


#     COALESCE(
#         UserCat_total_success::numeric
#         / NULLIF(UserCat_total_orders, 0),
#         0
#     ) AS UserCat_Success_ratio

# FROM user_cat_features
# ORDER BY user_id, product_category, created_at, id;
#     """)

#     # UserCat_Success_ratio

#     query=text("""
#             WITH user_cat_features AS (
#     SELECT
#         oi.*,

#         ROW_NUMBER() OVER (
#             PARTITION BY user_id, product_category
#             ORDER BY created_at, id
#         ) - 1 AS UserCat_total_orders,

#         SUM(
#             CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END
#         ) OVER (
#             PARTITION BY user_id, product_category
#             ORDER BY created_at, id
#             ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
#         ) AS UserCat_total_cancel,

#         SUM(
#             CASE WHEN status = 'Returned' THEN 1 ELSE 0 END
#         ) OVER (
#             PARTITION BY user_id, product_category
#             ORDER BY created_at, id
#             ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
#         ) AS UserCat_total_return,

#         SUM(
#             CASE WHEN status = 'Complete' THEN 1 ELSE 0 END
#         ) OVER (
#             PARTITION BY user_id, product_category
#             ORDER BY created_at, id
#             ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
#         ) AS UserCat_total_success

#     FROM order_items oi
# )

# SELECT
#     *,
    
#     COALESCE(
#         (UserCat_total_cancel + UserCat_total_return)::numeric
#         / NULLIF(UserCat_total_orders, 0),
#         0
#     ) AS UserCat_loss_ratio,

#     COALESCE(
#         UserCat_total_success::numeric
#         / NULLIF(UserCat_total_orders, 0),
#         0
#     ) AS UserCat_Success_ratio

# FROM user_cat_features;
#     """)

from sqlalchemy import text
from sqlalchemy.orm import Session


def get_features(
    user_id: int,
    product_id: int,
    order_id: int,
    sale_price: float,
    db: Session
):

    query = text("""
        WITH base AS (
            SELECT
                oi.id,
                oi.order_id,
                oi.user_id,
                oi.product_id,
                oi.status,
                oi.created_at,
                oi.returned_at,
                oi.sale_price,

                -- User information
                u.country,
                u.gender,
                u.age,
                u.traffic_source,
                u.created_at AS user_created_at,

                -- Product information
                p.category AS product_category,
                p.brand AS product_brand,
                p.department AS dept

            FROM order_items oi

            JOIN users u
                ON u.user_id = oi.user_id

            JOIN products p
                ON p.id = oi.product_id
        ),

        features AS (
            SELECT
                b.*,

                /* =====================================================
                   PRODUCT FEATURES
                   ===================================================== */

                -- Product total orders before current order
                ROW_NUMBER() OVER (
                    PARTITION BY product_id
                    ORDER BY created_at, id
                ) - 1 AS Product_total_orders,

                -- Product cancelled orders before current order
                SUM(
                    CASE
                        WHEN status = 'Cancelled' THEN 1
                        ELSE 0
                    END
                ) OVER (
                    PARTITION BY product_id
                    ORDER BY created_at, id
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) AS Product_total_cancel,

                -- Product returned orders before current order
                SUM(
                    CASE
                        WHEN status = 'Returned' THEN 1
                        ELSE 0
                    END
                ) OVER (
                    PARTITION BY product_id
                    ORDER BY created_at, id
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) AS Product_total_return,

                -- Product successful orders before current order
                SUM(
                    CASE
                        WHEN status = 'Complete' THEN 1
                        ELSE 0
                    END
                ) OVER (
                    PARTITION BY product_id
                    ORDER BY created_at, id
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) AS Product_total_success,


                /* =====================================================
                   PRODUCT RETURN DAYS
                   ===================================================== */

                AVG(
                    EXTRACT(
                        EPOCH FROM (returned_at - created_at)
                    ) / 86400.0
                ) OVER (
                    PARTITION BY product_id
                    ORDER BY created_at, id
                    ROWS BETWEEN 3 PRECEDING AND 1 PRECEDING
                ) AS Product_Return_days_Avg_3,

                AVG(
                    EXTRACT(
                        EPOCH FROM (returned_at - created_at)
                    ) / 86400.0
                ) OVER (
                    PARTITION BY product_id
                    ORDER BY created_at, id
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) AS Product_Return_days_Avg_all,


                /* =====================================================
                   USER FEATURES
                   ===================================================== */

                -- User total orders before current order
                ROW_NUMBER() OVER (
                    PARTITION BY user_id
                    ORDER BY created_at, id
                ) - 1 AS User_total_orders,

                -- User cancelled orders before current order
                SUM(
                    CASE
                        WHEN status = 'Cancelled' THEN 1
                        ELSE 0
                    END
                ) OVER (
                    PARTITION BY user_id
                    ORDER BY created_at, id
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) AS User_total_cancel,

                -- User returned orders before current order
                SUM(
                    CASE
                        WHEN status = 'Returned' THEN 1
                        ELSE 0
                    END
                ) OVER (
                    PARTITION BY user_id
                    ORDER BY created_at, id
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) AS User_total_return,

                -- User successful orders before current order
                SUM(
                    CASE
                        WHEN status = 'Complete' THEN 1
                        ELSE 0
                    END
                ) OVER (
                    PARTITION BY user_id
                    ORDER BY created_at, id
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) AS User_total_success,


                /* =====================================================
                   USER RETURN DAYS
                   ===================================================== */

                AVG(
                    EXTRACT(
                        EPOCH FROM (returned_at - created_at)
                    ) / 86400.0
                ) OVER (
                    PARTITION BY user_id
                    ORDER BY created_at, id
                    ROWS BETWEEN 3 PRECEDING AND 1 PRECEDING
                ) AS User_Return_days_Avg_3,

                AVG(
                    EXTRACT(
                        EPOCH FROM (returned_at - created_at)
                    ) / 86400.0
                ) OVER (
                    PARTITION BY user_id
                    ORDER BY created_at, id
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) AS User_Return_days_Avg_all,


                /* =====================================================
                   USER + CATEGORY FEATURES
                   ===================================================== */

                -- User-category previous orders
                ROW_NUMBER() OVER (
                    PARTITION BY user_id, product_category
                    ORDER BY created_at, id
                ) - 1 AS UserCat_total_orders,

                -- User-category cancelled
                SUM(
                    CASE
                        WHEN status = 'Cancelled' THEN 1
                        ELSE 0
                    END
                ) OVER (
                    PARTITION BY user_id, product_category
                    ORDER BY created_at, id
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) AS UserCat_total_cancel,

                -- User-category returned
                SUM(
                    CASE
                        WHEN status = 'Returned' THEN 1
                        ELSE 0
                    END
                ) OVER (
                    PARTITION BY user_id, product_category
                    ORDER BY created_at, id
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) AS UserCat_total_return,

                -- User-category successful
                SUM(
                    CASE
                        WHEN status = 'Complete' THEN 1
                        ELSE 0
                    END
                ) OVER (
                    PARTITION BY user_id, product_category
                    ORDER BY created_at, id
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                ) AS UserCat_total_success

            FROM base b
        ),

        final_features AS (
            SELECT
                *,

                /* =====================================================
                   PRODUCT RATIOS
                   ===================================================== */

                COALESCE(
                    Product_total_return::numeric
                    / NULLIF(Product_total_orders, 0),
                    0
                ) AS Product_return_ratio,

                COALESCE(
                    (
                        Product_total_cancel
                        + Product_total_return
                    )::numeric
                    / NULLIF(Product_total_orders, 0),
                    0
                ) AS Product_loss_ratio,

                COALESCE(
                    Product_total_success::numeric
                    / NULLIF(Product_total_orders, 0),
                    0
                ) AS Product_Success_ratio,


                /* =====================================================
                   USER RATIOS
                   ===================================================== */

                COALESCE(
                    User_total_return::numeric
                    / NULLIF(User_total_orders, 0),
                    0
                ) AS Customer_return_ratio,

                COALESCE(
                    (
                        User_total_cancel
                        + User_total_return
                    )::numeric
                    / NULLIF(User_total_orders, 0),
                    0
                ) AS User_loss_ratio,

                COALESCE(
                    User_total_success::numeric
                    / NULLIF(User_total_orders, 0),
                    0
                ) AS User_Success_ratio,


                /* =====================================================
                   USER + CATEGORY RATIOS
                   ===================================================== */

                COALESCE(
                    (
                        UserCat_total_cancel
                        + UserCat_total_return
                    )::numeric
                    / NULLIF(UserCat_total_orders, 0),
                    0
                ) AS UserCat_loss_ratio,

                COALESCE(
                    UserCat_total_success::numeric
                    / NULLIF(UserCat_total_orders, 0),
                    0
                ) AS UserCat_Success_ratio

            FROM features
        )

        SELECT
            /* =========================================================
               1-18 : HISTORICAL / BEHAVIORAL FEATURES
               ========================================================= */

            Customer_return_ratio,

            Product_return_ratio,

            Product_total_orders,
            Product_total_cancel,
            Product_total_return,
            Product_total_success,

            Product_loss_ratio,
            Product_Success_ratio,

            Product_Return_days_Avg_3,
            Product_Return_days_Avg_all,

            User_total_orders,
            User_total_cancel,
            User_total_return,
            User_total_success,

            User_Return_days_Avg_3,
            User_Return_days_Avg_all,

            User_loss_ratio,
            User_Success_ratio,

            /* =========================================================
               19-21 : ORDER TIME FEATURES
               ========================================================= */

            EXTRACT(
                MONTH FROM created_at
            ) AS order_month,

            EXTRACT(
                DAY FROM created_at
            ) AS order_day,

            EXTRACT(
                HOUR FROM created_at
            ) AS order_hour,

            /* =========================================================
               22-26 : USER FEATURES
               ========================================================= */

            country,
            gender,
            age,
            traffic_source,

            EXTRACT(
                DAY FROM (
                    created_at - user_created_at
                )
            ) AS acc_age,

            /* =========================================================
               27-29 : PRODUCT FEATURES
               ========================================================= */

            product_category,
            product_brand,
            dept,

            /* =========================================================
               30 : CURRENT SALE PRICE
               ========================================================= */

            sale_price,

            /* =========================================================
               31 : NUMBER OF ITEMS IN ORDER
               ========================================================= */

            (
                SELECT COUNT(*)
                FROM order_items oi2
                WHERE oi2.order_id = final_features.order_id
            ) AS num_of_items,

            /* =========================================================
               32-33 : USER + CATEGORY FEATURES
               ========================================================= */

            UserCat_loss_ratio,
            UserCat_Success_ratio

        FROM final_features

        WHERE user_id = :user_id
          AND product_id = :product_id
          AND order_id = :order_id
    """)

    result = db.execute(
        query,
        {
            "user_id": user_id,
            "product_id": product_id,
            "order_id": order_id
        }
    )

    row = result.mappings().first()

    if row is None:
        raise ValueError(
            "No matching order found for the given "
            "user_id, product_id and order_id"
        )

    features = dict(row)

    # Make sure sale_price comes from the API input
    features["sale_price"] = sale_price

    return features