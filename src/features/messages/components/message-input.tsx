"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  ImagePlus,
  LoaderCircle,
  Paperclip,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { sendMessageAction } from "@/features/messages/actions/send-message.action";
import { initialSendMessageActionState } from "@/features/messages/actions/send-message-action-state";
import type { MessageAttachmentInput } from "@/features/messages/schemas/create-message.schema";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

const MAX_MESSAGE_LENGTH = 5_000;
const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type PendingAttachment = MessageAttachmentInput & {
  key?: string;
  previewUrl: string;
};

export type MessageInputProps = {
  conversationId: string;
  disabled?: boolean;
  isConversationClosed?: boolean;
  allowImageUploads?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onMessageSent?: (messageId: string) => void;
};

function formatFileSize(sizeBytes?: number): string {
  if (
    typeof sizeBytes !== "number" ||
    !Number.isFinite(sizeBytes) ||
    sizeBytes <= 0
  ) {
    return "";
  }

  if (sizeBytes < 1_024) {
    return `${sizeBytes} o`;
  }

  if (sizeBytes < 1_024 * 1_024) {
    return `${Math.round(sizeBytes / 1_024)} Ko`;
  }

  return `${(sizeBytes / (1_024 * 1_024)).toFixed(1)} Mo`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Une erreur est survenue pendant l’envoi des images.";
}

function resizeTextarea(textarea: HTMLTextAreaElement | null): void {
  if (!textarea) {
    return;
  }

  textarea.style.height = "0px";

  const nextHeight = Math.min(Math.max(textarea.scrollHeight, 48), 176);

  textarea.style.height = `${nextHeight}px`;
}

function revokeAttachmentPreview(attachment: PendingAttachment): void {
  if (attachment.previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(attachment.previewUrl);
  }
}

