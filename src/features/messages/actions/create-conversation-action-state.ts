export type CreateConversationActionState = {
  status: "idle" | "success" | "error";
  message: string;
  conversationId?: string;
  fieldErrors?: {
    subject?: string[];
    appointmentId?: string[];
    initialMessage?: string[];
  };
};

export const initialCreateConversationActionState: CreateConversationActionState =
  {
    status: "idle",
    message: "",
  };
