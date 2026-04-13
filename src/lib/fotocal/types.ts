export type Friend = {
  createdAt: string | null;
  id: string;
  name: string;
};

export type MealEntry = {
  calories: number;
  createdAt: string | null;
  eatenAt: string;
  id: string;
  imagePath: string | null;
  imageUrl: string;
  loggedDate: string;
  notes: string;
  shared: boolean;
  title: string;
};

export type PersistenceMode = "local" | "supabase";

export type TrackerBootstrap = {
  friends: Friend[];
  meals: MealEntry[];
  notice?: string;
  persistenceMode: PersistenceMode;
};
