export type AdminRole =
  | "super_admin"
  | "admin"
  | (string & {});

export interface AdminIdentity {
  id: string;
  role: AdminRole;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AdminSessionView {
  sessionId: string;
  expiresAt: Date;
  admin: AdminIdentity;
}

export interface AdminLoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
  ipHash?: string | null;
  userAgent?: string | null;
}

export interface AdminLoginResult {
  token: string;
  expiresAt: Date;
  admin: AdminIdentity;
}

export interface AdminDashboardData {
  stats: {
    users: number;
    submittedApplications: number;
    paymentsToReview: number;
    documentsToReview: number;
    openConversations: number;
    upcomingAppointments: number;
    openTheoryReports: number;
    unreadAdminNotifications: number;
  };
  recentAudit: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    createdAt: Date;
  }>;
}
