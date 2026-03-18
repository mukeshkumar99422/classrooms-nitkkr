'use client'

import { useState } from 'react'
import { createDepartment, updateDepartment, deleteDepartment } from '@/app/actions/departments'
import { Department } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Building2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DepartmentsClientProps {
  departments: Department[]
}

export default function DepartmentsClient({ departments }: DepartmentsClientProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedDept, setSelectedDept] = useState<Department | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  const filteredDepts = departments.filter(
    (d) =>
      !d.is_admin &&
      (d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.email.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAdd = async (formData: FormData) => {
    setLoading(true)
    const result = await createDepartment(formData)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Department created successfully')
      setAddOpen(false)
      router.refresh()
    }
  }

  const handleEdit = async (formData: FormData) => {
    setLoading(true)
    const result = await updateDepartment(formData)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Department updated successfully')
      setEditOpen(false)
      setSelectedDept(null)
      router.refresh()
    }
  }

  const handleDelete = async () => {
    if (!selectedDept) return
    setLoading(true)
    const result = await deleteDepartment(selectedDept.id)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Department deleted successfully')
      setDeleteOpen(false)
      setSelectedDept(null)
      router.refresh()
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="h-7 w-7 text-amber-400" />
            Departments
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage department accounts and credentials
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger
            render={<Button className="bg-amber-600 hover:bg-amber-500 text-white" />}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
              <DialogDescription className="text-slate-400">
                Create a new department account with login credentials.
              </DialogDescription>
            </DialogHeader>
            <form action={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Department Name</Label>
                <Input
                  name="name"
                  placeholder="e.g., Computer Science"
                  required
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="cse@nitkkr.ac.in"
                  required
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Password</Label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setAddOpen(false)} className="text-slate-400 hover:text-white">
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-500" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Department'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700/50 hover:bg-transparent">
              <TableHead className="text-slate-400 font-semibold">Name</TableHead>
              <TableHead className="text-slate-400 font-semibold">Email</TableHead>
              <TableHead className="text-slate-400 font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepts.length === 0 ? (
              <TableRow className="border-slate-700/50">
                <TableCell colSpan={3} className="text-center text-slate-500 py-12">
                  {search ? 'No departments match your search' : 'No departments added yet'}
                </TableCell>
              </TableRow>
            ) : (
              filteredDepts.map((dept) => (
                <TableRow key={dept.id} className="border-slate-700/50 hover:bg-slate-700/20">
                  <TableCell className="text-white font-medium">{dept.name}</TableCell>
                  <TableCell className="text-slate-400">{dept.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"
                        onClick={() => {
                          setSelectedDept(dept)
                          setEditOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => {
                          setSelectedDept(dept)
                          setDeleteOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update department information.
            </DialogDescription>
          </DialogHeader>
          {selectedDept && (
            <form action={handleEdit} className="space-y-4">
              <input type="hidden" name="id" value={selectedDept.id} />
              <div className="space-y-2">
                <Label className="text-slate-300">Department Name</Label>
                <Input
                  name="name"
                  defaultValue={selectedDept.name}
                  required
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input
                  name="email"
                  type="email"
                  defaultValue={selectedDept.email}
                  required
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditOpen(false)} className="text-slate-400 hover:text-white">
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-500" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription className="text-slate-400">
              This will permanently delete the department &quot;{selectedDept?.name}&quot; and its
              associated user account. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)} className="text-slate-400 hover:text-white">
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
