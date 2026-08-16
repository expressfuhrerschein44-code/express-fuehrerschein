export type MessagesPageStatus =
  | "ready"
  | "no_active_license_class";

export type MessageSenderView =
  | "client"
  | "support"
  | "system"
  | "other";

export type ConversationStatusView =
  | "open"
  | "in_progress"
  | "waiting_for_user"
  | "resolved"
  | "closed"
  | "other";

export interface MessageAttachmentView {
  documentId: string;
  title: string;
  originalFilename: string;
  mimeType: string;
}

export interface MessageView {
  id: string;
  senderType: MessageSenderView;
  rawSenderType: string;
  body: string | null;
  attachment: MessageAttachmentView | null;
  readAt: string | null;
  createdAt: string;
  isOwn: boolean;
}

export interface ConversationSummaryView {
  id: string;
  conversationType: string;
  subject: string;
  status: ConversationStatusView;
  rawStatus: string;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  unreadCount: number;
  closed: boolean;
}

export interface ConversationDetailView {
  id: string;
  conversationType: string;
  subject: string;
  status: ConversationStatusView;
  rawStatus: string;
  closed: boolean;
  createdAt: string;
  lastMessageAt: string;
  messages: MessageView[];
}

export interface MessagesPageData {
  status: MessagesPageStatus;
  licenseClassCode: string | null;
  locale: string;
  timezone: string;
  conversations: ConversationSummaryView[];
  selectedConversation: ConversationDetailView | null;
}

export interface CreateConversationInput {
  conversationType: string;
  subject: string;
  body: string;
}

export interface SendMessageInput {
  conversationId: string;
  body: string;
}
