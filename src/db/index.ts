import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lança um erro explicativo caso as variáveis de ambiente necessárias estejam ausentes
if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL ausente no ambiente de produção.");
  }
  // No ambiente de desenvolvimento/teste local, podemos usar um placeholder para evitar travar a compilação
  console.warn("Aviso: DATABASE_URL não configurada. Operações de banco de dados podem falhar.");
}

const databaseUrl = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";

const sql = neon(databaseUrl);

// Exporta a instância tipada com nosso schema para consultas tipadas
export const db = drizzle(sql, { schema });
export type DbType = typeof db;
export * from "./schema";
