"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  ColumnDef,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { BookA, Loader2, Plus, Edit3, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

type Mantra = {
  id: string;
  religion: string;
  text: string;
  nativeText: string | null;
  meaning: string | null;
};

export function MantrasManager() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMantra, setEditingMantra] = useState<Mantra | null>(null);
  
  // Form State
  const [religion, setReligion] = useState("");
  const [text, setText] = useState("");
  const [nativeText, setNativeText] = useState("");
  const [meaning, setMeaning] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch mantras
  const { data: mantrasData, isLoading } = useQuery({
    queryKey: ["admin", "mantras"],
    queryFn: async () => {
      const res = await fetch("/api/admin/mantras");
      if (!res.ok) throw new Error("Failed to load mantras");
      const json = await res.json();
      return (json.mantras || []) as Mantra[];
    },
  });
  
  const mantras = mantrasData || [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!religion || !text) {
      toast.error("Religion and text are required");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/mantras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ religion, text, nativeText, meaning }),
      });
      if (res.ok) {
        toast.success("Mantra added successfully");
        setIsAddOpen(false);
        queryClient.invalidateQueries({ queryKey: ["admin", "mantras"] });
        resetForm();
      } else {
        toast.error("Failed to add mantra");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMantra) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/mantras/${editingMantra.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ religion, text, nativeText, meaning }),
      });
      if (res.ok) {
        toast.success("Mantra updated successfully");
        setIsEditOpen(false);
        queryClient.invalidateQueries({ queryKey: ["admin", "mantras"] });
        resetForm();
      } else {
        toast.error("Failed to update mantra");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mantra?")) return;
    try {
      const res = await fetch(`/api/admin/mantras/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Mantra deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["admin", "mantras"] });
      } else {
        toast.error("Failed to delete mantra");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const openEdit = (mantra: Mantra) => {
    setEditingMantra(mantra);
    setReligion(mantra.religion);
    setText(mantra.text);
    setNativeText(mantra.nativeText || "");
    setMeaning(mantra.meaning || "");
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setReligion("");
    setText("");
    setNativeText("");
    setMeaning("");
    setEditingMantra(null);
  };

  const columns: ColumnDef<Mantra>[] = [
    {
      accessorKey: "religion",
      header: "Religion/Community",
      cell: (info) => <span className="font-semibold">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "text",
      header: "Mantra",
    },
    {
      accessorKey: "nativeText",
      header: "Native Text",
      cell: (info) => <span className="font-serif text-lg">{info.getValue() as string || "-"}</span>,
    },
    {
      accessorKey: "meaning",
      header: "Meaning",
      cell: (info) => <span className="text-muted-foreground text-xs">{info.getValue() as string || "-"}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer"
              onClick={() => openEdit(row.original)}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )
      }
    }
  ];

  const table = useReactTable({
    data: mantras,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      }
    }
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="p-5 bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <BookA className="w-4 h-4 text-primary" />
              Mantras Config
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Manage the list of pre-defined mantras available for biodatas.</p>
          </div>

          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground font-bold h-8 text-xs cursor-pointer rounded-lg">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Mantra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Mantra</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label>Religion/Community *</Label>
                  <Input value={religion} onChange={e => setReligion(e.target.value)} placeholder="e.g. Hindu (General)" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Mantra Text (English) *</Label>
                  <Input value={text} onChange={e => setText(e.target.value)} placeholder="e.g. || Shree Ganeshay Namah ||" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Native Text (Optional)</Label>
                  <Input value={nativeText} onChange={e => setNativeText(e.target.value)} placeholder="e.g. || श्री गणेशाय नमः ||" />
                </div>
                <div className="space-y-1.5">
                  <Label>Meaning (Optional)</Label>
                  <Input value={meaning} onChange={e => setMeaning(e.target.value)} placeholder="e.g. Invocation to Lord Ganesha" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSaving} className="font-bold rounded-lg cursor-pointer">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Mantra
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Mantra</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>Religion/Community *</Label>
                <Input value={religion} onChange={e => setReligion(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Mantra Text (English) *</Label>
                <Input value={text} onChange={e => setText(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Native Text (Optional)</Label>
                <Input value={nativeText} onChange={e => setNativeText(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Meaning (Optional)</Label>
                <Input value={meaning} onChange={e => setMeaning(e.target.value)} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSaving} className="font-bold rounded-lg cursor-pointer">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Update Mantra
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-4 mt-6">
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="px-4 py-3 font-bold">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="border-b border-border hover:bg-muted/30 transition-colors last:border-0">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-4 py-3">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground font-semibold">
                        No mantras found. Add one above!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-muted-foreground font-bold bg-muted px-2 py-1 rounded-md">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 px-2 cursor-pointer font-semibold text-[11px] rounded-lg"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 px-2 cursor-pointer font-semibold text-[11px] rounded-lg"
                >
                  Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
