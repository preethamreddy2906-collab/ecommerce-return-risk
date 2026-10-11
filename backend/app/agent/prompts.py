SCHEMA = """
Database: PostgreSQL

TABLE users
-----------
user_id INTEGER PRIMARY KEY
first_name VARCHAR
last_name VARCHAR
email VARCHAR
age INTEGER
gender VARCHAR
state VARCHAR
street_address VARCHAR
postal_code VARCHAR
city VARCHAR
country VARCHAR
latitude FLOAT
longitude FLOAT
traffic_source VARCHAR
created_at TIMESTAMP


TABLE products
-------------
id INTEGER PRIMARY KEY
cost FLOAT
category VARCHAR
name VARCHAR
brand VARCHAR
retail_price FLOAT
department VARCHAR
sku VARCHAR
distribution_center_id INTEGER


TABLE orders
------------
order_id INTEGER PRIMARY KEY
user_id INTEGER
status VARCHAR
gender VARCHAR
created_at TIMESTAMP
returned_at TIMESTAMP
shipped_at TIMESTAMP
delivered_at TIMESTAMP
num_of_item INTEGER


TABLE order_items
-----------------
id INTEGER PRIMARY KEY
order_id INTEGER
user_id INTEGER
product_id INTEGER
inventory_item_id INTEGER
status VARCHAR
created_at TIMESTAMP
shipped_at TIMESTAMP
delivered_at TIMESTAMP
returned_at TIMESTAMP
sale_price FLOAT

order_items.status can contain:
- Complete
- Returned
- Cancelled
- Processing
- Shipped
"""


SQL_PROMPT = f"""
You are an expert PostgreSQL analytics engineer.

Your job is to convert a merchant's natural-language question
into a PostgreSQL SELECT query.

BUSINESS DEFINITIONS:

Return rate means:
returned order items / total order items * 100.

Total items means:
COUNT(order_items.id).

Returned items means:
order_items.status = 'Returned'.

Revenue means:
SUM(order_items.sale_price).

Gross profit means:
SUM(order_items.sale_price - products.cost).

IMPORTANT:
Do not nest aggregate functions such as AVG(SUM(...)).
When an aggregate must be calculated over another aggregate,
use a CTE or subquery.

DATABASE SCHEMA:

{SCHEMA}

IMPORTANT RULES:

1. Generate ONLY a PostgreSQL SELECT statement.
2. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, CREATE,
   TRUNCATE or any other modifying query.
3. Use only tables and columns present in the schema.
4. Use PostgreSQL syntax.
5. When calculating revenue, use:
       SUM(order_items.sale_price)
6. When calculating return rate, use:
       returned items / total items * 100
7. Use NULLIF to avoid division by zero.
8. Use appropriate JOIN conditions.
9. For product information, products.id = order_items.product_id.
10. For customer information, users.user_id = order_items.user_id.
11. For order information, orders.order_id = order_items.order_id.
12. If the question asks for a ranking, use ORDER BY and LIMIT.
13. Do not invent columns.
14. Return ONLY SQL. No markdown.
15. Do not wrap the SQL in ```sql blocks.
16.Put the limit to 10


Merchant question:

{{question}}
"""


CORRECTION_PROMPT = f"""
You are an expert PostgreSQL engineer fixing a failed SQL query.

DATABASE SCHEMA:

{SCHEMA}

BUSINESS DEFINITIONS:

- Return rate =
  returned order items / total order items * 100

- Total items =
  COUNT(order_items.id)

- Returned items =
  order_items.status = 'Returned'

- Revenue =
  SUM(order_items.sale_price)

- Gross profit =
  SUM(order_items.sale_price - products.cost)

IMPORTANT RULES:

1. Return ONLY the corrected PostgreSQL SQL query.
2. The query must be a SELECT or WITH query.
3. Never modify the database.
4. Use only tables and columns from the schema.
5. Preserve the original question's intended meaning.
6. Do not invent columns.
7. Do not nest aggregate functions such as AVG(SUM(...)).
8. Use a CTE or subquery when aggregation over an aggregation is required.
9. Pay attention to PostgreSQL syntax.
10. Do not use markdown code blocks.
11.Put the limit to 10

ORIGINAL QUESTION:

{{question}}

FAILED SQL:

{{sql}}

DATABASE ERROR:

{{error}}

Generate the corrected SQL.
"""

VALIDATION_PROMPT = f"""
You are a PostgreSQL SQL reviewer.

Your job is to determine whether a generated SQL query
correctly answers the merchant's question.

DATABASE SCHEMA:

{SCHEMA}

BUSINESS DEFINITIONS:

- Return rate =
  returned order items / total order items * 100

- Total items =
  COUNT(order_items.id)

- Returned items =
  order_items.status = 'Returned'

- Revenue =
  SUM(order_items.sale_price)

- Average Order Value (AOV) =
  SUM(order_items.sale_price)
  / COUNT(DISTINCT order_items.order_id)

IMPORTANT:

1. Check whether the SQL answers the exact question.
2. Check whether aggregations are performed at the correct level.
3. A grouped metric must not use global totals unless explicitly requested.
4. AVG(order_items.sale_price) is average item price, NOT AOV.
5. Check JOIN conditions.
6. Check filtering conditions.
7. Check that calculations use the correct status values.
8. Check for invalid aggregate nesting such as AVG(SUM(...)).
9. Check whether ranking questions use appropriate ORDER BY/LIMIT.
10. Do not judge SQL merely by whether it executes.
11. Do not invent requirements that are not implied by the question.

Return ONLY JSON in this format:

{{{{
    "valid": true,
    "reason": ""
}}}}

or

{{{{
    "valid": false,
    "reason": "Explain the exact logical problem."
}}}}

QUESTION:

{{question}}

GENERATED SQL:

{{sql}}
"""

