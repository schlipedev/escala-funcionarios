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
