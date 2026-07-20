export const WEEKDAY_LABELS = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
] as const

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Formats a Date as a local YYYY-MM-DD string (no timezone shift). */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Parses a YYYY-MM-DD string into a local Date. */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

/** Returns the Monday (start) of the week containing the given date. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay() // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day // shift back to Monday
  d.setDate(d.getDate() + diff)
  return d
}

/** Returns an array of 7 Date objects (Mon..Sun) starting from weekStart. */
export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * MS_PER_DAY))
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY)
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7)
}

/** Formats a week range like "13 – 19 de jan de 2025". */
export function formatWeekRange(weekStart: Date): string {
  const end = addDays(weekStart, 6)
  const startStr = weekStart.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
  const endStr = end.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })
  return `${startStr} – ${endStr}`
}

/** Formats "08:00:00" -> "08:00". */
export function formatTime(time: string): string {
  return time.slice(0, 5)
}

/** Formats a short day label, e.g. "13". */
export function formatDayNumber(date: Date): string {
  return String(date.getDate())
}
