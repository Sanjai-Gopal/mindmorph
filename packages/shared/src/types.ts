export type Difficulty = "easy" | "medium" | "hard";

export interface LearningGoal {
  id: string;
  topic: string;
  difficulty: Difficulty;
}
