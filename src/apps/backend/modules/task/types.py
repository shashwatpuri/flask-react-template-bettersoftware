from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any

from modules.application.common.types import PaginationParams, PaginationResult, SortParams


@dataclass(frozen=True)
class Comment:
    id: str
    content: str
    created_at: datetime
    updated_at: datetime


@dataclass(frozen=True)
class Task:
    id: str
    account_id: str
    description: str
    title: str
    isFinished: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    comments: List[Comment] = field(default_factory=list)


@dataclass(frozen=True)
class GetTaskParams:
    account_id: str
    task_id: str


@dataclass(frozen=True)
class GetPaginatedTasksParams:
    account_id: str
    pagination_params: PaginationParams
    sort_params: Optional[SortParams] = None


@dataclass(frozen=True)
class CreateTaskParams:
    account_id: str
    description: str
    title: str
    isFinished: bool = False

@dataclass(frozen=True)
class UpdateTaskParams:
    account_id: str
    task_id: str
    description: str
    title: str
    isFinished: Optional[bool] = None

@dataclass(frozen=True)
class DeleteTaskParams:
    account_id: str
    task_id: str


@dataclass(frozen=True)
class TaskDeletionResult:
    task_id: str
    deleted_at: datetime
    success: bool

@dataclass(frozen=True)
class AddCommentParams:
    account_id: str
    task_id: str
    content: str


@dataclass(frozen=True)
class UpdateCommentParams:
    account_id: str
    task_id: str
    comment_id: str
    content: str

@dataclass(frozen=True)
class DeleteCommentParams:
    account_id: str
    task_id: str
    comment_id: str

@dataclass(frozen=True)
class CommentResult:
    id: str
    content: str
    created_at: datetime
    updated_at: datetime


@dataclass(frozen=True)
class TaskErrorCode:
    NOT_FOUND: str = "TASK_ERR_01"
    BAD_REQUEST: str = "TASK_ERR_02"
    COMMENT_NOT_FOUND: str = "TASK_ERR_03"
    UNAUTHORIZED: str = "TASK_ERR_04"
