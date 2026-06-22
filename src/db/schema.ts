import { pgTable, uuid, text, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // Vinculado ao ID de usuário gerado pelo Neon Auth (Better Auth)
  segment: text("segment").notNull(), // Segmento de atuação (obrigatório: ex: Dev, Architect)
  whatsapp: text("whatsapp"), // Contato de WhatsApp opcional
  instagram: text("instagram"), // Perfil de Instagram opcional
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  hoursWeek: integer("hours_week").notNull(),
  includeBase: boolean("include_base").notNull(),
  startDate: timestamp("start_date").notNull(),
  targetDate: timestamp("target_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const progress = pgTable("progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  lessonId: text("lesson_id").notNull(), // ID estável da aula (ex: curso_modulo_aula)
  completedAt: timestamp("completed_at").defaultNow().notNull(),
}, (table) => [
  // Garante integridade evitando duplicatas de progresso para a mesma aula por usuário
  uniqueIndex("user_lesson_unique_idx").on(table.userId, table.lessonId)
]);
