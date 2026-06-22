import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getLocalProgress, saveLocalProgress, toggleLocalProgress } from "./local-progress";

describe("local-progress utility", () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    const mockLocalStorage = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      length: 0,
      key: vi.fn(() => null),
    };

    vi.stubGlobal("window", {
      localStorage: mockLocalStorage,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return empty array if no progress is stored", () => {
    const progress = getLocalProgress();
    expect(progress).toEqual([]);
  });

  it("should save and retrieve progress", () => {
    const list = ["course_module_lesson1", "course_module_lesson2"];
    saveLocalProgress(list);
    const progress = getLocalProgress();
    expect(progress).toEqual(list);
  });

  it("should toggle lesson progress correctly (add and remove)", () => {
    const lessonId = "course_module_lesson1";
    
    // Primeiro toggle adiciona a aula
    let next = toggleLocalProgress(lessonId);
    expect(next).toEqual([lessonId]);
    expect(getLocalProgress()).toEqual([lessonId]);

    // Segundo toggle remove a aula
    next = toggleLocalProgress(lessonId);
    expect(next).toEqual([]);
    expect(getLocalProgress()).toEqual([]);
  });

  it("should handle error parsing gracefully", () => {
    // Escreve um JSON corrompido no mock store
    store["trilha_progress_v1"] = "{invalid-json";
    
    const progress = getLocalProgress();
    expect(progress).toEqual([]);
  });
});
