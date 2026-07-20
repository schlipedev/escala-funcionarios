"use client"

import { Plus, Copy } from "lucide-react"
import type { Employee, Location, Shift } from "@/lib/types"
import { WEEKDAY_LABELS, formatDayNumber, formatTime, toISODate } from "@/lib/dates"

interface SchedulerGridProps {
  weekDays: Date[]
  employees: Employee[]
  locations: Location[]
  shifts: Shift[]
  onAddShift: (date: string) => void
  onEditShift: (shift: Shift) => void
  onDuplicateShift: (shift: Shift) => void
}

export function SchedulerGrid({
  weekDays,
  employees,
  locations,
  shifts,
  onAddShift,
  onEditShift,
  onDuplicateShift,
}: SchedulerGridProps) {
  const locationById = new Map(locations.map((l) => [l.id, l]))
  const employeeById = new Map(employees.map((e) => [e.id, e]))
  const today = toISODate(new Date())

  function shiftsForDay(iso: string): Shift[] {
    return shifts
      .filter((s) => s.shift_date === iso)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[900px] grid-cols-7 gap-3">
        {weekDays.map((day, i) => {
          const iso = toISODate(day)
          const dayShifts = shiftsForDay(iso)
          const isToday = iso === today
          return (
            <div
              key={iso}
              className={`flex flex-col rounded-xl border bg-card ${
                isToday ? "border-primary shadow-sm" : "border-border"
              }`}
            >
              <div
                className={`flex items-center justify-between rounded-t-xl px-3 py-2 ${
                  isToday ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                    {WEEKDAY_LABELS[i]}
                  </p>
                  <p className="text-lg font-semibold leading-tight">{formatDayNumber(day)}</p>
                </div>
                <button
                  onClick={() => onAddShift(iso)}
                  aria-label={`Adicionar turno em ${WEEKDAY_LABELS[i]}`}
                  className={`rounded-md p-1 transition-colors ${
                    isToday
                      ? "hover:bg-primary-foreground/20"
                      : "hover:bg-foreground/10"
                  }`}
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-2 p-2">
                {dayShifts.length === 0 ? (
                  <button
                    onClick={() => onAddShift(iso)}
                    className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border py-6 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    Adicionar
                  </button>
                ) : (
                  dayShifts.map((shift) => {
                    const emp = employeeById.get(shift.employee_id)
                    const loc = shift.location_id ? locationById.get(shift.location_id) : null
                    const color = loc?.color ?? "#64748b"
                    return (
                      <div
                        key={shift.id}
                        className="group relative rounded-lg border-l-4 bg-secondary/60 p-2 text-left"
                        style={{ borderLeftColor: color }}
                      >
                        <button
                          onClick={() => onEditShift(shift)}
                          className="block w-full text-left"
                          aria-label={`Editar turno de ${emp?.name ?? "funcionário"}`}
                        >
                          <p className="truncate text-sm font-medium text-foreground">
                            {emp?.name ?? "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(shift.start_time)} – {formatTime(shift.end_time)}
                          </p>
                          {loc ? (
                            <span className="mt-1 inline-block truncate text-xs" style={{ color }}>
                              {loc.name}
                            </span>
                          ) : null}
                        </button>
                        <button
                          onClick={() => onDuplicateShift(shift)}
                          aria-label="Duplicar turno"
                          className="absolute right-1 top-1 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-foreground/10 hover:text-foreground group-hover:opacity-100"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
