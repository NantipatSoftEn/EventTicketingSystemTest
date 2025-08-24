from tortoise.models import Model
from tortoise import fields
from ....domain.entities.user import UserRole


class UserModel(Model):
    """Tortoise ORM model for User entity"""
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)
    phone = fields.CharField(max_length=20, unique=True)
    role = fields.CharEnumField(UserRole, default=UserRole.CUSTOMER)
    
    class Meta:
        table = "users"
    
    def __str__(self):
        return f"{self.name} ({self.role})"
