from sqlalchemy import Column, Integer, String, Float,DateTime,ForeignKey

from .connection import Base


class User(Base):
    __tablename__="users"
    user_id=Column(Integer,primary_key=True,index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)

    age = Column(Integer)
    gender = Column(String)

    state = Column(String)
    street_address = Column(String)
    postal_code = Column(String)
    city = Column(String)
    country = Column(String)

    latitude = Column(Float)
    longitude = Column(Float)

    traffic_source = Column(String)
    created_at = Column(DateTime)

    total_orders = Column(Integer)
    cancelled_orders = Column(Integer)
    returned_orders = Column(Integer)
    success_orders = Column(Integer)

class Products(Base):
    __tablename__="products"
    id = Column(Integer, primary_key=True, index=True)

    cost = Column(Float)
    category = Column(String)
    name = Column(String)
    brand = Column(String)
    retail_price = Column(Float)
    department = Column(String)
    sku = Column(String)

    distribution_center_id = Column(Integer)

    total_orders = Column(Integer)
    cancelled_orders = Column(Integer)
    returned_orders = Column(Integer)
    success_orders = Column(Integer)

class Orders(Base):
    __tablename__="orders"
    order_id=Column(Integer,primary_key=True,index=True)
    user_id=Column(Integer,ForeignKey("users.user_id"),index=True)
    status = Column(String)
    gender = Column(String)

    created_at = Column(DateTime)
    returned_at = Column(DateTime)
    shipped_at = Column(DateTime)
    delivered_at = Column(DateTime)

    num_of_item = Column(Integer)

class OrderItems(Base):
    __tablename__="order_items"
    id=Column(Integer,primary_key=True,index=True)
    order_id=Column(Integer,ForeignKey("orders.order_id"),index=True)
    user_id = Column(
        Integer,ForeignKey("users.user_id"),index=True
    )

    product_id = Column(Integer,ForeignKey("products.id"),index=True)

    inventory_item_id = Column(Integer)

    status = Column(String)

    created_at = Column(DateTime)
    shipped_at = Column(DateTime)
    delivered_at = Column(DateTime)
    returned_at = Column(DateTime)

    sale_price = Column(Float)


class OrderItemPrediction(Base):
    __tablename__ = "order_item_predictions"

    id = Column(Integer, primary_key=True, index=True)

    order_item_id = Column(
        Integer,
        ForeignKey("order_items.id"),
        unique=True,
        index=True
    )

    return_probability = Column(Float)
    risk = Column(String)