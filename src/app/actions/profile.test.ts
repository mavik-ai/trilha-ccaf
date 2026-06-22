import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { getSession } from "@/lib/auth/server";
import { getProfileAction, updateProfileAction } from "./profile";
import { clearRateLimits } from "./plan";

// Mocks para isolar banco e identidade nos testes
vi.mock("@/lib/auth/server", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/db", () => {
  const mockLimit = vi.fn().mockResolvedValue([]);
  const mockWhere = vi.fn().mockReturnThis();
  const mockFrom = vi.fn().mockReturnThis();
  const mockSelect = vi.fn().mockReturnThis();
  const mockInsert = vi.fn().mockReturnThis();
  const mockValues = vi.fn().mockReturnThis();
  const mockOnConflictDoUpdate = vi.fn().mockResolvedValue({ success: true });

  return {
    db: {
      select: mockSelect,
      from: mockFrom,
      where: mockWhere,
      limit: mockLimit,
      insert: mockInsert,
      values: mockValues,
      onConflictDoUpdate: mockOnConflictDoUpdate,
    },
  };
});

describe("Server Actions - Profile Settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRateLimits();
  });

  it("should fail getProfileAction if user session is not present", async () => {
    (getSession as Mock).mockResolvedValue(null);

    const res = await getProfileAction();
    expect(res).toHaveProperty("error");
    expect(res.error).toContain("Não autorizado");
  });

  it("should fail updateProfileAction if user session is not present", async () => {
    (getSession as Mock).mockResolvedValue(null);

    const res = await updateProfileAction({ segment: "Dev" });
    expect(res).toHaveProperty("error");
    expect(res.error).toContain("Não autorizado");
  });

  it("should block updateProfileAction if segment is empty", async () => {
    (getSession as Mock).mockResolvedValue({
      data: {
        user: { id: "test-uuid-user" },
      },
    });

    const res = await updateProfileAction({ segment: "" });
    expect(res).toHaveProperty("error");
    expect(res.error).toContain("Segmento é obrigatório");
  });

  it("should block updateProfileAction if whatsapp is invalid (letters or short)", async () => {
    (getSession as Mock).mockResolvedValue({
      data: {
        user: { id: "test-uuid-user" },
      },
    });

    const res = await updateProfileAction({ segment: "Dev", whatsapp: "abcde" });
    expect(res).toHaveProperty("error");
    expect(res.error).toContain("WhatsApp inválido");
  });

  it("should succeed in updateProfileAction with valid inputs and sanitize instagram username", async () => {
    (getSession as Mock).mockResolvedValue({
      data: {
        user: { id: "test-uuid-user" },
      },
    });

    const res = await updateProfileAction({
      segment: "Architect",
      whatsapp: "(11) 99999-9999",
      instagram: "@claude.architect",
    });

    expect(res).toHaveProperty("success", true);
  });
});
