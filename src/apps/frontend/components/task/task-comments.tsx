import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { ButtonKind, ButtonType } from 'frontend/types/button';

import Button from 'frontend/components/button';
import Input from 'frontend/components/input';
import ParagraphMedium from 'frontend/components/typography/paragraph-medium';
import { getAccessTokenFromStorage } from 'frontend/utils/storage-util';
import useComments from 'frontend/pages/tasks/use-comments.hook';
import { Comment } from 'frontend/services/task.service';

interface TaskCommentsProps {
  taskId: string;
  accountId: string;
  initialComments?: Comment[];
  className?: string;
}


const TaskComments: React.FC<TaskCommentsProps> = ({
  taskId,
  accountId,
  initialComments = [],
  className,
}) => {
  const currentAccountId = getAccessTokenFromStorage()?.accountId;
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  const {
    addComment,
    isAddingComment,
    addCommentError,
    updateComment,
    isUpdatingComment,
    updateCommentError,
    deleteComment,
    isDeletingComment,
    deleteCommentError,
  } = useComments();

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentAccountId || isAddingComment) return;

    try {
      const addedComment = await addComment(
        accountId,
        taskId,
        newComment,
      );

      if (addedComment) {
        const updatedComments = [...comments, addedComment];
        setComments(updatedComments);
        setNewComment('');
        toast.success('Comment added successfully!');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editCommentContent.trim() || !currentAccountId) return;

    try {
      const updatedComment = await updateComment(
        accountId,
        taskId,
        commentId,
        editCommentContent,
      );

      if (updatedComment) {
        const updatedComments = comments.map((comment) =>
          comment.id === commentId ? updatedComment : comment,
        );

        setComments(updatedComments);
        setEditingCommentId(null);
        setEditCommentContent('');
        toast.success('Comment updated successfully!');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentAccountId) return;

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteComment(
        accountId,
        taskId,
        commentId,
      );

      const updatedComments = comments.filter(
        (comment) => comment.id !== commentId,
      );
      setComments(updatedComments);
      toast.success('Comment deleted successfully!');
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  return (
    <div className={clsx('space-y-4', className)}>
      <h3 className="text-title-md font-semibold text-black">Comments ({comments.length})</h3>

      {(addCommentError || updateCommentError || deleteCommentError) && (
        <div className="p-3 mb-4 text-red-600 bg-red-100 rounded-md">
          {addCommentError?.message || updateCommentError?.message || deleteCommentError?.message || 'An error occurred'}
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="space-y-2">
        <div className="space-y-2">
          <div className="w-full">
            <Input
              type="text"
              value={newComment}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewComment(e.target.value)
              }
              placeholder="Add a comment..."
              disabled={isDeletingComment}
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment(e as any);
                }
              }}
            />
          </div>
          <Button
            type={ButtonType.SUBMIT}
            disabled={!newComment.trim() || isAddingComment}
            kind={ButtonKind.PRIMARY}
          >
            {isAddingComment ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <ParagraphMedium>
            No comments yet. Be the first to comment!
          </ParagraphMedium>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment: Comment) => (
              <li key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                {editingCommentId === comment.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      className="w-full"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button onClick={cancelEditing}>Cancel</Button>
                      <Button
                        onClick={() => handleUpdateComment(comment.id)}
                        disabled={!editCommentContent.trim() || isUpdatingComment}
                      >
                        {isUpdatingComment ? 'Updating...' : 'Update'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-gray-900">
                        You
                      </div>
                      <div className="text-sm text-gray-500">
                        {comment.updated_at
                          ? new Date(comment.updated_at).toLocaleString()
                          : 'Unknown date'}
                      </div>
                    </div>
                    <ParagraphMedium>{comment.content}</ParagraphMedium>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEditing(comment)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Edit comment"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-gray-500 hover:text-red-600"
                        title="Delete comment"
                        disabled={isDeletingComment}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TaskComments;
