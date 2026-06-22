import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { getSession } from "@/lib/auth/server";
import { toggleLessonAction } from "./progress";
import { clearRateLimits } from "./plan";

// Mocks para isolar banco e identidade nos testes
vi.mock("@/lib/auth/server", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/db", () => {
  const mockDelete = vi.fn().mockReturnThis();
  const mockWhere = vi.fn().mockReturnThis();
  const mockInsert = vi.fn().mockReturnThis();
  const mockValues = vi.fn().mockReturnThis();
  const mockOnConflictDoNothing = vi.fn().mockResolvedValue({ success: true });
  const mockSelect = vi.fn().mockReturnThis();
  const mockFrom = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockResolvedValue([{ id: "test-uuid-user", segment: "Dev" }]);

  return {
    db: {
      select: mockSelect,
      from: mockFrom,
      limit: mockLimit,
      delete: mockDelete,
      insert: mockInsert,
      where: mockWhere,
      values: mockValues,
      onConflictDoNothing: mockOnConflictDoNothing,
    },
  };
});

describe("Server Actions - Progress Toggling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRateLimits(); // Reseta rate limiting para garantir isolamento
  });

  it("should return error in toggleLessonAction if user session is not present", async () => {
    (getSession as Mock).mockResolvedValue(null);

    const res = await toggleLessonAction("lesson_1", true);

    expect(res).toHaveProperty("error");
    expect(res.error).toContain("Não autorizado");
  });

  it("should succeed in toggleLessonAction when adding a completed lesson (completed = true)", async () => {
    (getSession as Mock).mockResolvedValue({
      data: {
        user: { id: "test-uuid-user" },
      },
    });

    const res = await toggleLessonAction("lesson_1", true);
    expect(res).toHaveProperty("success", true);
  });

  it("should succeed in toggleLessonAction when removing a completed lesson (completed = false)", async () => {
    (getSession as Mock).mockResolvedValue({
      data: {
        user: { id: "test-uuid-user" },
      },
    });

    const res = await toggleLessonAction("lesson_1", false);
    expect(res).toHaveProperty("success", true);
  });
});
