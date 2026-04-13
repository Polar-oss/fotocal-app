export type ActionState = {
  message: string;
  status: "error" | "idle" | "success";
};

export const initialActionState: ActionState = {
  message: "",
  status: "idle",
};
