"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Plus, Trash2, X, Check } from "lucide-react"
import type { Employee, Location } from "@/lib/types"

const COLOR_OPTIONS = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#dc2626",
  "#9333ea",
  "#0891b2",
  "#ca8a04",
  "#db2777",
]

interface ManageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locations: Location[]
  employees: Employee[]
  onCreateLocation: (input: { name: string; color: string }) => Promise<void>
  onUpdateLocation: (id: string, input: { name: string; color: string }) => Promise<void>
  onDeleteLocation: (id: string) => Promise<void>
  onCreateEmployee: (input: { name: string; role: string | null }) => Promise<void>
  onUpdateEmployee: (id: string, input: { name: string; role: string | null }) => Promise<void>
  onDeleteEmployee: (id: string) => Promise<void>
}

export function ManageDialog(props: ManageDialogProps) {
  const { open, onOpenChange } = props
  const [tab, setTab] = useState<"locations" | "employees">("locations")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerenciar</DialogTitle>
          <DialogDescription>Cadastre locais e funcionários da escala.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setTab("locations")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "locations" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Locais
          </button>
          <button
            onClick={() => setTab("employees")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "employees" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Funcionários
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto pr-1">
          {tab === "locations" ? (
            <LocationsPanel {...props} />
          ) : (
            <EmployeesPanel {...props} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LocationsPanel({
  locations,
  onCreateLocation,
  onUpdateLocation,
  onDeleteLocation,
}: ManageDialogProps) {
  const [name, setName] = useState("")
  const [color, setColor] = useState(COLOR_OPTIONS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState(COLOR_OPTIONS[0])
  const [busy, setBusy] = useState(false)

  async function add() {
    if (!name.trim()) return
    setBusy(true)
    try {
      await onCreateLocation({ name: name.trim(), color })
      setName("")
      setColor(COLOR_OPTIONS[0])
    } finally {
      setBusy(false)
    }
  }

  function startEdit(l: Location) {
    setEditingId(l.id)
    setEditName(l.name)
    setEditColor(l.color)
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return
    setBusy(true)
    try {
      await onUpdateLocation(id, { name: editName.trim(), color: editColor })
      setEditingId(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-3">
        <Label className="mb-2 block">Novo local</Label>
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do local" />
          <Button onClick={add} disabled={busy || !name.trim()} size="icon" aria-label="Adicionar local">
            <Plus className="size-4" />
          </Button>
        </div>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      <ul className="space-y-2">
        {locations.map((l) => (
          <li key={l.id} className="flex items-center gap-2 rounded-lg border border-border p-2">
            {editingId === l.id ? (
              <>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8" />
                <ColorPicker value={editColor} onChange={setEditColor} compact />
                <Button size="icon" variant="ghost" onClick={() => saveEdit(l.id)} aria-label="Salvar">
                  <Check className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} aria-label="Cancelar">
                  <X className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <span className="size-4 shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="flex-1 truncate text-sm">{l.name}</span>
                <Button size="icon" variant="ghost" onClick={() => startEdit(l)} aria-label="Editar">
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDeleteLocation(l.id)}
                  aria-label="Excluir"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </>
            )}
          </li>
        ))}
        {locations.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Nenhum local cadastrado.</p>
        ) : null}
      </ul>
    </div>
  )
}

function EmployeesPanel({
  employees,
  onCreateEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}: ManageDialogProps) {
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editRole, setEditRole] = useState("")
  const [busy, setBusy] = useState(false)

  async function add() {
    if (!name.trim()) return
    setBusy(true)
    try {
      await onCreateEmployee({ name: name.trim(), role: role.trim() || null })
      setName("")
      setRole("")
    } finally {
      setBusy(false)
    }
  }

  function startEdit(e: Employee) {
    setEditingId(e.id)
    setEditName(e.name)
    setEditRole(e.role ?? "")
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return
    setBusy(true)
    try {
      await onUpdateEmployee(id, { name: editName.trim(), role: editRole.trim() || null })
      setEditingId(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-3">
        <Label className="mb-2 block">Novo funcionário</Label>
        <div className="grid gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" />
          <div className="flex gap-2">
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Cargo (opcional)" />
            <Button onClick={add} disabled={busy || !name.trim()} size="icon" aria-label="Adicionar funcionário">
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <ul className="space-y-2">
        {employees.map((emp) => (
          <li key={emp.id} className="flex items-center gap-2 rounded-lg border border-border p-2">
            {editingId === emp.id ? (
              <>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8" />
                <Input
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="h-8"
                  placeholder="Cargo"
                />
                <Button size="icon" variant="ghost" onClick={() => saveEdit(emp.id)} aria-label="Salvar">
                  <Check className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} aria-label="Cancelar">
                  <X className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <p className="truncate text-sm font-medium">{emp.name}</p>
                  {emp.role ? <p className="truncate text-xs text-muted-foreground">{emp.role}</p> : null}
                </div>
                <Button size="icon" variant="ghost" onClick={() => startEdit(emp)} aria-label="Editar">
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDeleteEmployee(emp.id)}
                  aria-label="Excluir"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </>
            )}
          </li>
        ))}
        {employees.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Nenhum funcionário cadastrado.</p>
        ) : null}
      </ul>
    </div>
  )
}

function ColorPicker({
  value,
  onChange,
  compact,
}: {
  value: string
  onChange: (c: string) => void
  compact?: boolean
}) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? "" : "mt-3"}`}>
      {COLOR_OPTIONS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={`Cor ${c}`}
          className={`size-6 rounded-full border-2 transition-transform ${
            value === c ? "scale-110 border-foreground" : "border-transparent"
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  )
}
