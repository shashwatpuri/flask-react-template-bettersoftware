from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any

from bson import ObjectId

from modules.application.base_model import BaseModel

@dataclass
class Comment:
    content: str
    id: str = field(default_factory=lambda: str(ObjectId()))
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "content": self.content,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Comment":
        return cls(
            content=data["content"],
            id=str(data.get("id") or ObjectId()),
            created_at=data.get("created_at") or datetime.utcnow(),
            updated_at=data.get("updated_at") or datetime.utcnow()
        )

@dataclass
class TaskModel(BaseModel):
    account_id: str
    description: str
    title: str
    active: bool = True
    isFinished: bool = False
    created_at: Optional[datetime] = datetime.now()
    id: Optional[ObjectId | str] = None
    updated_at: Optional[datetime] = datetime.now()
    comments: List[Comment] = field(default_factory=list)

    @classmethod
    def from_bson(cls, bson_data: dict) -> "TaskModel":
        return cls(
            account_id=bson_data.get("account_id", ""),
            active=bson_data.get("active", True),
            isFinished=bson_data.get("isFinished", False),
            created_at=bson_data.get("created_at"),
            comments=bson_data.get("comments", []),
            description=bson_data.get("description", ""),
            id=bson_data.get("_id"),
            title=bson_data.get("title", ""),
            updated_at=bson_data.get("updated_at"),
        )

    @staticmethod
    def get_collection_name() -> str:
        return "tasks"
