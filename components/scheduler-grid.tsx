"use client"

import { useRef, useState } from "react"
import { Plus, Copy } from "lucide-react"
import type { Employee, Location, Shift } from "@/lib/types"
import { WEEKDAY_LABELS, formatDayNumber, formatTime, formatWeekRange, toISODate } from "@/lib/dates"

interface SchedulerGridProps {
  weekDays: Date[]
  employees: Employee[]
  locations: Location[]
  shifts: Shift[]
  onAddShift: (date: string) => void
  onEditShift: (shift: Shift) => void
  onDuplicateShift: (shift: Shift) => void
  onMoveShift: (shift: Shift, newDate: string) => void
}

export function SchedulerGrid({
  weekDays,
  employees,
  locations,
  shifts,
  onAddShift,
  onEditShift,
  onDuplicateShift,
  onMoveShift,
}: SchedulerGridProps) {
  const locationById = new Map(locations.map((l) => [l.id, l]))
  const employeeById = new Map(employees.map((e) => [e.id, e]))
  const today = toISODate(new Date())
  const [draggedShiftId, setDraggedShiftId] = useState<string | null>(null)
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const draggedShiftRef = useRef<Shift | null>(null)
  const suppressClickRef = useRef(false)

  function toMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  function shiftsOverlap(a: Shift, b: Shift): boolean {
    if (a.employee_id !== b.employee_id) return false
    const aStart = toMinutes(a.start_time)
    const aEnd = toMinutes(a.end_time)
    const bStart = toMinutes(b.start_time)
    const bEnd = toMinutes(b.end_time)

    const aDuration = aEnd >= aStart ? aEnd - aStart : 24 * 60 - aStart + aEnd
    const bDuration = bEnd >= bStart ? bEnd - bStart : 24 * 60 - bStart + bEnd

    const aEndAdjusted = aStart + aDuration
    const bEndAdjusted = bStart + bDuration

    return aStart < bEndAdjusted && bStart < aEndAdjusted
  }

  function shiftsForDay(iso: string): Shift[] {
    return shifts
      .filter((s) => s.shift_date === iso)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  function updateDragOver(event: React.PointerEvent<HTMLDivElement>) {
    const target = document.elementFromPoint(event.clientX, event.clientY)
    const dropTarget = target?.closest("[data-drop-date]") as HTMLElement | null
    setDragOverDate(dropTarget?.dataset.dropDate ?? null)
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>, shift: Shift) {
    if (event.button !== 0) return

    dragStartRef.current = { x: event.clientX, y: event.clientY }
    draggedShiftRef.current = shift
    suppressClickRef.current = false
    setDraggedShiftId(shift.id)
    setDragOffset(null)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragStartRef.current || !draggedShiftRef.current) return

    const deltaX = event.clientX - dragStartRef.current.x
    const deltaY = event.clientY - dragStartRef.current.y
    if (Math.hypot(deltaX, deltaY) > 6) {
      suppressClickRef.current = true
      setDragOffset({ x: deltaX, y: deltaY })
    }
    updateDragOver(event)
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const shift = draggedShiftRef.current
    const targetDate = dragOverDate

    if (shift && targetDate && shift.shift_date !== targetDate) {
      onMoveShift(shift, targetDate)
    }

    draggedShiftRef.current = null
    dragStartRef.current = null
    setDraggedShiftId(null)
    setDragOffset(null)
    setDragOverDate(null)
    suppressClickRef.current = false
  }

  function renderDayCard(day: Date, index: number, iso: string, dayShifts: Shift[]) {
    const conflictIds = new Set<string>()
    dayShifts.forEach((shift, shiftIndex) => {
      dayShifts.slice(shiftIndex + 1).forEach((candidate) => {
        if (shiftsOverlap(shift, candidate)) {
          conflictIds.add(shift.id)
          conflictIds.add(candidate.id)
        }
      })
    })
    const hasConflicts = conflictIds.size > 0
    const summaryLabel = `${dayShifts.length} turno${dayShifts.length === 1 ? "" : "s"}${hasConflicts ? ` • ${conflictIds.size} conflito${conflictIds.size === 1 ? "" : "s"}` : ""}`
    return (
      <div
        key={iso}
        data-drop-date={iso}
        className={`flex flex-col rounded-xl border bg-card transition-colors ${dragOverDate === iso ? "border-primary shadow-sm" : "border-border"}`}
      >
        <div className="flex items-center justify-between rounded-t-xl bg-secondary px-3 py-2 text-secondary-foreground">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide opacity-80">
              {WEEKDAY_LABELS[index]}
            </p>
            <p className="text-lg font-semibold leading-tight">{formatDayNumber(day)}</p>
            <p className={`text-[11px] ${hasConflicts ? "text-destructive" : "text-muted-foreground"}`}>
              {summaryLabel}
            </p>
          </div>
          <button
            onClick={() => onAddShift(iso)}
            aria-label={`Adicionar turno em ${WEEKDAY_LABELS[index]}`}
            className="rounded-md p-2 transition-colors hover:bg-foreground/10"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-2">
          {dayShifts.length === 0 ? (
            <button
              onClick={() => onAddShift(iso)}
              className="flex min-h-[96px] flex-1 items-center justify-center rounded-lg border border-dashed border-border py-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Adicionar turno
            </button>
          ) : (
            dayShifts.map((shift) => {
              const emp = employeeById.get(shift.employee_id)
              const loc = shift.location_id ? locationById.get(shift.location_id) : null
              const color = loc?.color ?? "#64748b"
              return (
                <div
                  key={shift.id}
                  onPointerDown={(event) => handlePointerDown(event, shift)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className={`group relative rounded-lg border-l-4 bg-secondary/60 p-2 text-left shadow-sm touch-none ${
                    conflictIds.has(shift.id) ? "ring-1 ring-destructive/40" : ""
                  } ${draggedShiftId === shift.id ? "opacity-70" : ""}`}
                  style={{
                    borderLeftColor: color,
                    transform: draggedShiftId === shift.id && dragOffset ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` : undefined,
                    zIndex: draggedShiftId === shift.id ? 50 : undefined,
                  }}
                >
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      if (!suppressClickRef.current) {
                        onEditShift(shift)
                      }
                    }}
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
                      <span className="mt-1 inline-block truncate text-xs font-medium" style={{ color }}>
                        {loc.name}
                      </span>
                    ) : null}
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      onDuplicateShift(shift)
                    }}
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
  }

  const mobileWeekDays = weekDays.slice(0, 7)

  return (
    <div className="overflow-hidden">
      <div className="flex gap-3 overflow-x-auto pb-2 md:hidden">
        {mobileWeekDays.map((day, index) => {
          const iso = toISODate(day)
          return (
            <div key={iso} className="min-w-[88vw] flex-shrink-0">
              {renderDayCard(day, index, iso, shiftsForDay(iso))}
            </div>
          )
        })}
      </div>

      <div className="hidden md:block">
        <div className="flex flex-col gap-6">
          {[weekDays.slice(0, 7), weekDays.slice(7)].map((weekGroup, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {groupIndex === 0 ? "Esta semana" : "Próxima semana"}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatWeekRange(weekGroup[0])}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
                {weekGroup.map((day, i) => {
                  const iso = toISODate(day)
                  const dayShifts = shiftsForDay(iso)
                  return renderDayCard(day, i, iso, dayShifts)
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
