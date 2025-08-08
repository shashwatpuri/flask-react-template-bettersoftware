from modules.application.common.types import PaginationResult
from modules.task.internal.task_reader import TaskReader
from modules.task.internal.task_writer import TaskWriter
from modules.task.types import (
    CreateTaskParams,
    DeleteTaskParams,
    GetPaginatedTasksParams,
    GetTaskParams,
    Task,
    TaskDeletionResult,
    UpdateTaskParams,
    AddCommentParams,
    UpdateCommentParams,
    DeleteCommentParams,
    CommentResult
)


class TaskService:
    @staticmethod
    def create_task(*, params: CreateTaskParams) -> Task:
        return TaskWriter.create_task(params=params)

    @staticmethod
    def get_task(*, params: GetTaskParams) -> Task:
        return TaskReader.get_task(params=params)

    @staticmethod
    def get_paginated_tasks(*, params: GetPaginatedTasksParams) -> PaginationResult[Task]:
        return TaskReader.get_paginated_tasks(params=params)

    @staticmethod
    def update_task(*, params: UpdateTaskParams) -> Task:
        return TaskWriter.update_task(params=params)

    @staticmethod
    def delete_task(*, params: DeleteTaskParams) -> TaskDeletionResult:
        return TaskWriter.delete_task(params=params)

    @staticmethod
    def add_comment(*, params: AddCommentParams) -> CommentResult:
        return TaskWriter.add_comment(params=params)

    @staticmethod
    def update_comment(*, params: UpdateCommentParams) -> CommentResult:
        return TaskWriter.update_comment(params=params)

    @staticmethod
    def delete_comment(*, params: DeleteCommentParams) -> None:
        return TaskWriter.delete_comment(params=params)