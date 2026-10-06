import {
  Plane, Palmtree, Map, Luggage, Home, Sofa, KeyRound, Car, Bike, Fuel, Gem, Heart, PartyPopper,
  GraduationCap, BookOpen, Umbrella, ShieldCheck, LifeBuoy, Sun, Coffee, Baby, Smile, Laptop,
  Smartphone, Headphones, Gamepad2, Camera, Gift, Cake, HeartPulse, Dumbbell, Sparkles, Star,
  Rocket, Target, Wallet, PiggyBank, Sprout, TrendingUp, type LucideIcon,
} from "lucide-react";
import type { SubAccount } from "@/data/unitTrusts";

// Goals ARE sub accounts: a named sub account with a topic icon and an optional target.
export type GoalTopic = { key: string; label: string; hue: number; icons: string[] };

export const ICONS: Record<string, LucideIcon> = {
  Plane, Palmtree, Map, Luggage, Home, Sofa, KeyRound, Car, Bike, Fuel, Gem, Heart, PartyPopper,
  GraduationCap, BookOpen, Umbrella, ShieldCheck, LifeBuoy, Sun, Coffee, Baby, Smile, Laptop,
  Smartphone, Headphones, Gamepad2, Camera, Gift, Cake, HeartPulse, Dumbbell, Sparkles, Star,
  Rocket, Target, Wallet, PiggyBank, Sprout, TrendingUp,
};

export const GOAL_TOPICS: GoalTopic[] = [
  { key: "travel", label: "Travel", hue: 230, icons: ["Plane", "Luggage", "Map", "Palmtree"] },
  { key: "home", label: "Home", hue: 150, icons: ["Home", "Sofa", "KeyRound"] },
  { key: "car", label: "Car", hue: 40, icons: ["Car", "Bike", "Fuel"] },
  { key: "wedding", label: "Wedding", hue: 350, icons: ["Gem", "Heart", "PartyPopper"] },
  { key: "education", label: "Education", hue: 280, icons: ["GraduationCap", "BookOpen"] },
  { key: "emergency", label: "Rainy day", hue: 200, icons: ["Umbrella", "ShieldCheck", "LifeBuoy"] },
  { key: "retirement", label: "Retirement", hue: 120, icons: ["Palmtree", "Sun", "Coffee"] },
  { key: "baby", label: "Little one", hue: 320, icons: ["Baby", "Smile", "Heart"] },
  { key: "tech", label: "Gadgets", hue: 255, icons: ["Laptop", "Smartphone", "Headphones", "Gamepad2", "Camera"] },
  { key: "gift", label: "Gifts", hue: 15, icons: ["Gift", "Cake", "PartyPopper"] },
  { key: "health", label: "Health", hue: 175, icons: ["HeartPulse", "Dumbbell", "Sprout"] },
  { key: "other", label: "Something else", hue: 75, icons: ["Sparkles", "Star", "Rocket", "Target"] },
];

export type Goal = {
  id: string;
  fundName: string;
  name: string;
  topic: string;
  icon: string;
  target?: number;
  targetDate?: string;
  saved: number;
  createdAt: string;
};

export const GOALS_KEY = "unitTrustGoals";

export function readGoals(): Goal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw: Goal[] = JSON.parse(localStorage.getItem(GOALS_KEY) || "[]");
    return raw.map((g) => ({ ...g, icon: ICONS[g.icon] ? g.icon : topicFor(g.topic).icons[0]! }));
  } catch {
    return [];
  }
}

export function writeGoals(goals: Goal[]) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function topicFor(key: string) {
  return GOAL_TOPICS.find((t) => t.key === key) ?? GOAL_TOPICS[GOAL_TOPICS.length - 1]!;
}

// Monzo-pot style tile: soft saturated colour, dark icon
export function tileStyle(hue: number) {
  return { background: `oklch(0.78 0.12 ${hue})`, color: "var(--background)" };
}

// Icons for existing sub accounts, matched by name
export function iconForSubAccount(name: string): { icon: LucideIcon; hue: number } {
  const n = name.toLowerCase();
  if (n.includes("retire")) return { icon: Palmtree, hue: 120 };
  if (n.includes("emergency") || n.includes("rainy")) return { icon: Umbrella, hue: 200 };
  if (n.includes("growth")) return { icon: TrendingUp, hue: 150 };
  if (n.includes("car")) return { icon: Car, hue: 40 };
  if (n.includes("educat") || n.includes("school")) return { icon: GraduationCap, hue: 280 };
  if (n.includes("travel") || n.includes("holiday")) return { icon: Plane, hue: 230 };
  if (n.includes("home") || n.includes("house")) return { icon: Home, hue: 150 };
  if (n.includes("general")) return { icon: Wallet, hue: 255 };
  return { icon: PiggyBank, hue: 330 };
}

export function goalToSubAccount(g: Goal): SubAccount {
  const lkr = (n: number) => `LKR ${n.toLocaleString("en-LK")}`;
  return {
    id: g.id,
    fundName: g.fundName,
    name: g.name,
    value: lkr(g.saved),
    valueNum: g.saved,
    earnings7d: lkr(0), earnings7dNum: 0,
    earnings30d: lkr(0), earnings30dNum: 0,
    earningsAll: lkr(0), earningsAllNum: 0,
    returnPct: "0%",
    dotColor: `oklch(0.78 0.12 ${topicFor(g.topic).hue})`,
    goalTarget: g.target,
    goalDeadline: g.targetDate,
    createdAt: g.createdAt,
    activity: [],
  };
}
