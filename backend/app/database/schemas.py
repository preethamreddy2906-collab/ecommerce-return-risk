from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# =========================
# USER SCHEMAS
# =========================

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: str

    age: int
    gender: Optional[str] = None

    state: Optional[str] = None
    street_address: Optional[str] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    traffic_source: Optional[str] = None
    created_at: Optional[datetime] = None


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    user_id: int

    total_orders: int
    cancelled_orders: int
    returned_orders: int
    success_orders: int

    model_config = ConfigDict(from_attributes=True)


# =========================
# PRODUCT SCHEMAS
# =========================

class ProductBase(BaseModel):
    cost: float
    category: str
    name: str
    brand: Optional[str] = None
    retail_price: float
    department: Optional[str] = None
    sku: Optional[str] = None
    distribution_center_id: Optional[int] = None


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int

    total_orders: int
    cancelled_orders: int
    returned_orders: int
    success_orders: int

    model_config = ConfigDict(from_attributes=True)


# =========================
# ORDER SCHEMAS
# =========================

class OrderBase(BaseModel):
    user_id: int
    status: str
    gender: Optional[str] = None

    created_at: Optional[datetime] = None
    returned_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

    num_of_item: int


class OrderCreate(OrderBase):
    pass


class OrderResponse(OrderBase):
    order_id: int

    model_config = ConfigDict(from_attributes=True)


# =========================
# ORDER ITEM SCHEMAS
# =========================

class OrderItemBase(BaseModel):
    order_id: int
    user_id: int
    product_id: int
    inventory_item_id: int

    status: str

    created_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    returned_at: Optional[datetime] = None

    sale_price: float


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: int

    model_config = ConfigDict(from_attributes=True)