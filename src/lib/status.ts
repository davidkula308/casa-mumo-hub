import type { Database } from "@/integrations/supabase/types";

export type RoomStatus = Database["public"]["Enums"]["room_status"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type HousekeepingStatus = Database["public"]["Enums"]["housekeeping_status"];
export type TicketStatus = Database["public"]["Enums"]["ticket_status"];
export type TicketPriority = Database["public"]["Enums"]["ticket_priority"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export const roomStatusMeta: Record<RoomStatus, { label: string; dot: string; chip: string }> = {
  available: { label: "Available", dot: "bg-status-available", chip: "bg-status-available/15 text-status-available" },
  reserved: { label: "Reserved", dot: "bg-status-reserved", chip: "bg-status-reserved/15 text-status-reserved" },
  occupied: { label: "Occupied", dot: "bg-status-occupied", chip: "bg-status-occupied/15 text-status-occupied" },
  cleaning: { label: "Cleaning", dot: "bg-status-cleaning", chip: "bg-status-cleaning/15 text-status-cleaning" },
  maintenance: { label: "Maintenance", dot: "bg-status-maintenance", chip: "bg-status-maintenance/15 text-status-maintenance" },
  out_of_service: { label: "Out of service", dot: "bg-status-oos", chip: "bg-status-oos/15 text-status-oos" },
};

export const bookingStatusMeta: Record<BookingStatus, { label: string; chip: string }> = {
  pending: { label: "Pending", chip: "bg-gold/15 text-gold" },
  confirmed: { label: "Confirmed", chip: "bg-olive/15 text-olive" },
  checked_in: { label: "Checked in", chip: "bg-terra/15 text-terra-deep" },
  checked_out: { label: "Completed", chip: "bg-ink/10 text-ink/70" },
  cancelled: { label: "Cancelled", chip: "bg-destructive/10 text-destructive" },
  no_show: { label: "No-show", chip: "bg-status-oos/15 text-status-oos" },
};

export const housekeepingStatusMeta: Record<HousekeepingStatus, { label: string; chip: string; step: number }> = {
  dirty: { label: "Dirty", chip: "bg-status-maintenance/15 text-status-maintenance", step: 0 },
  assigned: { label: "Assigned", chip: "bg-status-reserved/15 text-status-reserved", step: 1 },
  in_progress: { label: "In progress", chip: "bg-status-cleaning/15 text-status-cleaning", step: 2 },
  inspected: { label: "Inspected", chip: "bg-olive/15 text-olive", step: 3 },
  ready: { label: "Ready", chip: "bg-status-available/15 text-status-available", step: 4 },
};

export const ticketStatusMeta: Record<TicketStatus, { label: string; chip: string }> = {
  open: { label: "Open", chip: "bg-status-maintenance/15 text-status-maintenance" },
  in_progress: { label: "In progress", chip: "bg-status-cleaning/15 text-status-cleaning" },
  resolved: { label: "Resolved", chip: "bg-status-available/15 text-status-available" },
  closed: { label: "Closed", chip: "bg-ink/10 text-ink/70" },
};

export const priorityMeta: Record<TicketPriority, { label: string; chip: string }> = {
  low: { label: "Low", chip: "bg-ink/10 text-ink/70" },
  medium: { label: "Medium", chip: "bg-gold/15 text-gold" },
  high: { label: "High", chip: "bg-status-maintenance/15 text-status-maintenance" },
  urgent: { label: "Urgent", chip: "bg-destructive text-destructive-foreground" },
};

export const paymentStatusMeta: Record<PaymentStatus, { label: string; chip: string }> = {
  pending: { label: "Pending", chip: "bg-gold/15 text-gold" },
  paid: { label: "Paid", chip: "bg-status-available/15 text-status-available" },
  failed: { label: "Failed", chip: "bg-destructive/10 text-destructive" },
  refunded: { label: "Refunded", chip: "bg-ink/10 text-ink/70" },
};

export const roleMeta: Record<AppRole, { label: string }> = {
  owner: { label: "Owner" },
  manager: { label: "Manager" },
  receptionist: { label: "Receptionist" },
  housekeeping: { label: "Housekeeping" },
  guest: { label: "Guest" },
};

export const checklistLabels: Record<string, string> = {
  bed_changed: "Bed changed",
  bathroom_cleaned: "Bathroom cleaned",
  towels_replaced: "Towels replaced",
  toiletries_replaced: "Toiletries replaced",
  floor_cleaned: "Floor cleaned",
  windows_checked: "Windows checked",
  damages_checked: "Damages checked",
};
