export function transformContent(content: string, mode: "simple" | "quiz" | "flashcards") {
  return { mode, output: `Transformed (${mode}): ${content}` };
}
