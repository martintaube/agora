import { describe, expect, it } from "vitest";
import { groupCommentThreads } from "./thread";
import type { TopicComment } from "@/types/models";

const comment = (id: string, parent: string | null): TopicComment => ({ id, parent_comment_id: parent, author_id: id, author_name: id, body: id, edited_at: null, deleted_at: null, created_at: "2026-09-26T12:00:00Z" });

describe("groupCommentThreads", () => {
  it("renders deeper replies in the second visual level", () => {
    const threads = groupCommentThreads([comment("root", null), comment("reply", "root"), comment("deep", "reply")]);
    expect(threads).toHaveLength(1);
    expect(threads[0].replies.map((item) => item.id)).toEqual(["reply", "deep"]);
  });

  it("keeps an orphaned reply visible as a root", () => {
    expect(groupCommentThreads([comment("orphan", "hidden-parent")])[0].root.id).toBe("orphan");
  });
});
