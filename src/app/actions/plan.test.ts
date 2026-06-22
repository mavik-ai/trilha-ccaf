import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { getSession } from "@/lib/auth/server";
import { savePlanAction, syncLocalProgressAction } from "./plan";

// Mocks para isolamento de chamadas externas de infraestrutura
vi.mock("@/lib/auth/server", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/db", () => {
  const mockDelete = vi.fn().mockReturnThis();
  const mockWhere = vi.fn().mockResolvedValue({ success: true });
  const mockInsert = vi.fn().mockReturnThis();
  const mockValues = vi.fn().mockReturnThis();
  const mockOnConflictDoNothing = vi.fn().mockResolvedValue({ success: true });

  return {
    db: {
      delete: mockDelete,
      insert: mockInsert,
      where: mockWhere,
      values: mockValues,
      onConflictDoNothing: mockOnConflictDoNothing,
    },
  };
});

describe("Server Actions - Plan & Sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error in savePlanAction if user session is not present", async () => {
    (getSession as Mock).mockResolvedValue(null);

    const res = await savePlanAction({
      hoursWeek: 5,
      includeBase: false,
      startDate: "2026-06-22",
    });

    expect(res).toHaveProperty("error");
    expect(res.error).toContain("Não autorizado");
  });

  it("should return success in savePlanAction if user is authenticated", async () => {
    (getSession as Mock).mockResolvedValue({
      data: {
        user: { id: "test-uuid-user" },
      },
    });

    const res = await savePlanAction({
      hoursWeek: 8,
      includeBase: true,
      startDate: "2026-06-22",
    });

    expect(res).toHaveProperty("success", true);
  });

  it("should return error in syncLocalProgressAction if user session is not present", async () => {
    (getSession as Mock).mockResolvedValue(null);

    const res = await syncLocalProgressAction(["lesson_1", "lesson_2"]);

    expect(res).toHaveProperty("error");
    expect(res.error).toContain("Não autorizado");
  });

  it("should skip execution in syncLocalProgressAction if lessonIds is empty", async () => {
    const res = await syncLocalProgressAction([]);
    expect(res).toHaveProperty("success", true);
  });

  it("should succeed in syncLocalProgressAction if user is authenticated and lessonIds are provided", async () => {
    (getSession as Mock).mockResolvedValue({
      data: {
        user: { id: "test-uuid-user" },
      },
    });

    const res = await syncLocalProgressAction(["lesson_1"]);
    expect(res).toHaveProperty("success", true);
  });
});
