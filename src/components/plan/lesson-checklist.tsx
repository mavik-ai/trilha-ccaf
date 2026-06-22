"use client";

import { useProgress } from "./progress-context";
import { Check } from "lucide-react";

interface LessonChecklistProps {
  lessonId: string;
  lessonName: string;
}

export function LessonChecklist({ lessonId, lessonName }: LessonChecklistProps) {
  const { isCompleted, toggleLesson } = useProgress();
  const completed = isCompleted(lessonId);

  return (
    <li
      onClick={() => toggleLesson(lessonId)}
      className="group/item text-xs sm:text-sm text-muted-foreground hover:text-foreground font-sans flex items-start gap-2.5 transition-colors duration-150 py-1 cursor-pointer select-none"
    >
      {/* Checkbox customizado */}
      <div
        className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200 ${
          completed
            ? "bg-primary border-primary text-background"
            : "border-border bg-card/10 group-hover/item:border-primary/50"
        }`}
      >
        {completed && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
      </div>

      {/* Nome da lição */}
      <span
        className={`leading-snug transition-all duration-200 ${
          completed
            ? "text-muted-foreground/50 line-through decoration-muted-foreground/30"
            : "text-muted-foreground group-hover/item:text-foreground"
        }`}
      >
        {lessonName}
      </span>
    </li>
  );
}
