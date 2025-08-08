from datetime import datetime

from modules.application.common.types import PaginationParams
from modules.task.errors import TaskNotFoundError
from modules.task.task_service import TaskService
from modules.task.types import (
    CreateTaskParams,
    DeleteTaskParams,
    GetPaginatedTasksParams,
    GetTaskParams,
    TaskErrorCode,
    UpdateTaskParams,
    AddCommentParams,
    UpdateCommentParams,
    DeleteCommentParams,
)
from tests.modules.task.base_test_task import BaseTestTask


class TestTaskService(BaseTestTask):
    def setUp(self) -> None:
        self.account = self.create_test_account()

    def test_create_task(self) -> None:
        task_params = CreateTaskParams(
            account_id=self.account.id, title=self.DEFAULT_TASK_TITLE, description=self.DEFAULT_TASK_DESCRIPTION
        )

        task = TaskService.create_task(params=task_params)

        assert task.account_id == self.account.id
        assert task.title == self.DEFAULT_TASK_TITLE
        assert task.description == self.DEFAULT_TASK_DESCRIPTION
        assert task.id is not None

    def test_get_task_for_account(self) -> None:
        created_task = self.create_test_task(account_id=self.account.id)
        get_params = GetTaskParams(account_id=self.account.id, task_id=created_task.id)

        retrieved_task = TaskService.get_task(params=get_params)

        assert retrieved_task.id == created_task.id
        assert retrieved_task.account_id == self.account.id
        assert retrieved_task.title == self.DEFAULT_TASK_TITLE
        assert retrieved_task.description == self.DEFAULT_TASK_DESCRIPTION

    def test_get_task_for_account_not_found(self) -> None:
        non_existent_task_id = "507f1f77bcf86cd799439011"
        get_params = GetTaskParams(account_id=self.account.id, task_id=non_existent_task_id)

        with self.assertRaises(TaskNotFoundError) as context:
            TaskService.get_task(params=get_params)

        assert context.exception.code == TaskErrorCode.NOT_FOUND

    def test_get_paginated_tasks_empty(self) -> None:
        pagination_params = PaginationParams(page=1, size=10, offset=0)
        get_params = GetPaginatedTasksParams(account_id=self.account.id, pagination_params=pagination_params)

        result = TaskService.get_paginated_tasks(params=get_params)

        assert len(result.items) == 0
        assert result.total_count == 0
        assert result.total_pages == 0
        assert result.pagination_params.page == 1
        assert result.pagination_params.size == 10

    def test_get_paginated_tasks_with_data(self) -> None:
        tasks_count = 5
        self.create_multiple_test_tasks(account_id=self.account.id, count=tasks_count)
        pagination_params = PaginationParams(page=1, size=3, offset=0)
        get_params = GetPaginatedTasksParams(account_id=self.account.id, pagination_params=pagination_params)

        result = TaskService.get_paginated_tasks(params=get_params)

        assert len(result.items) == 3
        assert result.total_count == 5
        assert result.total_pages == 2
        assert result.pagination_params.page == 1
        assert result.pagination_params.size == 3

        pagination_params = PaginationParams(page=2, size=3, offset=0)
        get_params = GetPaginatedTasksParams(account_id=self.account.id, pagination_params=pagination_params)
        result = TaskService.get_paginated_tasks(params=get_params)
        assert len(result.items) == 2
        assert result.total_count == 5
        assert result.total_pages == 2

    def test_get_paginated_tasks_default_pagination(self) -> None:
        self.create_test_task(account_id=self.account.id)
        pagination_params = PaginationParams(page=1, size=1, offset=0)
        get_params = GetPaginatedTasksParams(account_id=self.account.id, pagination_params=pagination_params)

        result = TaskService.get_paginated_tasks(params=get_params)

        assert len(result.items) == 1
        assert result.total_count == 1
        assert result.pagination_params.page == 1
        assert result.pagination_params.size == 1

    def test_update_task(self) -> None:
        created_task = self.create_test_task(
            account_id=self.account.id, title="Original Title", description="Original Description"
        )
        update_params = UpdateTaskParams(
            account_id=self.account.id,
            task_id=created_task.id,
            title="Updated Title",
            description="Updated Description",
        )

        updated_task = TaskService.update_task(params=update_params)

        assert updated_task.id == created_task.id
        assert updated_task.account_id == self.account.id
        assert updated_task.title == "Updated Title"
        assert updated_task.description == "Updated Description"

    def test_update_task_not_found(self) -> None:
        non_existent_task_id = "507f1f77bcf86cd799439011"
        update_params = UpdateTaskParams(
            account_id=self.account.id,
            task_id=non_existent_task_id,
            title="Updated Title",
            description="Updated Description",
        )

        with self.assertRaises(TaskNotFoundError) as context:
            TaskService.update_task(params=update_params)

        assert context.exception.code == TaskErrorCode.NOT_FOUND

    def test_delete_task(self) -> None:
        created_task = self.create_test_task(account_id=self.account.id)
        delete_params = DeleteTaskParams(account_id=self.account.id, task_id=created_task.id)

        deletion_result = TaskService.delete_task(params=delete_params)

        assert deletion_result.task_id == created_task.id
        assert deletion_result.success is True
        assert deletion_result.deleted_at is not None
        assert isinstance(deletion_result.deleted_at, datetime)

        get_params = GetTaskParams(account_id=self.account.id, task_id=created_task.id)
        with self.assertRaises(TaskNotFoundError):
            TaskService.get_task(params=get_params)

    def test_delete_task_not_found(self) -> None:
        non_existent_task_id = "507f1f77bcf86cd799439011"
        delete_params = DeleteTaskParams(account_id=self.account.id, task_id=non_existent_task_id)

        with self.assertRaises(TaskNotFoundError) as context:
            TaskService.delete_task(params=delete_params)

        assert context.exception.code == TaskErrorCode.NOT_FOUND

    def test_task_isolation_between_accounts(self) -> None:
        other_account = self.create_test_account(username="otheruser@example.com")

        account1_task = self.create_test_task(
            account_id=self.account.id, title="Account 1 Task", description="Task for account 1"
        )
        account2_task = self.create_test_task(
            account_id=other_account.id, title="Account 2 Task", description="Task for account 2"
        )

        pagination_params = PaginationParams(page=1, size=10, offset=0)
        get_params1 = GetPaginatedTasksParams(account_id=self.account.id, pagination_params=pagination_params)
        account1_result = TaskService.get_paginated_tasks(params=get_params1)

        get_params2 = GetPaginatedTasksParams(account_id=other_account.id, pagination_params=pagination_params)
        account2_result = TaskService.get_paginated_tasks(params=get_params2)

        assert len(account1_result.items) == 1
        assert account1_result.items[0].id == account1_task.id

        assert len(account2_result.items) == 1
        assert account2_result.items[0].id == account2_task.id

        get_params = GetTaskParams(account_id=self.account.id, task_id=account2_task.id)
        with self.assertRaises(TaskNotFoundError):
            TaskService.get_task(params=get_params)

    # Comment service tests (merged from test_comment_service.py)

    def test_add_comment_success(self) -> None:
        task = self.create_test_task(account_id=self.account.id)

        result = TaskService.add_comment(
            params=AddCommentParams(account_id=self.account.id, task_id=task.id, content="hello")
        )

        assert result.id is not None
        assert result.content == "hello"

    def test_add_comment_task_not_found(self) -> None:
        non_existent_task_id = "507f1f77bcf86cd799439011"

        with self.assertRaises(TaskNotFoundError) as context:
            TaskService.add_comment(
                params=AddCommentParams(account_id=self.account.id, task_id=non_existent_task_id, content="hello")
            )

        assert context.exception.code == TaskErrorCode.NOT_FOUND

    def test_update_comment_success(self) -> None:
        task = self.create_test_task(account_id=self.account.id)
        created_comment = TaskService.add_comment(
            params=AddCommentParams(account_id=self.account.id, task_id=task.id, content="original")
        )

        updated = TaskService.update_comment(
            params=UpdateCommentParams(
                account_id=self.account.id, task_id=task.id, comment_id=created_comment.id, content="updated"
            )
        )

        assert updated.id == created_comment.id
        assert updated.content == "updated"

    def test_update_comment_not_found(self) -> None:
        task = self.create_test_task(account_id=self.account.id)
        fake_comment_id = "507f1f77bcf86cd799439011"

        with self.assertRaises(TaskNotFoundError) as context:
            TaskService.update_comment(
                params=UpdateCommentParams(
                    account_id=self.account.id, task_id=task.id, comment_id=fake_comment_id, content="updated"
                )
            )

        assert context.exception.code == TaskErrorCode.NOT_FOUND

    def test_delete_comment_success(self) -> None:
        task = self.create_test_task(account_id=self.account.id)
        created_comment = TaskService.add_comment(
            params=AddCommentParams(account_id=self.account.id, task_id=task.id, content="to delete")
        )

        TaskService.delete_comment(
            params=DeleteCommentParams(
                account_id=self.account.id, task_id=task.id, comment_id=created_comment.id
            )
        )

        with self.assertRaises(TaskNotFoundError):
            TaskService.update_comment(
                params=UpdateCommentParams(
                    account_id=self.account.id, task_id=task.id, comment_id=created_comment.id, content="x"
                )
            )

    def test_delete_comment_not_found(self) -> None:
        task = self.create_test_task(account_id=self.account.id)
        fake_comment_id = "507f1f77bcf86cd799439011"

        with self.assertRaises(TaskNotFoundError) as context:
            TaskService.delete_comment(
                params=DeleteCommentParams(
                    account_id=self.account.id, task_id=task.id, comment_id=fake_comment_id
                )
            )

        assert context.exception.code == TaskErrorCode.NOT_FOUND

    def test_add_update_delete_comment_persists(self) -> None:
        task = self.create_test_task(account_id=self.account.id)
        comment = TaskService.add_comment(
            params=AddCommentParams(account_id=self.account.id, task_id=task.id, content="first")
        )

        fetched1 = TaskService.get_task(params=GetTaskParams(account_id=self.account.id, task_id=task.id))
        assert isinstance(fetched1.comments, list)
        assert any(c.get("id") == comment.id for c in fetched1.comments)

        TaskService.update_comment(
            params=UpdateCommentParams(
                account_id=self.account.id, task_id=task.id, comment_id=comment.id, content="second"
            )
        )
        fetched2 = TaskService.get_task(params=GetTaskParams(account_id=self.account.id, task_id=task.id))
        updated_dict = next((c for c in fetched2.comments if c.get("id") == comment.id), None)
        assert updated_dict is not None
        assert updated_dict.get("content") == "second"

        TaskService.delete_comment(
            params=DeleteCommentParams(account_id=self.account.id, task_id=task.id, comment_id=comment.id)
        )
        fetched3 = TaskService.get_task(params=GetTaskParams(account_id=self.account.id, task_id=task.id))
        assert all(c.get("id") != comment.id for c in fetched3.comments)
