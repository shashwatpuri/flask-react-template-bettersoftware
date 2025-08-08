from datetime import datetime

from bson.objectid import ObjectId
from pymongo import ReturnDocument

from modules.task.errors import TaskNotFoundError
from modules.task.internal.store.task_model import TaskModel
from modules.task.internal.store.task_repository import TaskRepository
from modules.task.internal.task_reader import TaskReader
from modules.task.internal.task_util import TaskUtil
from modules.task.types import (
    Comment,
    CommentResult,
    CreateTaskParams,
    DeleteTaskParams,
    GetTaskParams,
    Task,
    TaskDeletionResult,
    UpdateTaskParams,
    AddCommentParams,
    UpdateCommentParams,
    DeleteCommentParams
)


class TaskWriter:
    @staticmethod
    def create_task(*, params: CreateTaskParams) -> Task:
        task_bson = TaskModel(
            account_id=params.account_id, 
            description=params.description, 
            title=params.title, 
            isFinished=params.isFinished
        ).to_bson()

        query = TaskRepository.collection().insert_one(task_bson)
        created_task_bson = TaskRepository.collection().find_one({"_id": query.inserted_id})

        return TaskUtil.convert_task_bson_to_task(created_task_bson)

    @staticmethod
    def update_task(*, params: UpdateTaskParams) -> Task:
        updated_task_bson = TaskRepository.collection().find_one_and_update(
            {"_id": ObjectId(params.task_id), "account_id": params.account_id, "active": True},
            {"$set": {
                "description": params.description, 
                "title": params.title, 
                "updated_at": datetime.utcnow(),
                "isFinished": params.isFinished
                }
            },
            return_document=ReturnDocument.AFTER,
        )

        if updated_task_bson is None:
            raise TaskNotFoundError(task_id=params.task_id)

        return TaskUtil.convert_task_bson_to_task(updated_task_bson)

    @staticmethod
    def delete_task(*, params: DeleteTaskParams) -> TaskDeletionResult:
        task = TaskReader.get_task(params=GetTaskParams(account_id=params.account_id, task_id=params.task_id))

        deletion_time = datetime.utcnow()
        updated_task_bson = TaskRepository.collection().find_one_and_update(
            {"_id": ObjectId(task.id)},
            {"$set": {"active": False, "updated_at": deletion_time}},
            return_document=ReturnDocument.AFTER,
        )

        if updated_task_bson is None:
            raise TaskNotFoundError(task_id=params.task_id)

        return TaskDeletionResult(task_id=params.task_id, deleted_at=deletion_time, success=True)

    
    @staticmethod
    def add_comment(*, params: AddCommentParams) -> CommentResult:

        task = TaskRepository.collection().find_one({
            "_id": ObjectId(params.task_id),
            "account_id": params.account_id,
            "active": True
        })
        
        if not task:
            raise TaskNotFoundError(f"Task not found: {params.task_id}")
            
        comment = {
            "id": str(ObjectId()),
            "content": params.content,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = TaskRepository.collection().update_one(
            {"_id": ObjectId(params.task_id)},
            {"$push": {"comments": comment},
             "$set": {"updated_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise TaskNotFoundError(f"Task not found: {params.task_id}")
            
        return CommentResult(
            id=str(comment["id"]),
            content=str(comment["content"]),
            created_at=comment["created_at"],  # type: ignore
            updated_at=comment["updated_at"]  # type: ignore
        )

    @staticmethod
    def update_comment(*, params: UpdateCommentParams) -> CommentResult:
        task = TaskRepository.collection().find_one({
            "_id": ObjectId(params.task_id),
            "account_id": params.account_id,
            "active": True,
            "comments": {
                "$elemMatch": {
                    "id": params.comment_id,
                }
            }
        })

        if not task:
            raise TaskNotFoundError(f"Task or Comment not found: {params.task_id}")

        result = TaskRepository.collection().update_one(
            {
                "_id": ObjectId(params.task_id),
                "comments.id": params.comment_id,
            },
            {
                "$set": {
                    "comments.$.content": params.content,
                    "comments.$.updated_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise TaskNotFoundError("Failed to update comment")
            
        updated_task = TaskRepository.collection().find_one({
            "_id": ObjectId(params.task_id),
            "account_id": params.account_id,
            "active": True,
            "comments.id": params.comment_id
        })
        
        if not updated_task:
            raise TaskNotFoundError("Failed to retrieve updated comment")
            
        comments = updated_task.get("comments", [])
        updated_comment = None
        for comment in comments:
            if comment["id"] == params.comment_id:
                updated_comment = comment
                break
        
        if not updated_comment:
            raise TaskNotFoundError("Failed to retrieve updated comment")
            
        return CommentResult(
            id=updated_comment["id"],
            content=updated_comment["content"],
            created_at=updated_comment["created_at"],
            updated_at=updated_comment["updated_at"]
        )

    @staticmethod
    def delete_comment(*, params: DeleteCommentParams) -> None:
        task = TaskRepository.collection().find_one({
            "_id": ObjectId(params.task_id),
            "account_id": params.account_id,
            "active": True,
            "comments": {
                "$elemMatch": {
                    "id": params.comment_id,
                }
            }
        })
        
        if not task:
            raise TaskNotFoundError(f"Task or Comment not found: {params.task_id}")
                    
        result = TaskRepository.collection().update_one(
            {"_id": ObjectId(params.task_id)},
            {
                "$pull": {"comments": {"id": params.comment_id}},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        if result.matched_count == 0:
            raise TaskNotFoundError("Failed to delete comment")