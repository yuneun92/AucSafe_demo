# SQLAlchemy Models
from app.models.user import User
from app.models.property import Property, PropertyRight, Tenant, PriceHistory
from app.models.registry import RegistryDocument
from app.models.favorite import Favorite
from app.models.notification import Notification
from app.models.chat import ChatSession, ChatMessage

__all__ = [
    "User",
    "Property",
    "PropertyRight",
    "Tenant",
    "PriceHistory",
    "RegistryDocument",
    "Favorite",
    "Notification",
    "ChatSession",
    "ChatMessage",
]
