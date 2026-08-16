/**
 * Express-Führerschein
 * Shared view/API types for the administration Praxis module.
 *
 * These are application-layer types only.
 * They do not duplicate Prisma models.
 */

/* ==========================================================================
   STATUS
   ========================================================================== */

/**
 * Normalized statuses used by the Admin Praxis interface.
 *
 * Database workflow:
 *
 * requested
 *   -> scheduled
 *   -> confirmed
 *   -> completed
 *
 * Possible terminal states:
 * - cancelled
 * - other
 *
 * Note:
 * PostgreSQL currently stores "canceled" with one "l".
 * The application layer may normalize it to "cancelled"
 * for the Admin UI.
 */
export type AdminPraxisStatusView =
  | "requested"
  | "scheduled"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "other";


/* ==========================================================================
   CUSTOMER
   ========================================================================== */

export interface AdminPraxisCustomerView {
  id: string;

  firstName: string;

  lastName: string;

  fullName: string;

  email: string;

  phone: string;

  countryCode: string;
}


/* ==========================================================================
   LICENSE CLASS
   ========================================================================== */

export interface AdminPraxisLicenseClassView {
  id: string;

  code: string;

  status: string;

  isPrimary: boolean;
}


/* ==========================================================================
   ADMIN / MANAGER
   ========================================================================== */

export interface AdminPraxisManagerView {
  id: string;

  firstName: string;

  lastName: string;

  fullName: string;

  email: string;
}


/* ==========================================================================
   APPOINTMENT
   ========================================================================== */

export interface AdminPraxisAppointmentView {
  id: string;

  appointmentType: string;

  title: string;

  location: string | null;

  startsAt: string;

  endsAt: string | null;

  /**
   * Normalized Admin UI status.
   */
  status: AdminPraxisStatusView;

  /**
   * Exact value stored in PostgreSQL.
   *
   * Examples:
   * requested
   * scheduled
   * confirmed
   * completed
   * canceled
   */
  rawStatus: string;

  notes: string | null;

  adminNotes: string | null;

  confirmedAt: string | null;

  cancelledAt: string | null;

  createdAt: string;

  updatedAt: string;

  customer: AdminPraxisCustomerView;

  licenseClass: AdminPraxisLicenseClassView | null;

  managedBy: AdminPraxisManagerView | null;
}


/* ==========================================================================
   TIMELINE
   ========================================================================== */

export interface AdminPraxisTimelineItem {
  id: string;

  type:
    | "created"
    | "updated"
    | "confirmed"
    | "cancelled";

  title: string;

  description: string | null;

  occurredAt: string;
}


/* ==========================================================================
   APPOINTMENT DETAIL
   ========================================================================== */

export interface AdminPraxisAppointmentDetailView
  extends AdminPraxisAppointmentView {
  timeline: AdminPraxisTimelineItem[];

  capabilities: {
    canEdit: boolean;

    canConfirm: boolean;

    canCancel: boolean;
  };
}


/* ==========================================================================
   CLIENT OPTION
   ========================================================================== */

export interface AdminPraxisClientOption {
  userId: string;

  firstName: string;

  lastName: string;

  fullName: string;

  email: string;

  phone: string;

  countryCode: string;

  licenseClasses: AdminPraxisLicenseClassView[];
}


/* ==========================================================================
   STATISTICS
   ========================================================================== */

/**
 * Existing statistics contract is deliberately preserved.
 *
 * We do not add a mandatory "requested" property here yet,
 * because the current server service already builds this object.
 * Adding a required property before updating that service would
 * create a TypeScript regression.
 */
export interface AdminPraxisStatsView {
  total: number;

  today: number;

  scheduled: number;

  confirmed: number;

  cancelled: number;
}


/* ==========================================================================
   PAGE DATA
   ========================================================================== */

export interface AdminPraxisPageData {
  appointments: AdminPraxisAppointmentView[];

  clients: AdminPraxisClientOption[];

  stats: AdminPraxisStatsView;

  generatedAt: string;
}


/* ==========================================================================
   FILTERS
   ========================================================================== */

export interface AdminPraxisFilters {
  search: string;

  /**
   * "requested" is now automatically accepted here because
   * it belongs to AdminPraxisStatusView.
   */
  status:
    | "all"
    | AdminPraxisStatusView;

  licenseClass: string;

  period:
    | "all"
    | "today"
    | "upcoming"
    | "past";
}


/* ==========================================================================
   CREATE
   ========================================================================== */

export interface AdminPraxisCreateInput {
  userId: string;

  userLicenseClassId: string | null;

  title: string;

  location: string | null;

  startsAt: string;

  endsAt: string | null;

  notes: string | null;

  adminNotes: string | null;
}


/* ==========================================================================
   UPDATE
   ========================================================================== */

export interface AdminPraxisUpdateInput {
  title: string;

  location: string | null;

  userLicenseClassId: string | null;

  startsAt: string;

  endsAt: string | null;

  notes: string | null;

  adminNotes: string | null;
}


/* ==========================================================================
   MUTATIONS
   ========================================================================== */

export type AdminPraxisMutationInput =
  | {
      action: "update";

      data: AdminPraxisUpdateInput;
    }
  | {
      action: "confirm";
    }
  | {
      action: "cancel";

      reason?: string | null;
    };


/* ==========================================================================
   API RESPONSE
   ========================================================================== */

export interface AdminPraxisApiSuccess<T> {
  ok: true;

  data: T;
}

export interface AdminPraxisApiError {
  ok: false;

  code: string;

  message: string;

  fields?: Record<
    string,
    string
  >;
}

export type AdminPraxisApiResponse<T> =
  | AdminPraxisApiSuccess<T>
  | AdminPraxisApiError;