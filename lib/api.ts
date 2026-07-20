import { getSupabase } from "./supabase"
import type { Employee, Location, Shift, ShiftInput } from "./types"

// ---------- Locations ----------

export async function fetchLocations(): Promise<Location[]> {
  const { data, error } = await getSupabase().from("locations").select("*").order("name")
  if (error) throw error
  return data ?? []
}

export async function createLocation(input: { name: string; color: string }): Promise<Location> {
  const { data, error } = await getSupabase().from("locations").insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateLocation(id: string, input: { name: string; color: string }): Promise<Location> {
  const { data, error } = await getSupabase().from("locations").update(input).eq("id", id).select().single()
  if (error) throw error
  return data
}

export async function deleteLocation(id: string): Promise<void> {
  const { error } = await getSupabase().from("locations").delete().eq("id", id)
  if (error) throw error
}

// ---------- Employees ----------

export async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await getSupabase().from("employees").select("*").order("name")
  if (error) throw error
  return data ?? []
}

export async function createEmployee(input: { name: string; role: string | null }): Promise<Employee> {
  const { data, error } = await getSupabase().from("employees").insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateEmployee(id: string, input: { name: string; role: string | null }): Promise<Employee> {
  const { data, error } = await getSupabase().from("employees").update(input).eq("id", id).select().single()
  if (error) throw error
  return data
}

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await getSupabase().from("employees").delete().eq("id", id)
  if (error) throw error
}

// ---------- Shifts ----------

export async function fetchShifts(fromDate: string, toDate: string): Promise<Shift[]> {
  const { data, error } = await getSupabase()
    .from("shifts")
    .select("*")
    .gte("shift_date", fromDate)
    .lte("shift_date", toDate)
    .order("start_time")
  if (error) throw error
  return data ?? []
}

export async function createShift(input: ShiftInput): Promise<Shift> {
  const { data, error } = await getSupabase().from("shifts").insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateShift(id: string, input: ShiftInput): Promise<Shift> {
  const { data, error } = await getSupabase().from("shifts").update(input).eq("id", id).select().single()
  if (error) throw error
  return data
}

export async function deleteShift(id: string): Promise<void> {
  const { error } = await getSupabase().from("shifts").delete().eq("id", id)
  if (error) throw error
}

/** Duplicates all shifts from one week into another (by day offset). */
export async function duplicateWeek(shifts: Shift[], dayOffset: number): Promise<Shift[]> {
  if (shifts.length === 0) return []
  const rows: ShiftInput[] = shifts.map((s) => {
    const d = new Date(s.shift_date + "T00:00:00")
    d.setDate(d.getDate() + dayOffset)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return {
      employee_id: s.employee_id,
      location_id: s.location_id,
      shift_date: `${y}-${m}-${day}`,
      start_time: s.start_time,
      end_time: s.end_time,
      notes: s.notes,
    }
  })
  const { data, error } = await getSupabase().from("shifts").insert(rows).select()
  if (error) throw error
  return data ?? []
}
