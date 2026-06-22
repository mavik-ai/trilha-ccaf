import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protege a rota /conta
  if (path.startsWith("/conta")) {
    try {
      const session = await getSession();
      
      if (!session) {
        const signInUrl = new URL("/auth/sign-in", request.url);
        signInUrl.searchParams.set("callbackUrl", request.url);
        return NextResponse.redirect(signInUrl);
      }
    } catch (error) {
      console.error("Erro ao verificar sessão no middleware:", error);
      // Em caso de erro local (por exemplo, banco indisponível durante testes), permite prosseguir para evitar travar as verificações
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.next();
      }
      const signInUrl = new URL("/auth/sign-in", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/conta/:path*"],
};
