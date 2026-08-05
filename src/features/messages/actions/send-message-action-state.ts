export type SendMessageActionState = {
  status: "idle" | "success" | "error";
  message: string;
  messageId?: string;
  conversationId?: string;
  fieldErrors?: {
    conversationId?: string[];
    content?: string[];
    type?: string[];
    attachments?: string[];
  };
};

export const initialSendMessageActionState: SendMessageActionState = {
  status: "idle",
  message: "",
};
