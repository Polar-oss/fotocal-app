export type UserObjective = "emagrecer" | "manter" | "ganhar-massa";

export type UserProfile = {
  heightCm: number | null;
  objective: UserObjective | null;
  weightKg: number | null;
};

const OBJECTIVE_LABELS: Record<UserObjective, string> = {
  emagrecer: "Emagrecer",
  manter: "Manter peso",
  "ganhar-massa": "Ganhar massa",
};

export function normalizeObjective(value?: string | null): UserObjective | null {
  if (
    value === "emagrecer" ||
    value === "manter" ||
    value === "ganhar-massa"
  ) {
    return value;
  }

  return null;
}

export function getObjectiveLabel(value?: string | null) {
  const objective = normalizeObjective(value);

  return objective ? OBJECTIVE_LABELS[objective] : null;
}

export function getObjectiveDescription(value?: string | null) {
  switch (normalizeObjective(value)) {
    case "emagrecer":
      return "foco em saciedade, proteina e refeicoes mais leves no fechamento do dia";
    case "ganhar-massa":
      return "foco em constancia, proteina e energia suficiente para treino e recuperacao";
    case "manter":
      return "foco em equilibrio, previsibilidade e porcoes estaveis na rotina";
    default:
      return "defina um objetivo para receber leituras mais uteis ao longo do dia";
  }
}

export function parseWeightKg(value?: string | number | null) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value >= 35 && value <= 320 ? Math.round(value * 10) / 10 : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(",", "."));

    if (Number.isFinite(parsed) && parsed >= 35 && parsed <= 320) {
      return Math.round(parsed * 10) / 10;
    }
  }

  return null;
}

export function parseHeightCm(value?: string | number | null) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value >= 120 && value <= 240 ? Math.round(value) : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(",", "."));

    if (Number.isFinite(parsed) && parsed >= 120 && parsed <= 240) {
      return Math.round(parsed);
    }
  }

  return null;
}
