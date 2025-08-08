from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any

from bson import ObjectId

from modules.application.base_model import BaseModel
from modules.task.types import Comment

@dataclass
class TaskModel(BaseModel):
    account_id: str
    description: str
    title: str
    active: bool = True
    isFinished: bool = False
    created_at: Optional[datetime] = datetime.utcnow()
    id: Optional[ObjectId | str] = None
    updated_at: Optional[datetime] = datetime.utcnow()
    comments: List[Comment] = field(default_factory=list)

    @classmethod
    def from_bson(cls, bson_data: dict) -> "TaskModel":
        return cls(
            account_id=bson_data.get("account_id", ""),
            active=bson_data.get("active", True),
            isFinished=bson_data.get("isFinished", False),
            created_at=bson_data.get("created_at"),
            comments=[Comment(
                id=comment["id"],
                content=comment["content"],
                created_at=comment["created_at"],
                updated_at=comment["updated_at"]
            ) for comment in bson_data.get("comments", [])],
            description=bson_data.get("description", ""),
            id=bson_data.get("_id"),
            title=bson_data.get("title", ""),
            updated_at=bson_data.get("updated_at"),
        )

    @staticmethod
    def get_collection_name() -> str:
        return "tasks"
