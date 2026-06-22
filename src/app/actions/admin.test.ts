import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { getSession } from "@/lib/auth/server";
import { getLeadsAction } from "./admin";
import { clearRateLimits } from "./plan";

// Mocks para isolamento de banco e sessão
vi.mock("@/lib/auth/server", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/db", () => {
  const mockExecute = vi.fn().mockResolvedValue({
    rows: [
      {
        id: "user-1-uuid",
        email: "lead1@mavik.com.br",
        segment: "Dev",
        whatsapp: "11999999999",
        instagram: "lead.insta",
        createdAt: new Date().toISOString(),
        completedLessonsCount: 5,
      },
    ],
  });

  return {
    db: {
      execute: mockExecute,
    },
  };
});

describe("Server Actions - Admin Leads Query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRateLimits();
  });

  it("should fail getLeadsAction if session is missing", async () => {
    (getSession as Mock).mockResolvedValue(null);

    const res = await getLeadsAction();
    expect(res).toHaveProperty("error");
    expect(res.error).toContain("Não autorizado");
  });

  it("should fail getLeadsAction if user is not in ADMIN_EMAILS", async () => {
    (getSession as Mock).mockResolvedValue({
      data: {
        user: { id: "user-uuid", email: "user@regular.com" },
      },
    });

    const res = await getLeadsAction();
    expect(res).toHaveProperty("error");
    expect(res.error).toContain("Acesso restrito");
  });

  it("should succeed in getLeadsAction if user is an admin", async () => {
    (getSession as Mock).mockResolvedValue({
      data: {
        user: { id: "admin-uuid", email: "admin@mavik.com.br" },
      },
    });

    const res = await getLeadsAction();
    expect(res).toHaveProperty("data");
    expect(res.data).toBeInstanceOf(Array);
    expect(res.data?.[0]).toHaveProperty("email", "lead1@mavik.com.br");
  });
});
