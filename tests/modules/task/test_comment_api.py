from modules.authentication.types import AccessTokenErrorCode
from modules.task.types import TaskErrorCode
from tests.modules.task.base_test_task import BaseTestTask


class TestCommentApi(BaseTestTask):

    def test_add_comment_success(self) -> None:
        account, token = self.create_account_and_get_token()
        task = self.create_test_task(account_id=account.id)

        response = self.make_authenticated_comment_request(
            "POST", account.id, task.id, token, data={"content": "First comment"}
        )

        assert response.status_code == 201
        assert response.json is not None
        assert response.json.get("id") is not None
        assert response.json.get("content") == "First comment"

    def test_add_comment_missing_content(self) -> None:
        account, token = self.create_account_and_get_token()
        task = self.create_test_task(account_id=account.id)

        response = self.make_authenticated_comment_request(
            "POST", account.id, task.id, token, data={"content": ""}
        )

        self.assert_error_response(response, 400, TaskErrorCode.BAD_REQUEST)

    def test_add_comment_empty_body(self) -> None:
        account, token = self.create_account_and_get_token()
        task = self.create_test_task(account_id=account.id)

        response = self.make_authenticated_comment_request(
            "POST", account.id, task.id, token, data={}
        )

        self.assert_error_response(response, 400, TaskErrorCode.BAD_REQUEST)

    def test_add_comment_no_auth(self) -> None:
        account, _ = self.create_account_and_get_token()
        task = self.create_test_task(account_id=account.id)

        response = self.make_unauthenticated_comment_request(
            "POST", account.id, task.id, data={"content": "Hi"}
        )

        self.assert_error_response(response, 401, AccessTokenErrorCode.AUTHORIZATION_HEADER_NOT_FOUND)

    def test_add_comment_invalid_token(self) -> None:
        account, _ = self.create_account_and_get_token()
        task = self.create_test_task(account_id=account.id)
        invalid_token = "invalid_token"

        response = self.make_authenticated_comment_request(
            "POST", account.id, task.id, invalid_token, data={"content": "Hi"}
        )

        self.assert_error_response(response, 401, AccessTokenErrorCode.ACCESS_TOKEN_INVALID)

    def test_add_comment_task_not_found(self) -> None:
        account, token = self.create_account_and_get_token()
        non_existent_task_id = "507f1f77bcf86cd799439011"

        response = self.make_authenticated_comment_request(
            "POST", account.id, non_existent_task_id, token, data={"content": "Hi"}
        )

        self.assert_error_response(response, 404, TaskErrorCode.NOT_FOUND)

    def test_add_comment_cross_account(self) -> None:
        account1, token1 = self.create_account_and_get_token("user1@example.com", "password1")
        account2, token2 = self.create_account_and_get_token("user2@example.com", "password2")
        task = self.create_test_task(account_id=account1.id)

        response = self.make_cross_account_comment_request(
            "POST", account1.id, task.id, token2, data={"content": "Hacked"}
        )

        self.assert_error_response(response, 401, AccessTokenErrorCode.UNAUTHORIZED_ACCESS)

    # UPDATE COMMENT TESTS

    def test_update_comment_success(self) -> None:
        account, token = self.create_account_and_get_token()
        task = self.create_test_task(account_id=account.id)
        comment = self.create_test_comment(account.id, task.id, "Original content", token)

        response = self.make_authenticated_comment_request(
            "PATCH", account.id, task.id, token, comment_id=comment["id"], data={"content": "Updated content"}
        )

        assert response.status_code == 200
        assert response.json is not None
        assert response.json.get("id") == comment["id"]
        assert response.json.get("content") == "Updated content"

    def test_update_comment_missing_content(self) -> None:
        account, token = self.create_account_and_get_token()
        task = self.create_test_task(account_id=account.id)
        comment = self.create_test_comment(account.id, task.id, "Original content", token)

        response = self.make_authenticated_comment_request(
            "PATCH", account.id, task.id, token, comment_id=comment["id"], data={"content": ""}
        )

        self.assert_error_response(response, 400, TaskErrorCode.BAD_REQUEST)

    def test_update_comment_comment_not_found(self) -> None:
        account, token = self.create_account_and_get_token()
        task = self.create_test_task(account_id=account.id)
        non_existent_comment_id = "507f1f77bcf86cd799439011"

        response = self.make_authenticated_comment_request(
            "PATCH", account.id, task.id, token, comment_id=non_existent_comment_id, data={"content": "Updated content"}
        )

        self.assert_error_response(response, 404, TaskErrorCode.NOT_FOUND)

    def test_update_comment_no_auth(self) -> None:
        account, token = self.create_account_and_get_token()
        task = self.create_test_task(account_id=account.id)
        comment = self.create_test_comment(account.id, task.id, "Original content", token)

        response = self.make_unauthenticated_comment_request(
            "PATCH", account.id, task.id, comment_id=comment["id"], data={"content": "Updated content"}
        )

        self.assert_error_response(response, 401, AccessTokenErrorCode.AUTHORIZATION_HEADER_NOT_FOUND)

    def test_update_comment_cross_account(self) -> None:
        account1, token1 = self.create_account_and_get_token("user1@example.com", "password1")
        account2, token2 = self.create_account_and_get_token("user2@example.com", "password2")
        task = self.create_test_task(account_id=account1.id)
        comment = self.create_test_comment(account1.id, task.id, "Original content", token1)

        response = self.make_cross_account_comment_request(
            "PATCH", account1.id, task.id, token2, comment_id=comment["id"], data={"content": "Hacked"}
        )

        self.assert_error_response(response, 401, AccessTokenErrorCode.UNAUTHORIZED_ACCESS)

    # DELETE COMMENT TESTS

    def test_delete_comment_success(self) -> None:
        account, token = self.create_account_and_get_token()
        task = self.create_test_task(account_id=account.id)
        comment = self.create_test_comment(account.id, task.id, "Comment to delete", token)

        response = self.make_authenticated_comment_request(
            "DELETE", account.id, task.id, token, comment_id=comment["id"]
        )

        assert response.status_code == 204
        assert response.data == b""

    def test_delete_comment_comment_not_found(self) -> None:
        account, token = self.create_account_and_get_token()
        task = self.create_test_task(account_id=account.id)
        non_existent_comment_id = "507f1f77bcf86cd799439011"

        response = self.make_authenticated_comment_request(
            "DELETE", account.id, task.id, token, comment_id=non_existent_comment_id
        )

        self.assert_error_response(response, 404, TaskErrorCode.NOT_FOUND)

    def test_delete_comment_no_auth(self) -> None:
        account, token = self.create_account_and_get_token()
        task = self.create_test_task(account_id=account.id)
        comment = self.create_test_comment(account.id, task.id, "Comment to delete", token)

        response = self.make_unauthenticated_comment_request(
            "DELETE", account.id, task.id, comment_id=comment["id"]
        )

        self.assert_error_response(response, 401, AccessTokenErrorCode.AUTHORIZATION_HEADER_NOT_FOUND)

    def test_delete_comment_cross_account(self) -> None:
        account1, token1 = self.create_account_and_get_token("user1@example.com", "password1")
        account2, token2 = self.create_account_and_get_token("user2@example.com", "password2")
        task = self.create_test_task(account_id=account1.id)
        comment = self.create_test_comment(account1.id, task.id, "Comment to delete", token1)

        response = self.make_cross_account_comment_request(
            "DELETE", account1.id, task.id, token2, comment_id=comment["id"]
        )

        self.assert_error_response(response, 401, AccessTokenErrorCode.UNAUTHORIZED_ACCESS)
