export type PraxisAppointmentStatus =
  | "requested"
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface PraxisAppointmentView {
  id: string;
  licenseClassCode: string;
  title: string;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  status: PraxisAppointmentStatus;
  notes: string | null;
  createdAt: string;
}

export interface PraxisOverviewView {
  totalLessons: number;
  completedLessons: number;
  openRequests: number;
  nextAppointment: PraxisAppointmentView | null;
}

export interface PraxisPageData {
  licenseClassCode: string | null;
  timezone: string;
  canRequestLesson: boolean;
  overview: PraxisOverviewView;
  appointments: PraxisAppointmentView[];
}

export interface CreatePraxisLessonRequestInput {
  date: string;
  time: string;
  location: string;
  note: string;
}

export type PraxisAdminAction =
  | "confirm"
  | "cancel";

export interface PraxisAdminRequestView
  extends PraxisAppointmentView {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  timezone: string;
}

export interface PraxisAdminOverviewView {
  requested: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  total: number;
}

export interface PraxisAdminPageData {
  overview: PraxisAdminOverviewView;
  requests: PraxisAdminRequestView[];
}

export interface PraxisApiError {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

export interface PraxisApiSuccess<T> {
  ok: true;
  data: T;
}

export type PraxisApiResponse<T> =
  | PraxisApiSuccess<T>
  | PraxisApiError;
