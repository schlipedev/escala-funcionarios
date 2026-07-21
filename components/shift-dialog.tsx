"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const QUICK_TIME_OPTIONS = [
  { label: "Turno Manhã", start: "08:00", end: "16:00" },
  { label: "Turno Tarde", start: "12:00", end: "20:00" },
]
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Employee, Location, Shift, ShiftInput } from "@/lib/types"
import { toISODate } from "@/lib/dates"

interface ShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: Employee[]
  locations: Location[]
  /** The shift being edited, or null when creating. */
  shift: Shift | null
  /** Pre-filled date (YYYY-MM-DD) when creating from a cell. */
  defaultDate?: string
  onSave: (input: ShiftInput, id?: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export function ShiftDialog({
  open,
  onOpenChange,
  employees,
  locations,
  shift,
  defaultDate,
  onSave,
  onDelete,
}: ShiftDialogProps) {
  const [employeeId, setEmployeeId] = useState("")
  const [locationId, setLocationId] = useState<string>("none")
  const [date, setDate] = useState("")
  const selectedEmployee = employees.find((employee) => employee.id === employeeId)
  const selectedLocation = locations.find((location) => location.id === locationId)
  const [displayEmployeeName, setDisplayEmployeeName] = useState("Selecione")
  const [displayLocationName, setDisplayLocationName] = useState("Sem local")
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("16:00")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createAnother, setCreateAnother] = useState(false)

  useEffect(() => {
    if (!open) return
    if (shift) {
      setEmployeeId(shift.employee_id)
      setLocationId(shift.location_id ?? "none")
      setDate(shift.shift_date)
      setStartTime(shift.start_time.slice(0, 5))
      setEndTime(shift.end_time.slice(0, 5))
      setNotes(shift.notes ?? "")
      setDisplayEmployeeName(employees.find((employee) => employee.id === shift.employee_id)?.name ?? "Selecione")
      setDisplayLocationName(locations.find((location) => location.id === shift.location_id)?.name ?? "Sem local")
    } else {
      setEmployeeId(employees[0]?.id ?? "")
      setLocationId(locations[0]?.id ?? "none")
      setDate(defaultDate ?? toISODate(new Date()))
      setStartTime("08:00")
      setEndTime("16:00")
      setNotes("")
      setDisplayEmployeeName(employees[0]?.name ?? "Selecione")
      setDisplayLocationName(locations[0]?.name ?? "Sem local")
    }
    setError(null)
  }, [open, shift, defaultDate, employees, locations])

  async function handleSave() {
    setError(null)
    if (!employeeId) {
      setError("Selecione um funcionário.")
      return
    }
    if (!date) {
      setError("Informe a data.")
      return
    }
    const input: ShiftInput = {
      employee_id: employeeId,
      location_id: locationId === "none" ? null : locationId,
      shift_date: date,
      start_time: `${startTime}:00`,
      end_time: `${endTime}:00`,
      notes: notes.trim() || null,
    }
    setSaving(true)
    try {
      await onSave(input, shift?.id)
      if (createAnother && !shift) {
        setEmployeeId(employees[0]?.id ?? "")
        setLocationId(locations[0]?.id ?? "none")
        setDate(defaultDate ?? toISODate(new Date()))
        setStartTime("08:00")
        setEndTime("16:00")
        setNotes("")
        setDisplayEmployeeName(employees[0]?.name ?? "Selecione")
        setDisplayLocationName(locations[0]?.name ?? "Sem local")
        setError(null)
        return
      }
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!shift || !onDelete) return
    setSaving(true)
    try {
      await onDelete(shift.id)
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-4 sm:max-w-md">
        <DialogHeader className="px-1">
          <DialogTitle>{shift ? "Editar turno" : "Novo turno"}</DialogTitle>
          <DialogDescription>
            {shift ? "Atualize os detalhes do turno." : "Adicione um turno à escala."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-1 sm:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="employee">Funcionário</Label>
            <Select value={employeeId} onValueChange={(value) => {
              setEmployeeId(value)
              setDisplayEmployeeName(employees.find((employee) => employee.id === value)?.name ?? "Selecione")
            }}>
              <SelectTrigger id="employee">
                <span>{displayEmployeeName}</span>
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                    {e.role ? ` — ${e.role}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Local</Label>
            <Select value={locationId} onValueChange={(value) => {
              setLocationId(value)
              setDisplayLocationName(locations.find((location) => location.id === value)?.name ?? (value === "none" ? "Sem local" : "Selecione"))
            }}>
              <SelectTrigger id="location">
                <span>{displayLocationName}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem local</SelectItem>
                {locations.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label>Horários rápidos</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_TIME_OPTIONS.map((option) => (
                <Button
                  key={option.label}
                  type="button"
                  variant={startTime === option.start && endTime === option.end ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStartTime(option.start)
                    setEndTime(option.end)
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="start">Início</Label>
              <Input id="start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">Fim</Label>
              <Input id="end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border p-2">
            <input
              type="checkbox"
              id="createAnother"
              checked={createAnother}
              onChange={(e) => setCreateAnother(e.target.checked)}
            />
            <Label htmlFor="createAnother" className="cursor-pointer">Criar outro turno</Label>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="flex-col-reverse gap-2 px-1 sm:flex-row sm:justify-between">
          {shift && onDelete ? (
            <Button variant="destructive" onClick={handleDelete} disabled={saving} className="sm:mr-auto">
              Excluir
            </Button>
          ) : null}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
