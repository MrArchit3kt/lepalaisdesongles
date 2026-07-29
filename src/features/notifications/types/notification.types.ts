export type NotificationKind =
  | "APPOINTMENT_CREATED"
  | "APPOINTMENT_CONFIRMED"
  | "APPOINTMENT_REFUSED"
  | "APPOINTMENT_CANCELLED"
  | "APPOINTMENT_REMINDER"
  | "MESSAGE_RECEIVED"
  | "REVIEW_RECEIVED"
  | "REVIEW_REQUEST"
  | "PROMOTION"
  | "CONTEST"
  | "SYSTEM";

export type NotificationJsonPrimitive =
  | string
  | number
  | boolean
  | null;

export type NotificationJsonValue =
  | NotificationJsonPrimitive
  | NotificationJsonValue[]
  | {
      [key: string]: NotificationJsonValue;
    };

export type CreateNotificationInput = {
  userId: string;
  type: NotificationKind;
  title: string;
  message: string;
  actionUrl?: string | null;
  metadata?: NotificationJsonValue;
};

export type NotificationListInput = {
  userId: string;
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
};

export type NotificationListItem = {
  id: string;
  type: NotificationKind;
  title: string;
  message: string;
  actionUrl: string | null;
  metadata: NotificationJsonValue | null;
  readAt: Date | null;
  createdAt: Date;
  isRead: boolean;
};

export type NotificationListResult = {
  items: NotificationListItem[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