export function MessageInput({
  conversationId,
  disabled = false,
  isConversationClosed = false,
  allowImageUploads = false,
  placeholder = "Écrivez votre message…",
  className,
  autoFocus = false,
  onMessageSent,
}: MessageInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef<PendingAttachment[]>([]);
  const lastHandledMessageIdRef = useRef<string | null>(null);

  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [state, formAction, isSending] = useActionState(
    sendMessageAction,
    initialSendMessageActionState,
  );

  const { startUpload, isUploading } = useUploadThing(
    "appointmentInspirations",
  );

  const isUnavailable =
    disabled || isConversationClosed || isSending || isUploading;

  const trimmedContent = content.trim();

  const serializedAttachments = useMemo(
    () =>
      JSON.stringify(
        attachments.map(({ url, fileName, mimeType, sizeBytes }) => ({
          url,
          fileName,
          mimeType,
          sizeBytes,
        })),
      ),
    [attachments],
  );

  const canSubmit =
    !isUnavailable &&
    conversationId.trim().length > 0 &&
    (trimmedContent.length > 0 || attachments.length > 0) &&
    content.length <= MAX_MESSAGE_LENGTH;

  const messageType = attachments.length > 0 ? "IMAGE" : "TEXT";

  const remainingCharacters = MAX_MESSAGE_LENGTH - content.length;

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    resizeTextarea(textareaRef.current);
  }, [content]);

  useEffect(() => {
    if (!autoFocus || isUnavailable) {
      return;
    }

    textareaRef.current?.focus();
  }, [autoFocus, isUnavailable]);

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach(revokeAttachmentPreview);
    };
  }, []);

  useEffect(() => {
    if (
      state.status !== "success" ||
      !state.messageId ||
      lastHandledMessageIdRef.current === state.messageId
    ) {
      return;
    }

    lastHandledMessageIdRef.current = state.messageId;

    attachmentsRef.current.forEach(revokeAttachmentPreview);
    attachmentsRef.current = [];

    setContent("");
    setAttachments([]);
    setUploadError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast.success(state.message || "Message envoyé.");

    onMessageSent?.(state.messageId);

    window.requestAnimationFrame(() => {
      resizeTextarea(textareaRef.current);
      textareaRef.current?.focus();
    });
  }, [onMessageSent, state.message, state.messageId, state.status]);

  useEffect(() => {
    if (state.status !== "error" || !state.message) {
      return;
    }

    toast.error(state.message);
  }, [state.message, state.status]);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((currentAttachments) => {
      const attachment = currentAttachments[index];

      if (attachment) {
        revokeAttachmentPreview(attachment);
      }

      return currentAttachments.filter(
        (_, attachmentIndex) => attachmentIndex !== index,
      );
    });

    setUploadError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments((currentAttachments) => {
      currentAttachments.forEach(revokeAttachmentPreview);

      return [];
    });

    setUploadError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const validateFiles = useCallback(
    (files: File[]): string | null => {
      if (attachments.length + files.length > MAX_ATTACHMENTS) {
        return `Vous pouvez joindre jusqu’à ${MAX_ATTACHMENTS} images par message.`;
      }

      for (const file of files) {
        if (!ACCEPTED_IMAGE_TYPES.has(file.type.toLowerCase())) {
          return "Seules les images JPEG, PNG et WEBP sont acceptées.";
        }

        if (file.size <= 0) {
          return `Le fichier « ${file.name} » est vide.`;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          return `Le fichier « ${file.name} » dépasse la limite de 8 Mo.`;
        }
      }

      return null;
    },
    [attachments.length],
  );

  const handleFileSelection = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      const selectedFiles = Array.from(input.files ?? []);

      input.value = "";

      if (!allowImageUploads || selectedFiles.length === 0) {
        return;
      }

      const validationError = validateFiles(selectedFiles);

      if (validationError) {
        setUploadError(validationError);
        toast.error(validationError);
        return;
      }

      setUploadError(null);

      try {
        const uploadedFiles = await startUpload(selectedFiles);

        if (!uploadedFiles || uploadedFiles.length === 0) {
          throw new Error(
            "Aucune image n’a été retournée après le téléversement.",
          );
        }

        const uploadedAttachments: PendingAttachment[] = uploadedFiles.map(
          (uploadedFile, index) => {
            const serverData = uploadedFile.serverData;
            const originalFile = selectedFiles[index];

            const url = serverData?.url ?? uploadedFile.ufsUrl;

            if (!url) {
              throw new Error(
                "Une image téléversée ne possède pas d’adresse valide.",
              );
            }

            return {
              url,
              fileName:
                serverData?.fileName ?? originalFile?.name ?? uploadedFile.name,
              mimeType: serverData?.mimeType ?? originalFile?.type ?? undefined,
              sizeBytes:
                serverData?.sizeBytes ?? originalFile?.size ?? undefined,
              key: serverData?.key ?? uploadedFile.key,
              previewUrl: url,
            };
          },
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...uploadedAttachments,
        ]);

        toast.success(
          uploadedAttachments.length > 1
            ? `${uploadedAttachments.length} images ajoutées.`
            : "Image ajoutée.",
        );

        window.requestAnimationFrame(() => {
          textareaRef.current?.focus();
        });
      } catch (error) {
        const message = getErrorMessage(error);

        setUploadError(message);
        toast.error(message);
      }
    },
    [allowImageUploads, startUpload, validateFiles],
  );

  const openFilePicker = useCallback(() => {
    if (
      !allowImageUploads ||
      isUnavailable ||
      attachments.length >= MAX_ATTACHMENTS
    ) {
      return;
    }

    fileInputRef.current?.click();
  }, [allowImageUploads, attachments.length, isUnavailable]);

  const submitForm = useCallback(() => {
    if (!canSubmit) {
      return;
    }

    formRef.current?.requestSubmit();
  }, [canSubmit]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    submitForm();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    if (!canSubmit) {
      event.preventDefault();

      if (trimmedContent.length === 0 && attachments.length === 0) {
        textareaRef.current?.focus();
      }
    }
  };

  if (isConversationClosed) {
    return (
      <div
        className={cn(
          "border-t border-[#241A1D]/10 bg-[#FFF9F8] p-4",
          className,
        )}
      >
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />

          <div>
            <p className="text-sm font-semibold">
              Cette conversation est fermée
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-800">
              Aucun nouveau message ne peut être envoyé dans cette conversation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      className={cn(
        "border-t border-[#241A1D]/10 bg-white p-3 sm:p-4",
        className,
      )}
      noValidate
    >
      <input type="hidden" name="conversationId" value={conversationId} />

      <input type="hidden" name="type" value={messageType} />

      <input type="hidden" name="attachments" value={serializedAttachments} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelection}
        disabled={
          !allowImageUploads ||
          isUnavailable ||
          attachments.length >= MAX_ATTACHMENTS
        }
        className="sr-only"
        aria-label="Ajouter des images au message"
      />

      {attachments.length > 0 ? (
        <div className="mb-3 rounded-2xl border border-[#241A1D]/10 bg-[#FFF9F8] p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#241A1D]">
                Images jointes
              </p>

              <p className="mt-0.5 text-xs text-[#927E85]">
                {attachments.length} sur {MAX_ATTACHMENTS}
              </p>
            </div>

            <button
              type="button"
              onClick={clearAttachments}
              disabled={isUnavailable}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Tout retirer
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {attachments.map((attachment, index) => (
              <div
                key={`${attachment.url}-${index}`}
                className="group relative w-24 shrink-0"
              >
                <div className="aspect-square overflow-hidden rounded-xl border border-[#241A1D]/10 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachment.previewUrl}
                    alt={
                      attachment.fileName
                        ? `Aperçu de ${attachment.fileName}`
                        : "Aperçu de l’image jointe"
                    }
                    className="size-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  disabled={isUnavailable}
                  className="absolute -right-2 -top-2 inline-flex size-7 items-center justify-center rounded-full border border-white bg-[#241A1D] text-white shadow-md transition hover:scale-105 hover:bg-red-600 disabled:pointer-events-none disabled:opacity-50"
                  aria-label={`Retirer l’image ${index + 1}`}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>

                <p
                  className="mt-1.5 truncate text-[11px] font-medium text-[#75636A]"
                  title={attachment.fileName ?? undefined}
                >
                  {attachment.fileName || `Image ${index + 1}`}
                </p>

                {attachment.sizeBytes ? (
                  <p className="text-[10px] text-[#A08E94]">
                    {formatFileSize(attachment.sizeBytes)}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {uploadError ? (
        <div
          role="alert"
          className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />

          <span>{uploadError}</span>
        </div>
      ) : null}

      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />

          <span>{state.message}</span>
        </div>
      ) : null}

      <div
        className={cn(
          "rounded-[24px] border bg-[#FFF9F8] p-2 shadow-sm transition",
          "focus-within:border-[#B8899A]/60 focus-within:ring-4 focus-within:ring-[#B8899A]/10",
          state.fieldErrors?.content ? "border-red-300" : "border-[#241A1D]/10",
        )}
      >
        <textarea
          ref={textareaRef}
          name="content"
          value={content}
          onChange={(event) => {
            setContent(event.currentTarget.value);
            resizeTextarea(event.currentTarget);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isUnavailable}
          autoFocus={autoFocus}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={1}
          className={cn(
            "block min-h-12 max-h-44 w-full resize-none overflow-y-auto bg-transparent px-3 py-3",
            "text-sm leading-6 text-[#241A1D] outline-none placeholder:text-[#A08E94]",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
          aria-label="Votre message"
          aria-describedby="message-input-help"
          aria-invalid={Boolean(state.fieldErrors?.content)}
        />

        <div className="flex items-end justify-between gap-2 px-1 pb-1">
          <div className="flex min-w-0 items-center gap-1">
            {allowImageUploads ? (
              <button
                type="button"
                onClick={openFilePicker}
                disabled={
                  isUnavailable || attachments.length >= MAX_ATTACHMENTS
                }
                className={cn(
                  "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-[#75636A] transition",
                  "hover:bg-white hover:text-[#241A1D] hover:shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8899A]",
                  "disabled:pointer-events-none disabled:opacity-40",
                )}
                aria-label="Ajouter des images"
                title="Ajouter des images JPEG, PNG ou WEBP"
              >
                {isUploading ? (
                  <LoaderCircle
                    className="size-5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <ImagePlus className="size-5" aria-hidden="true" />
                )}
              </button>
            ) : (
              <span
                className="inline-flex size-10 shrink-0 items-center justify-center text-[#B8A9AE]"
                title="Les pièces jointes ne sont pas disponibles ici"
              >
                <Paperclip className="size-5" aria-hidden="true" />
              </span>
            )}

            <div
              id="message-input-help"
              className="hidden min-w-0 text-[11px] leading-4 text-[#927E85] sm:block"
            >
              <p>Entrée pour envoyer</p>
              <p>Maj + Entrée pour une nouvelle ligne</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "hidden text-[11px] tabular-nums sm:inline",
                remainingCharacters < 0
                  ? "font-semibold text-red-600"
                  : remainingCharacters <= 250
                    ? "font-semibold text-amber-600"
                    : "text-[#A08E94]",
              )}
            >
              {content.length}/{MAX_MESSAGE_LENGTH}
            </span>

            <Button
              type="submit"
              size="sm"
              disabled={!canSubmit}
              isLoading={isSending}
              className="size-10 px-0 sm:w-auto sm:px-4"
              aria-label="Envoyer le message"
            >
              {!isSending ? (
                <>
                  <Send className="size-4" aria-hidden="true" />

                  <span className="hidden sm:inline">Envoyer</span>
                </>
              ) : null}
            </Button>
          </div>
        </div>
      </div>

      {state.fieldErrors?.content?.length ? (
        <p className="mt-2 flex items-start gap-1.5 px-2 text-xs leading-5 text-red-600">
          <AlertCircle
            className="mt-0.5 size-3.5 shrink-0"
            aria-hidden="true"
          />

          <span>{state.fieldErrors.content[0]}</span>
        </p>
      ) : null}

      {state.fieldErrors?.attachments?.length ? (
        <p className="mt-2 flex items-start gap-1.5 px-2 text-xs leading-5 text-red-600">
          <AlertCircle
            className="mt-0.5 size-3.5 shrink-0"
            aria-hidden="true"
          />

          <span>{state.fieldErrors.attachments[0]}</span>
        </p>
      ) : null}

      {isUploading ? (
        <p
          className="mt-2 flex items-center gap-2 px-2 text-xs text-[#75636A]"
          aria-live="polite"
        >
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
          Téléversement des images en cours…
        </p>
      ) : null}
    </form>
  );
}
