export type AppointmentsPageStatus =
  | "ready"
  | "no_active_license_class";

export type AppointmentTypeView =
  | "driving_lesson"
  | "theory_exam"
  | "practical_exam"
  | "school"
  | "other";

export type AppointmentStatusView =
  | "requested"
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "other";

export interface AppointmentView {
  id: string;
  appointmentType: AppointmentTypeView;
  rawAppointmentType: string;
  title: string;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  status: AppointmentStatusView;
  rawStatus: string;
  notes: string | null;
  licenseClassCode: string | null;
}

export interface AppointmentsOverviewView {
  nextAppointment: AppointmentView | null;
  upcomingCount: number;
  confirmedCount: number;
  completedCount: number;
}

export interface AppointmentsPageData {
  status: AppointmentsPageStatus;
  licenseClassCode: string | null;
  timezone: string;
  locale: string;
  overview: AppointmentsOverviewView;
  upcoming: AppointmentView[];
  history: AppointmentView[];
}
