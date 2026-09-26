import type { TopicComment } from "@/types/models";

export function groupCommentThreads(comments: TopicComment[]) {
  const byId = new Map(comments.map((comment) => [comment.id, comment]));
  const roots = comments.filter((comment) => !comment.parent_comment_id || !byId.has(comment.parent_comment_id));
  const rootFor = (comment: TopicComment) => {
    let current = comment;
    const seen = new Set<string>();
    while (current.parent_comment_id && byId.has(current.parent_comment_id) && !seen.has(current.id)) {
      seen.add(current.id);
      current = byId.get(current.parent_comment_id)!;
    }
    return current.id;
  };
  return roots.map((root) => ({ root, replies: comments.filter((comment) => comment.id !== root.id && rootFor(comment) === root.id) }));
}
