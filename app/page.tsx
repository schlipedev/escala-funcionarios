"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { CalendarDays, ChevronLeft, ChevronRight, CopyPlus, Settings, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SchedulerGrid } from "@/components/scheduler-grid"
import { ShiftDialog } from "@/components/shift-dialog"
import { ManageDialog } from "@/components/manage-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isSupabaseConfigured } from "@/lib/supabase"
import * as api from "@/lib/api"
import { WORK_LOCATIONS, type Employee, type Location, type Shift, type ShiftInput } from "@/lib/types"
import {
  addDays,
  addWeeks,
  formatWeekRange,
  getWeekDays,
  startOfWeek,
  toISODate,
} from "@/lib/dates"

export default function Page() {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()))
  const [locations, setLocations] = useState<Location[]>(WORK_LOCATIONS)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all")
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [shiftDialogOpen, setShiftDialogOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined)
  const [manageOpen, setManageOpen] = useState(false)

  const weekDays = useMemo(() => {
    const firstWeek = getWeekDays(weekStart)
    const secondWeek = getWeekDays(addWeeks(weekStart, 1))
    return [...firstWeek, ...secondWeek]
  }, [weekStart])
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])
  const selectedEmployee = employees.find((employee) => employee.id === selectedEmployeeId)
  const filteredShifts = useMemo(() => {
    let result = shifts
    if (selectedEmployeeId !== "all") {
      result = result.filter((shift) => shift.employee_id === selectedEmployeeId)
    }
    if (selectedLocationId !== "all") {
      result = result.filter((shift) => shift.location_id === selectedLocationId)
    }
    return result
  }, [selectedEmployeeId, selectedLocationId, shifts])

  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      setError("Supabase não configurado.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [emps, shs] = await Promise.all([
        api.fetchEmployees(),
        api.fetchShifts(toISODate(weekStart), toISODate(weekEnd)),
      ])
      setLocations(WORK_LOCATIONS)
      setEmployees(emps)
      setShifts(shs)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar dados.")
    } finally {
      setLoading(false)
    }
  }, [weekStart, weekEnd])

  useEffect(() => {
    loadData()
  }, [loadData])

  function openNewShift(date: string) {
    setEditingShift(null)
    setDefaultDate(date)
    setShiftDialogOpen(true)
  }

  function openEditShift(shift: Shift) {
    setEditingShift(shift)
    setDefaultDate(undefined)
    setShiftDialogOpen(true)
  }

  async function handleSaveShift(input: ShiftInput, id?: string) {
    if (id) {
      const updated = await api.updateShift(id, input)
      setShifts((prev) => prev.map((s) => (s.id === id ? updated : s)))
      toast.success("Turno atualizado.")
    } else {
      const created = await api.createShift(input)
      // Only add to state if it's within the visible week.
      if (created.shift_date >= toISODate(weekStart) && created.shift_date <= toISODate(weekEnd)) {
        setShifts((prev) => [...prev, created])
      }
      toast.success("Turno criado.")
    }
  }

  async function handleDeleteShift(id: string) {
    await api.deleteShift(id)
    setShifts((prev) => prev.filter((s) => s.id !== id))
    toast.success("Turno excluído.")
  }

  async function handleDuplicateShift(shift: Shift) {
    try {
      const [created] = await api.duplicateWeek([shift], 0)
      if (created) {
        setShifts((prev) => [...prev, created])
        toast.success("Turno duplicado.")
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao duplicar.")
    }
  }

  async function handleDuplicateWeek() {
    if (shifts.length === 0) {
      toast.info("Não há turnos nesta semana para duplicar.")
      return
    }
    try {
      await api.duplicateWeek(shifts, 7)
      toast.success("Semana duplicada para a próxima.")
      setWeekStart((prev) => addWeeks(prev, 1))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao duplicar semana.")
    }
  }

  // ----- Location handlers -----
  async function createLocation(input: { name: string; color: string }) {
    const l = await api.createLocation(input)
    setLocations((prev) => [...prev, l].sort((a, b) => a.name.localeCompare(b.name)))
    toast.success("Local criado.")
  }
  async function updateLocation(id: string, input: { name: string; color: string }) {
    const l = await api.updateLocation(id, input)
    setLocations((prev) => prev.map((x) => (x.id === id ? l : x)))
    toast.success("Local atualizado.")
  }
  async function deleteLocation(id: string) {
    await api.deleteLocation(id)
    setLocations((prev) => prev.filter((x) => x.id !== id))
    toast.success("Local excluído.")
  }

  // ----- Employee handlers -----
  async function createEmployee(input: { name: string; role: string | null }) {
    const e = await api.createEmployee(input)
    setEmployees((prev) => [...prev, e].sort((a, b) => a.name.localeCompare(b.name)))
    toast.success("Funcionário criado.")
  }
  async function updateEmployee(id: string, input: { name: string; role: string | null }) {
    const e = await api.updateEmployee(id, input)
    setEmployees((prev) => prev.map((x) => (x.id === id ? e : x)))
    toast.success("Funcionário atualizado.")
  }
  async function deleteEmployee(id: string) {
    await api.deleteEmployee(id)
    setEmployees((prev) => prev.filter((x) => x.id !== id))
    setShifts((prev) => prev.filter((s) => s.employee_id !== id))
    toast.success("Funcionário excluído.")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Escala de Funcionários</h1>
              <p className="text-sm text-muted-foreground">Planejamento semanal de turnos</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDuplicateWeek}>
              <CopyPlus className="size-4" />
              Duplicar semana
            </Button>
            <Button variant="outline" size="sm" onClick={() => setManageOpen(true)}>
              <Settings className="size-4" />
              Gerenciar
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setWeekStart((p) => addWeeks(p, -1))} aria-label="Semana anterior">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setWeekStart((p) => addWeeks(p, 1))} aria-label="Próxima semana">
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className="gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              Hoje
            </Button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-sm text-muted-foreground">Filtrar</label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="w-[220px]">
                <span>{selectedEmployee?.name ?? "Todos os funcionários"}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os funcionários</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
              <SelectTrigger className="w-[200px]">
                <span>{selectedLocationId === "all" ? "Todos os locais" : locations.find((item) => item.id === selectedLocationId)?.name ?? "Local"}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os locais</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm font-medium text-foreground sm:text-base">{formatWeekRange(weekStart)}</p>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            Carregando escala...
          </div>
        ) : employees.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum funcionário cadastrado. Comece adicionando funcionários e locais.
            </p>
            <Button className="mt-4" onClick={() => setManageOpen(true)}>
              <Settings className="size-4" />
              Gerenciar equipe
            </Button>
          </div>
        ) : (
          <SchedulerGrid
            weekDays={weekDays}
            employees={employees}
            locations={locations}
            shifts={filteredShifts}
            onAddShift={openNewShift}
            onEditShift={openEditShift}
            onDuplicateShift={handleDuplicateShift}
          />
        )}
      </main>

      <ShiftDialog
        open={shiftDialogOpen}
        onOpenChange={setShiftDialogOpen}
        employees={employees}
        locations={locations}
        shift={editingShift}
        defaultDate={defaultDate}
        onSave={handleSaveShift}
        onDelete={handleDeleteShift}
      />

      <ManageDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        locations={locations}
        employees={employees}
        onCreateLocation={createLocation}
        onUpdateLocation={updateLocation}
        onDeleteLocation={deleteLocation}
        onCreateEmployee={createEmployee}
        onUpdateEmployee={updateEmployee}
        onDeleteEmployee={deleteEmployee}
      />
    </div>
  )
}
