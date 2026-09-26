import { CornerDownRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createComment, deleteComment, editComment } from "@/features/comments/actions";
import { groupCommentThreads } from "@/features/comments/thread";
import { formatDateTime } from "@/lib/format";
import type { TopicComment } from "@/types/models";

function CommentBody({ comment, currentUserId, next, topicId, reply = false }: { comment: TopicComment; currentUserId: string | null; next: string; topicId: string; reply?: boolean }) {
  const own = currentUserId === comment.author_id;
  return (
    <article className={reply ? "border-l-2 border-emerald-200 pl-4" : "border-t border-[var(--line)] pt-5"}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <strong className="text-sm">{comment.deleted_at ? "Gelöschter Kommentar" : comment.author_name}</strong>
        <time className="text-xs text-[var(--muted)]">{formatDateTime(comment.created_at)}</time>
      </div>
      <p className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${comment.deleted_at ? "italic text-[var(--muted)]" : ""}`}>
        {comment.deleted_at ? "Kommentar wurde gelöscht" : comment.body}
      </p>
      {comment.edited_at && !comment.deleted_at && <span className="text-xs text-[var(--muted)]">bearbeitet</span>}
      {!comment.deleted_at && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-semibold text-[var(--brand-strong)]">Antworten</summary>
          <form action={createComment} className="mt-3 flex gap-2">
            <input type="hidden" name="topicId" value={topicId} /><input type="hidden" name="parentCommentId" value={comment.id} /><input type="hidden" name="next" value={next} />
            <input name="body" required maxLength={5000} aria-label="Antwort" className="min-w-0 flex-1 border border-[var(--line)] bg-white px-3 py-2 text-sm" />
            <Button type="submit" variant="secondary">Senden</Button>
          </form>
        </details>
      )}
      {own && !comment.deleted_at && (
        <div className="mt-3 flex flex-wrap gap-3">
          <details>
            <summary className="flex cursor-pointer items-center gap-1 text-xs"><Pencil className="h-3 w-3" />Bearbeiten</summary>
            <form action={editComment} className="mt-2 flex gap-2">
              <input type="hidden" name="commentId" value={comment.id} /><input type="hidden" name="next" value={next} />
              <input name="body" defaultValue={comment.body ?? ""} required maxLength={5000} className="border border-[var(--line)] px-2 py-1 text-sm" />
              <Button type="submit" variant="secondary">Speichern</Button>
            </form>
          </details>
          <form action={deleteComment}><input type="hidden" name="commentId" value={comment.id} /><input type="hidden" name="next" value={next} /><button className="flex items-center gap-1 text-xs text-[var(--danger)]"><Trash2 className="h-3 w-3" />Löschen</button></form>
        </div>
      )}
    </article>
  );
}

export function CommentThread({ comments, topicId, currentUserId, next }: { comments: TopicComment[]; topicId: string; currentUserId: string | null; next: string }) {
  const threads = groupCommentThreads(comments);
  return (
    <section className="py-8" id="kommentare">
      <h2 className="text-xl font-bold">Diskussion <span className="font-normal text-[var(--muted)]">({comments.length})</span></h2>
      <form action={createComment} className="mt-5 space-y-3">
        <input type="hidden" name="topicId" value={topicId} /><input type="hidden" name="next" value={next} />
        <textarea name="body" required maxLength={5000} rows={4} placeholder="Kommentar schreiben" className="w-full resize-y border border-[var(--line)] bg-white p-3" />
        <Button type="submit">Kommentieren</Button>
      </form>
      <div className="mt-8 space-y-6">
        {threads.length === 0 && <p className="text-sm text-[var(--muted)]">Noch keine Kommentare.</p>}
        {threads.map(({ root, replies }) => (
          <div key={root.id} className="space-y-4">
            <CommentBody comment={root} currentUserId={currentUserId} next={next} topicId={topicId} />
            {replies.length > 0 && <div className="ml-4 space-y-4 sm:ml-8"><div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><CornerDownRight className="h-4 w-4" />Antworten</div>{replies.map((reply) => <CommentBody key={reply.id} comment={reply} currentUserId={currentUserId} next={next} topicId={topicId} reply />)}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
