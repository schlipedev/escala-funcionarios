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
  { id: "avenida-cafe", name: "Avenida Café", color: "#2563eb", created_at: "" },
  { id: "cafe-vigia", name: "Café Vigia", color: "#16a34a", created_at: "" },
  { id: "santy-parque", name: "Santy Parque", color: "#ea580c", created_at: "" },
  { id: "o-meu-cafe", name: "O Meu Café", color: "#9333ea", created_at: "" },
]
