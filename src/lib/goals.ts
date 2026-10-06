// Goals are user-named sub accounts inside a fund, with a topic icon and optional target.
export type GoalTopic = {
  key: string;
  label: string;
  emoji: string;
  hue: number; // oklch hue for the tile tint
};

export const GOAL_TOPICS: GoalTopic[] = [
  { key: "travel", label: "Travel", emoji: "✈️", hue: 220 },
  { key: "home", label: "Home", emoji: "🏡", hue: 150 },
  { key: "car", label: "Car", emoji: "🚗", hue: 25 },
  { key: "wedding", label: "Wedding", emoji: "💍", hue: 340 },
  { key: "education", label: "Education", emoji: "🎓", hue: 265 },
  { key: "emergency", label: "Rainy day", emoji: "☔", hue: 200 },
  { key: "retirement", label: "Retirement", emoji: "🌴", hue: 130 },
  { key: "baby", label: "Little one", emoji: "🍼", hue: 300 },
  { key: "tech", label: "Gadgets", emoji: "💻", hue: 240 },
  { key: "gift", label: "Gifts", emoji: "🎁", hue: 10 },
  { key: "health", label: "Health", emoji: "🧘", hue: 170 },
  { key: "other", label: "Something else", emoji: "✨", hue: 55 },
];

export type Goal = {
  id: string;
  fundName: string;
  name: string;
  topic: string;
  emoji: string;
  target?: number;
  targetDate?: string;
  saved: number;
  createdAt: string;
};

export const GOALS_KEY = "unitTrustGoals";

export function readGoals(): Goal[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(GOALS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function writeGoals(goals: Goal[]) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function topicFor(key: string) {
  return GOAL_TOPICS.find((t) => t.key === key) ?? GOAL_TOPICS[GOAL_TOPICS.length - 1];
}

export function goalProgress(goal: Goal) {
  if (!goal.target) return null;
  return Math.min(100, Math.round((goal.saved / goal.target) * 100));
}
