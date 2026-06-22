import { describe, it, expect, vi } from "vitest";

// Mock das dependências externas do Neon Auth antes de importar os arquivos de configuração locais
vi.mock("@neondatabase/auth/next/server", () => {
  return {
    createNeonAuth: vi.fn(() => ({
      handler: vi.fn(),
      middleware: vi.fn(),
      getSession: vi.fn(),
    })),
  };
});

vi.mock("@neondatabase/auth/next", () => {
  return {
    createAuthClient: vi.fn(() => ({
      signIn: {
        magicLink: vi.fn(),
        social: vi.fn(),
      },
      signUp: {
        magicLink: vi.fn(),
        social: vi.fn(),
      },
      useSession: vi.fn(),
    })),
  };
});

import { auth, handler, middleware, getSession } from "./server";
import { authClient } from "./client";

describe("Neon Auth setup integration", () => {
  it("should properly configure and export server-side utilities", () => {
    expect(auth).toBeDefined();
    expect(handler).toBeDefined();
    expect(middleware).toBeDefined();
    expect(getSession).toBeDefined();
  });

  it("should properly configure and export client-side utilities", () => {
    expect(authClient).toBeDefined();
    expect(authClient.signIn).toBeDefined();
    expect(authClient.signUp).toBeDefined();
    expect(authClient.useSession).toBeDefined();
  });
});
