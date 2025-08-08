import useAsync from 'frontend/contexts/async.hook';

import { AsyncResult, AsyncError } from 'frontend/types';
import { Nullable } from 'frontend/types/common-types';
import taskService, { Comment } from 'frontend/services/task.service';
const addCommentFn = async (
  accountId: string,
  taskId: string,
  content: string,
): Promise<AsyncResult<Comment>> => {
  const comment = await taskService.addComment(accountId, taskId, content);
  return { data: comment };
};

const updateCommentFn = async (
  accountId: string,
  taskId: string,
  commentId: string,
  content: string,
): Promise<AsyncResult<Comment>> => {
  const comment = await taskService.updateComment(accountId, taskId, commentId, content);
  return { data: comment };
};

const deleteCommentFn = async (
  accountId: string,
  taskId: string,
  commentId: string,
): Promise<AsyncResult<void>> => {
  await taskService.deleteComment(accountId, taskId, commentId);
  return { data: null };
};

export interface UseCommentsReturn {
  addComment: (
    accountId: string,
    taskId: string,
    content: string,
  ) => Promise<Nullable<Comment>>;
  isAddingComment: boolean;
  addCommentError: Nullable<AsyncError>;
  
  updateComment: (
    accountId: string,
    taskId: string,
    commentId: string,
    content: string,
  ) => Promise<Nullable<Comment>>;
  isUpdatingComment: boolean;
  updateCommentError: Nullable<AsyncError>;
  
  deleteComment: (
    accountId: string,
    taskId: string,
    commentId: string,
  ) => Promise<Nullable<void>>;
  isDeletingComment: boolean;
  deleteCommentError: Nullable<AsyncError>;
}

const useComments = (): UseCommentsReturn => {
  const {
    asyncCallback: addComment,
    isLoading: isAddingComment,
    error: addCommentError,
  } = useAsync<Comment>(addCommentFn);

  const {
    asyncCallback: updateComment,
    isLoading: isUpdatingComment,
    error: updateCommentError,
  } = useAsync<Comment>(updateCommentFn);

  const {
    asyncCallback: deleteComment,
    isLoading: isDeletingComment,
    error: deleteCommentError,
  } = useAsync<void>(deleteCommentFn);

  return {
    addComment,
    isAddingComment,
    addCommentError,
    
    updateComment,
    isUpdatingComment,
    updateCommentError,
    
    deleteComment,
    isDeletingComment,
    deleteCommentError,
  };
};

export default useComments;
