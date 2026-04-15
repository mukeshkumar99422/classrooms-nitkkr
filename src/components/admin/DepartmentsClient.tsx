"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Search, Building2, Mail } from "lucide-react";
import { Button, Input, Label, Card, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/index";
import { toast } from "@/hooks/use-toast";
import type { Department } from "@/types";

export default function DepartmentsClient({ initialDepts }: { initialDepts: Department[] }) {
  const [depts, setDepts] = useState<Department[]>(initialDepts);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "" });
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const filtered = depts.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!addForm.name || !addForm.email || !addForm.password) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDepts(prev => [...prev, data.department].sort((a, b) => a.name.localeCompare(b.name)));
      setAddForm({ name: "", email: "", password: "" });
      setAddOpen(false);
      toast({ variant: "success", title: "Department added", description: `Invite sent to ${addForm.email}` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally { setLoading(false); }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/departments/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDepts(prev => prev.map(d => d.id === editTarget.id ? { ...d, ...editForm } : d));
      setEditOpen(false);
      toast({ variant: "success", title: "Department updated" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/departments/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setDepts(prev => prev.filter(d => d.id !== deleteTarget.id));
      setDeleteOpen(false);
      toast({ variant: "success", title: "Department deleted" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search departments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Department
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No departments found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(dept => (
            <Card key={dept.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{dept.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3 flex-shrink-0" />{dept.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0 ml-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => { setEditTarget(dept); setEditForm({ name: dept.name, email: dept.email }); setEditOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
                    onClick={() => { setDeleteTarget(dept); setDeleteOpen(true); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Department</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Department Name</Label>
              <Input placeholder="e.g., Computer Science" value={addForm.name}
                onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" placeholder="cs@nitkkr.ac.in" value={addForm.email}
                onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <Input placeholder="Set a temporary password" value={addForm.password}
                onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} />
              <p className="text-xs text-muted-foreground">Login credentials will be emailed to the department.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={loading || !addForm.name || !addForm.email || !addForm.password}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add & Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Department</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Department Name</Label>
              <Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Department</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Permanently delete <strong className="text-foreground">{deleteTarget?.name}</strong>?
            This removes their account and all schedule allocations.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
