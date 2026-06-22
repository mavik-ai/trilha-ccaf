import { describe, it, expect } from "vitest";
import { plans, profiles, progress } from "./schema";

describe("Database schema metadata", () => {
  it("should have tables defined", () => {
    expect(plans).toBeDefined();
    expect(profiles).toBeDefined();
    expect(progress).toBeDefined();
  });

  it("should check that key columns are defined", () => {
    expect(profiles.id).toBeDefined();
    expect(profiles.segment).toBeDefined();
    expect(profiles.whatsapp).toBeDefined();
    
    expect(plans.id).toBeDefined();
    expect(plans.userId).toBeDefined();
    expect(plans.hoursWeek).toBeDefined();
    
    expect(progress.id).toBeDefined();
    expect(progress.userId).toBeDefined();
    expect(progress.lessonId).toBeDefined();
  });
});
