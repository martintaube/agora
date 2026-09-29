import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  requireCommunityAdmin: vi.fn(),
  topicInsert: vi.fn(),
  optionInsert: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("./auth", () => ({ requireCommunityAdmin: mocks.requireCommunityAdmin }));

import { createTopic } from "./actions";

describe("createTopic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redirect.mockImplementation((url: string) => { throw new Error(`redirect:${url}`); });
    mocks.topicInsert.mockResolvedValue({ error: null });
    mocks.optionInsert.mockResolvedValue({ error: null });
    mocks.requireCommunityAdmin.mockResolvedValue({
      user: { id: "91000000-0000-0000-0000-000000000003" },
      community: { id: "92000000-0000-0000-0000-000000000001" },
      supabase: {
        from: (table: string) => ({ insert: table === "topics" ? mocks.topicInsert : mocks.optionInsert }),
      },
    });
  });

  it("inserts without RETURNING and reuses the generated topic id", async () => {
    const formData = new FormData();
    Object.entries({
      communitySlug: "ltc",
      type: "opinion",
      visibility: "community",
      title: "Neues Topic",
      content: "Kontext",
      guidingQuestion: "Wie ist eure Meinung?",
      publicationStatus: "draft",
      participationStatus: "open",
    }).forEach(([key, value]) => formData.set(key, value));

    await expect(createTopic(formData)).rejects.toThrow("redirect:/c/ltc/admin/topics/");

    expect(mocks.topicInsert).toHaveBeenCalledOnce();
    const topicId = mocks.topicInsert.mock.calls[0][0].id;
    expect(topicId).toMatch(/^[0-9a-f-]{36}$/);
    expect(mocks.optionInsert).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ topic_id: topicId, label: "Gute Idee" }),
    ]));
    expect(mocks.redirect).toHaveBeenCalledWith("/c/ltc/admin/topics/neues-topic");
  });
});
