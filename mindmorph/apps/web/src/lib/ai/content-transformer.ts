export function transformContent(content: string, mode: "simple" | "quiz" | "flashcards") {
  return `Transformed (${mode}): ${content}`;
}
