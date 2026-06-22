import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { getSession } from "@/lib/auth/server";
import { savePlanAction, syncLocalProgressAction, signUpWithTurnstileAction, clearRateLimits } from "./plan";

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

// Mock global da função fetch para simular a resposta da API do Cloudflare Turnstile
const globalFetchMock = vi.fn().mockResolvedValue({
  json: () => Promise.resolve({ success: true }),
});
vi.stubGlobal("fetch", globalFetchMock);

describe("Server Actions - Plan & Sync with Rate Limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRateLimits(); // Limpa as taxas limites para isolamento total entre os testes
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

  it("should trigger rate limit on subsequent savePlanAction calls", async () => {
    (getSession as Mock).mockResolvedValue({
      data: {
        user: { id: "test-uuid-user-2" },
      },
    });

    // Primeira chamada - Deve passar
    const res1 = await savePlanAction({
      hoursWeek: 5,
      includeBase: false,
      startDate: "2026-06-22",
    });
    expect(res1).toHaveProperty("success", true);

    // Segunda chamada imediata - Deve falhar por rate limit
    const res2 = await savePlanAction({
      hoursWeek: 5,
      includeBase: false,
      startDate: "2026-06-22",
    });
    expect(res2).toHaveProperty("error");
    expect(res2.error).toContain("Muitas requisições");
  });

  it("should fail syncLocalProgressAction if not authenticated", async () => {
    (getSession as Mock).mockResolvedValue(null);

    const res = await syncLocalProgressAction(["lesson_1", "lesson_2"]);

    expect(res).toHaveProperty("error");
    expect(res.error).toContain("Não autorizado");
  });

  it("should succeed in signUpWithTurnstileAction if turnstile response is success", async () => {
    globalFetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true }),
    });

    const res = await signUpWithTurnstileAction("email@example.com", "valid-turnstile-token");
    expect(res).toHaveProperty("success", true);
  });

  it("should fail in signUpWithTurnstileAction if turnstile response is failure", async () => {
    globalFetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false }),
    });

    const res = await signUpWithTurnstileAction("email@example.com", "invalid-turnstile-token");
    expect(res).toHaveProperty("error");
    expect(res.error).toContain("anti-bot inválida");
  });
});
