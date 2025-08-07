from dataclasses import asdict
from typing import Optional

from flask import jsonify, request
from flask.typing import ResponseReturnValue
from flask.views import MethodView

from modules.authentication.rest_api.access_auth_middleware import access_auth_middleware
from modules.task.errors import TaskBadRequestError, TaskNotFoundError, TaskUnauthorizedError
from modules.task.task_service import TaskService
from modules.task.types import AddCommentParams, UpdateCommentParams, DeleteCommentParams, CommentResult


class CommentView(MethodView):
    @access_auth_middleware
    def post(self, account_id: str, task_id: str) -> ResponseReturnValue:
        
        try:
            request_data = request.get_json()
            
            if not request_data:
                raise TaskBadRequestError("Request data is required")
                
            if not request_data.get("content"):
                raise TaskBadRequestError("Comment content is required")
            
            account_id_from_token = request.account_id
            
            if account_id != account_id_from_token:
                raise TaskUnauthorizedError("You are not authorized to add comment")
            
            add_comment_params = AddCommentParams(
                account_id=account_id,
                task_id=task_id,
                content=request_data["content"],
            )
            
            comment = TaskService.add_comment(params=add_comment_params)

            return jsonify(asdict(comment)), 201
            
        except TaskNotFoundError as e:
            raise TaskNotFoundError(f"Task not found: {task_id}")
        except Exception as e:
            print(f"[ERROR] Unexpected error in CommentView.post: {str(e)}")
            raise

    @access_auth_middleware
    def patch(self, account_id: str, task_id: str, comment_id: str) -> ResponseReturnValue:
        request_data = request.get_json()

        if not request_data or not request_data.get("content"):
            raise TaskBadRequestError("Comment content is required")
        
        update_comment_params = UpdateCommentParams(
            account_id=account_id,
            task_id=task_id,
            comment_id=comment_id,
            content=request_data["content"],
        )

        try:
            comment = TaskService.update_comment(params=update_comment_params)
            return jsonify(asdict(comment)), 200

        except TaskNotFoundError as e:
            raise TaskNotFoundError(f"Comment not found: {comment_id}")
        except TaskUnauthorizedError as e:
            raise TaskUnauthorizedError("You are not authorized to update this comment")

    @access_auth_middleware
    def delete(self, account_id: str, task_id: str, comment_id: str) -> ResponseReturnValue:

        delete_comment_params = DeleteCommentParams(
            account_id=account_id,
            task_id=task_id,
            comment_id=comment_id,
        )
        try:
            TaskService.delete_comment(params=delete_comment_params)
            return "", 204

        except TaskNotFoundError as e:
            raise TaskNotFoundError(f"Comment not found: {comment_id}")
        except TaskUnauthorizedError as e:
            raise TaskUnauthorizedError("You are not authorized to delete this comment")
