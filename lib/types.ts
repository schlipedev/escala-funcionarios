export interface Location {
  id: string
  name: string
  color: string
  created_at: string
}

export interface Employee {
  id: string
  name: string
  role: string | null
  created_at: string
}

export interface Shift {
  id: string
  employee_id: string
  location_id: string | null
  shift_date: string // YYYY-MM-DD
  start_time: string // HH:MM:SS
  end_time: string // HH:MM:SS
  notes: string | null
  created_at: string
}

export type ShiftInput = Omit<Shift, "id" | "created_at">

export const WORK_LOCATIONS: Location[] = [
  { id: "00000000-0000-0000-0000-000000000001", name: "Avenida Café", color: "#2563eb", created_at: "" },
  { id: "00000000-0000-0000-0000-000000000002", name: "Café Vigia", color: "#16a34a", created_at: "" },
  { id: "00000000-0000-0000-0000-000000000003", name: "Santy Parque", color: "#ea580c", created_at: "" },
  { id: "00000000-0000-0000-0000-000000000004", name: "O Meu Café", color: "#9333ea", created_at: "" },
]
