"use client";

import Image from "next/image";
import type { ChangeEvent, FormEvent } from "react";
import { startTransition, useEffect, useRef, useState } from "react";
import { MEAL_IMAGE_MAX_BYTES } from "@/lib/fotocal/constants";
import type {
  Friend,
  MealEntry,
  PersistenceMode,
} from "@/lib/fotocal/types";

type MealAnalysis = {
  confidence: "alta" | "baixa" | "media";
  estimated_calories: number;
  foods: string[];
  notes_suggestion: string;
  rationale: string;
  title: string;
};

type MealTrackerProps = {
  calorieGoal: number | null;
  isAiEnabled: boolean;
  initialFriends: Friend[];
  initialMeals: MealEntry[];
  persistenceMode: PersistenceMode;
  statusMessage?: string;
  storageNamespace: string;
};

type FormState = {
  calories: string;
  eatenAt: string;
  notes: string;
  title: string;
};

function getStorageKey(namespace: string, suffix: string) {
  return `fotocal:${namespace}:${suffix}`;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentTime() {
  return new Date().toTimeString().slice(0, 5);
}

function getDefaultFormState(): FormState {
  return {
    calories: "",
    eatenAt: getCurrentTime(),
    notes: "",
    title: "",
  };
}

function formatCalories(value: number) {
  return `${value.toLocaleString("pt-BR")} kcal`;
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T12:00:00`));
}

function formatDateTime(value: string, time: string) {
  return `${formatDateLabel(value)} às ${time}`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Nao foi possivel carregar a imagem."));
    reader.readAsDataURL(file);
  });
}

function isMealEntry(value: unknown): value is MealEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<MealEntry>;

  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.calories === "number" &&
    typeof item.loggedDate === "string" &&
    typeof item.eatenAt === "string" &&
    typeof item.notes === "string" &&
    typeof item.shared === "boolean" &&
    typeof item.imageUrl === "string"
  );
}

function isFriend(value: unknown): value is Friend {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<Friend>;

  return typeof item.id === "string" && typeof item.name === "string";
}

type ErrorPayload = {
  error?: string;
};

type SuccessPayload<T> = {
  data: T;
  message?: string;
};

function getErrorFromPayload(payload: ErrorPayload | Record<string, unknown>) {
  return typeof payload.error === "string" ? payload.error : null;
}

function getMessageFromPayload(payload: Record<string, unknown>) {
  return typeof payload.message === "string" ? payload.message : null;
}

export function MealTracker({
  calorieGoal,
  isAiEnabled,
  initialFriends,
  initialMeals,
  persistenceMode,
  statusMessage,
  storageNamespace,
}: MealTrackerProps) {
  const [form, setForm] = useState<FormState>(getDefaultFormState);
  const [meals, setMeals] = useState<MealEntry[]>(initialMeals);
  const [friends, setFriends] = useState<Friend[]>(initialFriends);
  const [friendName, setFriendName] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayDate);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shareMeal, setShareMeal] = useState(false);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [isSavingFriend, setIsSavingFriend] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const hasLoadedStorage = useRef(false);

  const isLocalMode = persistenceMode === "local";

  useEffect(() => {
    if (!isLocalMode) {
      return;
    }

    try {
      const storedMeals = window.localStorage.getItem(
        getStorageKey(storageNamespace, "meals"),
      );
      const storedFriends = window.localStorage.getItem(
        getStorageKey(storageNamespace, "friends"),
      );

      const parsedMeals = storedMeals
        ? (JSON.parse(storedMeals) as unknown[]).filter(isMealEntry)
        : initialMeals;
      const parsedFriends = storedFriends
        ? (JSON.parse(storedFriends) as unknown[]).filter(isFriend)
        : initialFriends;

      startTransition(() => {
        setMeals(parsedMeals);
        setFriends(parsedFriends);
      });
    } catch {
      startTransition(() => {
        setErrorMessage(
          "Nao consegui recuperar o historico local deste navegador. Voce ainda pode continuar usando o app.",
        );
      });
    }

    hasLoadedStorage.current = true;
  }, [initialFriends, initialMeals, isLocalMode, storageNamespace]);

  useEffect(() => {
    if (!isLocalMode || !hasLoadedStorage.current) {
      return;
    }

    window.localStorage.setItem(
      getStorageKey(storageNamespace, "meals"),
      JSON.stringify(meals),
    );
  }, [isLocalMode, meals, storageNamespace]);

  useEffect(() => {
    if (!isLocalMode || !hasLoadedStorage.current) {
      return;
    }

    window.localStorage.setItem(
      getStorageKey(storageNamespace, "friends"),
      JSON.stringify(friends),
    );
  }, [friends, isLocalMode, storageNamespace]);

  const mealsForSelectedDate = meals
    .filter((meal) => meal.loggedDate === selectedDate)
    .sort((a, b) => b.eatenAt.localeCompare(a.eatenAt));

  const recentMeals = [...meals]
    .sort((a, b) =>
      `${b.loggedDate}${b.eatenAt}`.localeCompare(`${a.loggedDate}${a.eatenAt}`),
    )
    .slice(0, 6);

  const sharedMeals = [...meals]
    .filter((meal) => meal.shared)
    .sort((a, b) =>
      `${b.loggedDate}${b.eatenAt}`.localeCompare(`${a.loggedDate}${a.eatenAt}`),
    )
    .slice(0, 5);

  const totalCalories = mealsForSelectedDate.reduce(
    (sum, meal) => sum + meal.calories,
    0,
  );
  const averageCalories = mealsForSelectedDate.length
    ? Math.round(totalCalories / mealsForSelectedDate.length)
    : 0;
  const remainingCalories = calorieGoal ? calorieGoal - totalCalories : null;

  function clearFeedback() {
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setPreviewUrl("");
      setSelectedFile(null);
      setAnalysis(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Envie uma imagem valida para a refeicao.");
      event.target.value = "";
      return;
    }

    if (file.size > MEAL_IMAGE_MAX_BYTES) {
      setErrorMessage(
        `Use uma foto de ate ${Math.round(MEAL_IMAGE_MAX_BYTES / 1_000_000)} MB por refeicao.`,
      );
      event.target.value = "";
      return;
    }

    try {
      const nextPreviewUrl = await readFileAsDataUrl(file);
      setPreviewUrl(nextPreviewUrl);
      setSelectedFile(file);
      setAnalysis(null);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel carregar a imagem.",
      );
    }
  }

  async function createRemoteMeal(): Promise<MealEntry | null> {
    const payload = new FormData();
    payload.set("title", form.title.trim());
    payload.set("calories", form.calories);
    payload.set("loggedDate", selectedDate);
    payload.set("eatenAt", form.eatenAt || getCurrentTime());
    payload.set("notes", form.notes.trim());
    payload.set("shared", shareMeal && friends.length > 0 ? "true" : "false");

    if (selectedFile) {
      payload.set("image", selectedFile);
    }

    const response = await fetch("/api/meals", {
      body: payload,
      method: "POST",
    });

    const json = (await response.json()) as ErrorPayload | SuccessPayload<MealEntry>;

    if (!response.ok || !("data" in json)) {
      throw new Error(
        getErrorFromPayload(json) ?? "Nao foi possivel salvar a refeicao agora.",
      );
    }

    setSuccessMessage(
      json.message ??
        (json.data.shared
          ? "Refeicao registrada e compartilhada no seu circulo."
          : "Refeicao registrada com sucesso."),
    );

    return json.data;
  }

  function createLocalMeal(): MealEntry {
    return {
      calories: Math.round(Number(form.calories)),
      createdAt: new Date().toISOString(),
      eatenAt: form.eatenAt || getCurrentTime(),
      id: crypto.randomUUID(),
      imagePath: null,
      imageUrl: previewUrl,
      loggedDate: selectedDate,
      notes: form.notes.trim(),
      shared: shareMeal && friends.length > 0,
      title: form.title.trim(),
    };
  }

  async function handleMealSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedCalories = Number(form.calories);

    if (!form.title.trim()) {
      setErrorMessage("Diga o que voce comeu para registrar a refeicao.");
      return;
    }

    if (!Number.isFinite(parsedCalories) || parsedCalories <= 0) {
      setErrorMessage("Informe uma estimativa calorica valida para a refeicao.");
      return;
    }

    setIsSavingMeal(true);
    clearFeedback();

    try {
      const nextMeal = isLocalMode ? createLocalMeal() : await createRemoteMeal();

      if (!nextMeal) {
        throw new Error("Nao foi possivel registrar a refeicao.");
      }

      setMeals((currentMeals) => [nextMeal, ...currentMeals]);

      if (isLocalMode) {
        setSuccessMessage(
          nextMeal.shared
            ? "Refeicao registrada e adicionada ao seu circulo."
            : "Refeicao registrada com sucesso.",
        );
      }

      setForm(getDefaultFormState());
      setPreviewUrl("");
      setSelectedFile(null);
      setShareMeal(false);
      setAnalysis(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel salvar a refeicao.",
      );
    } finally {
      setIsSavingMeal(false);
    }
  }

  async function handleAnalyzePhoto() {
    if (!selectedFile) {
      setErrorMessage("Escolha uma foto antes de pedir a analise por IA.");
      return;
    }

    setIsAnalyzingPhoto(true);
    clearFeedback();

    try {
      const payload = new FormData();
      payload.set("image", selectedFile);

      if (form.title.trim()) {
        payload.set("titleHint", form.title.trim());
      }

      const response = await fetch("/api/meals/analyze", {
        body: payload,
        method: "POST",
      });

      const json = (await response.json()) as
        | ErrorPayload
        | SuccessPayload<MealAnalysis>;

      if (!response.ok || !("data" in json)) {
        throw new Error(
          getErrorFromPayload(json) ??
            "Nao foi possivel analisar essa foto agora.",
        );
      }

      setAnalysis(json.data);
      setForm((currentForm) => ({
        ...currentForm,
        calories: String(json.data.estimated_calories),
        notes: currentForm.notes.trim()
          ? currentForm.notes
          : json.data.notes_suggestion,
        title: json.data.title,
      }));
      setSuccessMessage(
        json.message ??
          "Foto analisada. Revise a estimativa e salve a refeicao.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel analisar essa foto.",
      );
    } finally {
      setIsAnalyzingPhoto(false);
    }
  }

  async function handleDeleteMeal(mealId: string) {
    clearFeedback();

    if (isLocalMode) {
      setMeals((currentMeals) => currentMeals.filter((meal) => meal.id !== mealId));
      setSuccessMessage("Refeicao removida.");
      return;
    }

    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: "DELETE",
      });

      const json = (await response.json()) as ErrorPayload | { message?: string };

      if (!response.ok) {
        throw new Error(getErrorFromPayload(json) ?? "Erro ao remover.");
      }

      setMeals((currentMeals) => currentMeals.filter((meal) => meal.id !== mealId));
      setSuccessMessage(getMessageFromPayload(json) ?? "Refeicao removida.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel remover a refeicao.",
      );
    }
  }

  async function handleAddFriend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = friendName.trim();

    if (!normalizedName) {
      setErrorMessage("Adicione pelo menos um nome para criar seu circulo.");
      return;
    }

    setIsSavingFriend(true);
    clearFeedback();

    try {
      if (isLocalMode) {
        const nextFriend: Friend = {
          createdAt: new Date().toISOString(),
          id: crypto.randomUUID(),
          name: normalizedName,
        };

        setFriends((currentFriends) => [nextFriend, ...currentFriends]);
        setSuccessMessage("Amigo adicionado ao seu circulo do FotoCal.");
      } else {
        const response = await fetch("/api/friends", {
          body: JSON.stringify({ name: normalizedName }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        });

        const json = (await response.json()) as ErrorPayload | SuccessPayload<Friend>;

        if (!response.ok || !("data" in json)) {
          throw new Error(
            getErrorFromPayload(json) ?? "Nao foi possivel adicionar o amigo.",
          );
        }

        setFriends((currentFriends) => [json.data, ...currentFriends]);
        setSuccessMessage(json.message ?? "Amigo adicionado ao seu circulo do FotoCal.");
      }

      setFriendName("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel adicionar o amigo.",
      );
    } finally {
      setIsSavingFriend(false);
    }
  }

  async function handleDeleteFriend(friendId: string) {
    clearFeedback();

    if (isLocalMode) {
      setFriends((currentFriends) =>
        currentFriends.filter((friend) => friend.id !== friendId),
      );
      setSuccessMessage("Amigo removido do circulo.");
      return;
    }

    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
      });

      const json = (await response.json()) as ErrorPayload | { message?: string };

      if (!response.ok) {
        throw new Error(getErrorFromPayload(json) ?? "Erro ao remover.");
      }

      setFriends((currentFriends) =>
        currentFriends.filter((friend) => friend.id !== friendId),
      );
      setSuccessMessage(getMessageFromPayload(json) ?? "Amigo removido do circulo.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel remover o amigo.",
      );
    }
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
              Rotina ativa
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
              Registre com foto ou manualmente, do jeito que for mais rapido.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62">
              O fluxo principal do FotoCal precisa ser leve: abrir, registrar,
              revisar e seguir o dia. A IA acelera esse caminho, mas o app nao
              depende dela para ser util.
            </p>
          </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200">
              {isLocalMode ? "Modo local ativo" : "Banco real ativo"}
            </span>
            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                isAiEnabled
                  ? "border border-white/12 bg-white/[0.05] text-white"
                  : "border border-amber-500/25 bg-amber-500/10 text-amber-100"
              }`}
            >
              {isAiEnabled ? "IA pronta para analisar foto" : "IA aguardando chave"}
            </span>
            <label className="grid gap-2 text-sm font-medium text-white/85">
              Dia analisado
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="rounded-2xl border border-white/12 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm font-medium text-white/55">Total do dia</p>
            <strong className="mt-3 block text-3xl tracking-tight text-white">
              {formatCalories(totalCalories)}
            </strong>
          </article>
          <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm font-medium text-white/55">Media por refeicao</p>
            <strong className="mt-3 block text-3xl tracking-tight text-white">
              {formatCalories(averageCalories)}
            </strong>
          </article>
          <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm font-medium text-white/55">Meta restante</p>
            <strong className="mt-3 block text-3xl tracking-tight text-white">
              {remainingCalories === null
                ? "Defina a meta"
                : formatCalories(remainingCalories)}
            </strong>
          </article>
          <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm font-medium text-white/55">Compartilhadas</p>
            <strong className="mt-3 block text-3xl tracking-tight text-white">
              {mealsForSelectedDate.filter((meal) => meal.shared).length}
            </strong>
          </article>
        </div>

        {statusMessage ? (
          <div className="mt-6 rounded-[1.5rem] border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm leading-7 text-amber-50">
            {statusMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-4 rounded-[1.5rem] border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm leading-7 text-rose-50">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-4 rounded-[1.5rem] border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm leading-7 text-emerald-50">
            {successMessage}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
            Nova refeicao
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
            Adicione uma refeicao agora
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/62">
            Envie uma foto para receber uma sugestao de nome e calorias ou
            preencha tudo por conta propria. O importante e registrar com
            consistencia.
          </p>

          <form className="mt-6 grid gap-5" onSubmit={handleMealSubmit}>
            <label className="grid gap-2 text-sm font-medium text-white/85">
              O que voce comeu
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    title: event.target.value,
                  }))
                }
                type="text"
                placeholder="Ex.: arroz, feijao e frango"
                className="rounded-2xl border border-white/12 bg-black/40 px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-500"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-white/85">
                Estimativa calorica
                <input
                  required
                  min="1"
                  step="1"
                  value={form.calories}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      calories: event.target.value,
                    }))
                  }
                  type="number"
                  placeholder="Ex.: 520"
                  className="rounded-2xl border border-white/12 bg-black/40 px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-500"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-white/85">
                Horario
                <input
                  value={form.eatenAt}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      eatenAt: event.target.value,
                    }))
                  }
                  type="time"
                  className="rounded-2xl border border-white/12 bg-black/40 px-4 py-3.5 text-white outline-none transition focus:border-emerald-500"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-white/85">
              Observacoes
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    notes: event.target.value,
                  }))
                }
                placeholder="Ex.: almoco com bastante salada, comi fora de casa..."
                className="rounded-2xl border border-white/12 bg-black/40 px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-500"
              />
            </label>

            <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <label className="grid gap-2 text-sm font-medium text-white/85">
                Foto da refeicao
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-4 text-sm text-white/62 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white"
                />
              </label>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white/85">Preview</p>
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview da refeicao"
                    width={720}
                    height={420}
                    unoptimized
                    className="mt-3 h-36 w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="mt-3 grid h-36 place-items-center rounded-2xl border border-dashed border-white/15 bg-black/40 text-sm text-white/45">
                    A foto aparece aqui antes do registro
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void handleAnalyzePhoto()}
                disabled={!selectedFile || isAnalyzingPhoto}
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAnalyzingPhoto
                  ? "Analisando foto..."
                  : "Analisar foto com IA"}
              </button>
              {!isAiEnabled ? (
                <span className="text-sm leading-7 text-white/45">
                  Adicione uma chave de IA ao ambiente para ativar a leitura
                  automatica da imagem.
                </span>
              ) : null}
            </div>

            {analysis ? (
              <div className="rounded-[1.5rem] border border-emerald-500/25 bg-emerald-500/10 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white">
                    Confianca {analysis.confidence}
                  </span>
                  {analysis.foods.map((food) => (
                    <span
                      key={food}
                      className="rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white/80"
                    >
                      {food}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-emerald-50/90">
                  {analysis.rationale}
                </p>
              </div>
            ) : null}

            <label className="flex items-start gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-white/72">
              <input
                type="checkbox"
                checked={shareMeal}
                disabled={friends.length === 0}
                onChange={(event) => setShareMeal(event.target.checked)}
                className="mt-1 h-4 w-4 accent-emerald-700"
              />
              <span>
                Compartilhar no meu circulo do FotoCal
                {friends.length === 0
                  ? " (adicione ao menos um amigo para liberar esta opcao)"
                  : ""}
              </span>
            </label>

            <button
              type="submit"
              disabled={isSavingMeal}
              className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingMeal ? "Salvando refeicao..." : "Registrar refeicao"}
            </button>
          </form>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
                Resumo do dia
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                {formatDateLabel(selectedDate)}
              </h3>
            </div>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200">
              {mealsForSelectedDate.length} refeicoes
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            {mealsForSelectedDate.length ? (
              mealsForSelectedDate.map((meal) => (
                <article
                  key={meal.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-white">
                        {meal.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-white/58">
                        {formatCalories(meal.calories)} • {meal.eatenAt}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteMeal(meal.id)}
                      className="rounded-full border border-white/12 px-3 py-1 text-xs font-semibold text-white/72 transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      Remover
                    </button>
                  </div>

                  {meal.imageUrl ? (
                    <Image
                      src={meal.imageUrl}
                      alt={meal.title}
                      width={720}
                      height={420}
                      unoptimized
                      className="mt-4 h-36 w-full rounded-2xl object-cover"
                    />
                  ) : null}

                  {meal.notes ? (
                    <p className="mt-4 text-sm leading-7 text-white/62">
                      {meal.notes}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-white/75">
                      {isLocalMode ? "Salvo neste navegador" : "Sincronizado"}
                    </span>
                    {meal.shared ? (
                      <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-medium text-emerald-200">
                        Compartilhada com amigos
                      </span>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="grid min-h-56 place-items-center rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.03] px-6 text-center text-sm leading-7 text-white/45">
                Nenhuma refeicao registrada neste dia ainda. Assim que voce
                salvar a primeira, o FotoCal ja calcula total e media.
              </div>
            )}
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
            Circulo opcional
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
            Adicione amigos para compartilhar sem virar rede social pesada.
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/62">
            O social entra como camada leve. Quem quiser usa sozinho; quem
            quiser compartilha algumas refeicoes e acompanha o proprio circulo.
          </p>

          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleAddFriend}>
            <input
              value={friendName}
              onChange={(event) => setFriendName(event.target.value)}
              type="text"
              placeholder="Nome do amigo"
              className="flex-1 rounded-full border border-white/12 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isSavingFriend}
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingFriend ? "Adicionando..." : "Adicionar amigo"}
            </button>
          </form>

          <div className="mt-6 grid gap-3">
            {friends.length ? (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{friend.name}</p>
                    <p className="text-sm text-white/45">
                      pronto para ver refeicoes compartilhadas
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDeleteFriend(friend.id)}
                    className="rounded-full border border-white/12 px-3 py-1 text-xs font-semibold text-white/72 transition hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    Remover
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.03] px-5 py-8 text-sm leading-7 text-white/45">
                Seu circulo ainda esta vazio. O produto funciona sozinho, mas
                esta camada social fica pronta assim que voce adicionar alguem.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
                Historico vivo
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                Refeicoes recentes e feed compartilhado
              </h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/75">
              {recentMeals.length} registros
            </span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="grid gap-3">
              <p className="text-sm font-semibold text-white">Ultimos registros</p>
              {recentMeals.length ? (
                recentMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="font-medium text-white">{meal.title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/55">
                      {formatDateTime(meal.loggedDate, meal.eatenAt)}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-emerald-200">
                      {formatCalories(meal.calories)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-white/12 bg-white/[0.03] px-4 py-8 text-sm leading-7 text-white/45">
                  Assim que voce salvar algumas refeicoes, o FotoCal comeca a
                  formar um historico util.
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <p className="text-sm font-semibold text-white">Compartilhadas no circulo</p>
              {sharedMeals.length ? (
                sharedMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="rounded-[1.25rem] border border-emerald-500/20 bg-emerald-500/10 p-4"
                  >
                    <p className="font-medium text-white">{meal.title}</p>
                    <p className="mt-1 text-sm leading-6 text-emerald-50/75">
                      {formatDateTime(meal.loggedDate, meal.eatenAt)}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-emerald-200">
                      {formatCalories(meal.calories)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-white/12 bg-white/[0.03] px-4 py-8 text-sm leading-7 text-white/45">
                  Nenhuma refeicao compartilhada ainda. Quando voce marcar uma
                  refeicao para o circulo, ela aparece aqui.
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
