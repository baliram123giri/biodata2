"use client";

import * as React from "react";
import { 
  Users as UsersIcon, 
  Search, 
  Trash2,
  RefreshCw,
  UserPlus,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn, getInitials, formatISTDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { CreateUserDialog } from "@/components/admin/users/CreateUserDialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";

const FILTER_ROLES = [
  { value: "all", label: "All Roles" },
  { value: "superadmin", label: "Super Admins" },
  { value: "admin", label: "Administrators" },
  { value: "moderator", label: "Moderators" },
  { value: "premium", label: "Premium Users" },
  { value: "user", label: "Standard Users" }
];

const ACTIONS_ROLES = [
  { value: "superadmin", label: "Super Admin", colorClass: "text-amber-500" },
  { value: "admin", label: "Admin", colorClass: "text-primary" },
  { value: "moderator", label: "Moderator", colorClass: "text-blue-500" },
  { value: "premium", label: "Premium User", colorClass: "text-secondary-foreground" },
  { value: "user", label: "Standard User", colorClass: "text-muted-foreground" }
];

export default function AdminUsers() {
  const { data: session } = useSession();
  const currentUser: any = session?.user;
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null);

  // Table row selection & confirmation box state
  const [rowSelection, setRowSelection] = React.useState({});
  const [confirmDeleteState, setConfirmDeleteState] = React.useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Queries
  const { data: usersData, isLoading: loading, refetch } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await api.get("/admin/users");
      return res.data.users as any[];
    },
    staleTime: 0, // Instant refetch
  });

  const users = usersData || [];

  // Mutations for single-item toggles
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, currentStatus }: { userId: string; currentStatus: string }) => {
      const nextStatus = currentStatus === "active" ? "suspended" : "active";
      const res = await api.patch(`/admin/users/${userId}`, { status: nextStatus });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Account status updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      refetch();
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error || "Failed to update account status.";
      toast.error(errMsg);
    }
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await api.patch(`/admin/users/${userId}`, { role });
      return res.data;
    },
    onSuccess: () => {
      toast.success("User authorization role updated.");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      refetch();
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error || "Failed to assign new role.";
      toast.error(errMsg);
    }
  });

  const handleToggleStatus = React.useCallback((userId: string, currentStatus: string) => {
    toggleStatusMutation.mutate({ userId, currentStatus });
  }, [toggleStatusMutation]);

  const handleChangeRole = React.useCallback((userId: string, nextRole: string) => {
    changeRoleMutation.mutate({ userId, role: nextRole });
  }, [changeRoleMutation]);

  const isSuperAdmin = currentUser?.role === "superadmin";

  const filtered = React.useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(search.toLowerCase()) || 
        user.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = 
        roleFilter === "all" || 
        user.role.toLowerCase() === roleFilter.toLowerCase();
      
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Reset rowSelection when filters or page change
  React.useEffect(() => {
    setRowSelection({});
  }, [search, roleFilter]);

  const selectedIds = React.useMemo(() => {
    return Object.keys(rowSelection).map(indexStr => {
      const idx = parseInt(indexStr, 10);
      return filtered[idx]?.id;
    }).filter(Boolean);
  }, [rowSelection, filtered]);

  // TanStack Table Column Definitions
  const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center p-1">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => {
        const user = row.original;
        // Don't show checkbox for the current user to prevent self-deletion
        if (user.id === currentUser?.id) return null;
        return (
          <div className="flex items-center justify-center p-1">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "User ID",
      cell: (info) => (
        <span className="font-mono font-bold text-primary">
          {(info.getValue() as string).slice(0, 8)}
        </span>
      )
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => {
        const name = info.getValue() as string;
        const initials = getInitials(name);
        return (
          <div className="flex items-center gap-2 font-bold text-foreground">
            <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-muted-foreground text-[10px]">
              {initials}
            </div>
            <span>{name}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "email",
      header: "Email Address",
      cell: (info) => <span className="font-medium">{info.getValue() as string}</span>
    },
    {
      accessorKey: "role",
      header: "Account Role",
      cell: (info) => {
        const role = info.getValue() as string;
        return (
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
            role === "superadmin"
              ? "bg-amber-500/20 text-amber-500 border-amber-500/30"
              : role === "admin" 
              ? "bg-primary/20 text-primary border-primary/30" 
              : role === "premium" 
              ? "bg-secondary/20 text-secondary-foreground border-secondary/30"
              : role === "moderator"
              ? "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20"
              : "bg-muted text-muted-foreground border-border"
          )}>
            {role}
          </span>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as string;
        return (
          <span className={cn(
            "inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider",
            status === "active" 
              ? "text-emerald-500 dark:text-emerald-450 bg-emerald-500/10 border-emerald-500/20" 
              : "text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/20"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", status === "active" ? "bg-emerald-500" : "bg-rose-500")} />
            {status}
          </span>
        );
      }
    },
    {
      accessorKey: "createdAt",
      header: "Joined Date",
      cell: (info) => (
        <span className="text-muted-foreground font-medium">
          {formatISTDate(info.getValue() as string)}
        </span>
      )
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4">Actions</div>,
      cell: (info) => {
        const user = info.row.original;
        return (
          <div className="flex items-center justify-end pr-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedUser(user)}
              className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider gap-1.5 cursor-pointer border-primary/20 text-primary hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Manage</span>
            </Button>
          </div>
        );
      }
    }
  ], [isSuperAdmin, handleChangeRole, handleToggleStatus, currentUser]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row, index) => String(index),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  const getColumnResponsiveClass = (colId: string) => {
    if (colId === "id") return "hidden md:table-cell";
    if (colId === "email") return "hidden sm:table-cell";
    if (colId === "createdAt") return "hidden lg:table-cell";
    return "";
  };

  return (
    <div className="space-y-6 text-foreground relative w-full">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <UsersIcon className="w-8 h-8 text-primary" />
            User Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage user accounts, assign authorization roles, and toggle access statuses.
          </p>
        </div>
        
        {isSuperAdmin && (
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create User</span>
          </Button>
        )}
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 border border-border rounded-xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/40 border border-border focus:border-primary text-foreground rounded-lg pl-10 pr-3 py-2 text-xs outline-none placeholder:text-muted-foreground transition-all focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val || "all")}>
            <SelectTrigger className="w-40 bg-muted/40 border-border text-foreground text-xs h-9 cursor-pointer">
              <SelectValue placeholder="Account Role" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border text-popover-foreground text-xs">
              {FILTER_ROLES.map((roleOpt) => (
                <SelectItem key={roleOpt.value} value={roleOpt.value}>
                  {roleOpt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Floating Bulk Action bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-hidden text-xs"
          >
            <div className="flex items-center gap-2 font-bold text-foreground">
              <span className="bg-primary text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                {selectedIds.length}
              </span>
              <span>Selected user records</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setConfirmDeleteState({
                    isOpen: true,
                    title: `Purge ${selectedIds.length} User Accounts`,
                    description: `Are you sure you want to permanently delete these ${selectedIds.length} user records? This action is completely irreversible and will permanently delete all metadata, purchase histories, and biodata profiles associated with these user accounts.`,
                    onConfirm: async () => {
                      const loadingToast = toast.loading(`Purging ${selectedIds.length} user accounts...`);
                      try {
                        const res = await fetch("/api/admin/users", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ids: selectedIds }),
                        });
                        if (res.ok) {
                          toast.success(`Successfully purged ${selectedIds.length} user accounts`, { id: loadingToast });
                          setRowSelection({});
                          queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
                          refetch();
                        } else {
                          const data = await res.json();
                          toast.error(data.error || "Failed to bulk delete users", { id: loadingToast });
                        }
                      } catch (error) {
                        toast.error("Network communication error", { id: loadingToast });
                      }
                    }
                  });
                }}
                className="h-8 px-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition-all text-[11px] cursor-pointer uppercase tracking-wider border border-transparent dark:border-white/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Selected</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users table */}
      <Card className="bg-card border border-border rounded-xl overflow-hidden shadow-sm w-full">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">Retrieving User Accounts...</span>
          </div>
        ) : (
          <>
            {/* Mobile Responsive Cards View */}
            <div className="block sm:hidden divide-y divide-border/40">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => {
                  const user = row.original;
                  const initials = getInitials(user.name);
                  const isSelected = row.getIsSelected();
                  return (
                    <div 
                      key={row.id} 
                      className={cn(
                        "p-4 space-y-3 hover:bg-muted/10 transition-colors",
                        isSelected && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {user.id !== currentUser?.id && (
                            <Checkbox
                              checked={row.getIsSelected()}
                              onCheckedChange={(value) => row.toggleSelected(!!value)}
                              aria-label="Select row"
                            />
                          )}
                          <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-muted-foreground text-[10px] shrink-0">
                            {initials}
                          </div>
                          <span className="font-bold text-foreground text-sm">{user.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/75 font-semibold">
                          ID: <span className="font-mono text-primary font-bold">{user.id.slice(0, 8)}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] text-muted-foreground">
                        <div>
                          <span className="block font-bold text-muted-foreground/60 uppercase text-[9px] tracking-wider mb-0.5">Email Address</span>
                          <span className="text-foreground/90 font-medium truncate block max-w-[140px]">{user.email}</span>
                        </div>
                        <div>
                          <span className="block font-bold text-muted-foreground/60 uppercase text-[9px] tracking-wider mb-0.5">Account Role</span>
                          <span className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider inline-block mt-0.5",
                            user.role === "superadmin"
                              ? "bg-amber-500/20 text-amber-500 border-amber-500/30"
                              : user.role === "admin" 
                              ? "bg-primary/20 text-primary border-primary/30" 
                              : user.role === "premium" 
                              ? "bg-secondary/20 text-secondary-foreground border-secondary/30"
                              : user.role === "moderator"
                              ? "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          )}>
                            {user.role}
                          </span>
                        </div>
                        <div>
                          <span className="block font-bold text-muted-foreground/60 uppercase text-[9px] tracking-wider mb-0.5">Status</span>
                          <span className={cn(
                            "inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider mt-0.5",
                            user.status === "active" 
                              ? "text-emerald-500 dark:text-emerald-450 bg-emerald-500/10 border-emerald-500/20" 
                              : "text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/20"
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", user.status === "active" ? "bg-emerald-500" : "bg-rose-500")} />
                            {user.status}
                          </span>
                        </div>
                        <div>
                          <span className="block font-bold text-muted-foreground/60 uppercase text-[9px] tracking-wider mb-0.5">Joined Date</span>
                          <span className="text-foreground/90 font-medium block mt-1">
                            {formatISTDate(user.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider gap-1.5 cursor-pointer border-primary/20 text-primary hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground font-bold uppercase tracking-wider text-xs">
                  No matching user records found.
                </div>
              )}
            </div>

            {/* Desktop High-Fidelity Table View */}
            <div className="hidden sm:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs table-fixed min-w-[700px]">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="border-b border-border bg-muted/25 text-muted-foreground font-bold uppercase tracking-wider">
                      {headerGroup.headers.map(header => {
                        let widthStyle = "";
                        if (header.id === "select") widthStyle = "w-[60px]";
                        else if (header.id === "id") widthStyle = "w-[120px]";
                        else if (header.id === "name") widthStyle = "w-[180px]";
                        else if (header.id === "email") widthStyle = "w-[200px]";
                        else if (header.id === "role") widthStyle = "w-[140px]";
                        else if (header.id === "status") widthStyle = "w-[120px]";
                        else if (header.id === "createdAt") widthStyle = "w-[140px]";
                        else if (header.id === "actions") widthStyle = "w-[100px]";
 
                        return (
                          <th 
                            key={header.id} 
                            className={cn(
                              "sticky top-0 z-10 bg-muted/95 backdrop-blur-xs p-4 align-middle font-bold text-left", 
                              widthStyle, 
                              getColumnResponsiveClass(header.column.id)
                            )}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-border/30 text-foreground/90">
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-muted/10 transition-colors">
                        {row.getVisibleCells().map(cell => (
                          <td 
                            key={cell.id} 
                            className={cn(
                              "p-4 align-middle truncate", 
                              getColumnResponsiveClass(cell.column.id)
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="p-8 text-center text-muted-foreground font-bold uppercase tracking-wider">
                        No matching user records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-border flex items-center justify-between text-xs bg-muted/10">
              <div className="text-muted-foreground font-medium">
                Showing Page <span className="font-semibold text-foreground">{table.getState().pagination.pageIndex + 1}</span> of{" "}
                <span className="font-semibold text-foreground">{table.getPageCount()}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 px-2.5 text-xs font-bold cursor-pointer bg-background flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 px-2.5 text-xs font-bold cursor-pointer bg-background flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Overlay Modal for Creating User */}
      <CreateUserDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={(name) => {
          toast.success(`Successfully registered ${name}!`);
          refetch();
        }}
      />

      {/* Dynamic Overlay Dialog for Managing User Actions */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
          <DialogContent className="sm:max-w-md bg-card border border-border rounded-xl shadow-2xl p-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg font-bold text-foreground">
                Manage User Access
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configure account permissions, status state, and access controls.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 my-4">
              {/* Profile Card Summary */}
              <div className="flex items-center gap-3 p-3 bg-muted/40 border border-border/60 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                  {getInitials(selectedUser.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground truncate">{selectedUser.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                    selectedUser.status === "active" 
                      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
                      : "text-rose-500 bg-rose-500/10 border-rose-500/20"
                  )}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              {/* Role Configuration */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Authorization Role
                </label>
                {isSuperAdmin ? (
                  <Select 
                    value={selectedUser.role} 
                    onValueChange={(val) => {
                      handleChangeRole(selectedUser.id, val);
                      setSelectedUser({ ...selectedUser, role: val });
                    }}
                  >
                    <SelectTrigger className="w-full bg-muted/40 border-border text-foreground text-xs h-9 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border text-popover-foreground text-xs">
                      {ACTIONS_ROLES.map((roleOpt) => (
                        <SelectItem key={roleOpt.value} value={roleOpt.value}>
                          {roleOpt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                    {selectedUser.role} (Super Admin privilege required to edit)
                  </div>
                )}
              </div>

              {/* Status Access Toggle */}
              {(selectedUser.role !== "superadmin" || isSuperAdmin) && (
                <div className="space-y-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Access Status</p>
                    <p className="text-[10px] text-muted-foreground">Toggle to suspend or resume account login permission.</p>
                  </div>
                  <div className="flex bg-muted/40 p-1 border border-border rounded-lg gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedUser.status !== "active") {
                          handleToggleStatus(selectedUser.id, selectedUser.status);
                          setSelectedUser({ ...selectedUser, status: "active" });
                        }
                      }}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer",
                        selectedUser.status === "active"
                          ? "bg-card border border-border text-emerald-500 shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full bg-emerald-500", selectedUser.status !== "active" && "opacity-60")} />
                      <span>Active</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedUser.status !== "suspended") {
                          handleToggleStatus(selectedUser.id, selectedUser.status);
                          setSelectedUser({ ...selectedUser, status: "suspended" });
                        }
                      }}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer",
                        selectedUser.status === "suspended"
                          ? "bg-card border border-border text-rose-500 shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full bg-rose-500", selectedUser.status !== "suspended" && "opacity-60")} />
                      <span>Suspended</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              {isSuperAdmin && selectedUser.id !== currentUser?.id && (
                <div className="border border-rose-500/20 rounded-lg p-3 bg-rose-500/5 space-y-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-rose-500">Danger Zone</p>
                    <p className="text-[10px] text-muted-foreground">Permanently delete user profile, records, and associations.</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setConfirmDeleteState({
                        isOpen: true,
                        title: "Purge User Account",
                        description: `Are you sure you want to permanently delete the user account for ${selectedUser.name} (${selectedUser.email})? This action is irreversible and will delete all user biodata, files, and orders.`,
                        onConfirm: async () => {
                          const loadingToast = toast.loading("Purging user account...");
                          try {
                            const res = await fetch(`/api/admin/users`, {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: selectedUser.id }),
                            });
                            if (res.ok) {
                              toast.success("User account successfully purged", { id: loadingToast });
                              setSelectedUser(null);
                              queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
                              refetch();
                            } else {
                              const err = await res.json();
                              toast.error(err.error || "Failed to delete user account", { id: loadingToast });
                            }
                          } catch (error) {
                            toast.error("Network communication error", { id: loadingToast });
                          }
                        }
                      });
                    }}
                    className="w-full h-8 border-rose-500/20 hover:bg-rose-500 hover:text-white hover:border-rose-500 text-rose-500 text-[10px] font-bold uppercase tracking-wider gap-1.5 cursor-pointer transition-all duration-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge Record</span>
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter className="mt-6 border-t border-border pt-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedUser(null)}
                className="w-full sm:w-auto h-9 text-xs font-bold cursor-pointer"
              >
                Close Panel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Premium Reusable Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDeleteState.isOpen}
        onOpenChange={(isOpen) => setConfirmDeleteState((prev) => ({ ...prev, isOpen }))}
        title={confirmDeleteState.title}
        description={confirmDeleteState.description}
        confirmText={confirmDeleteState.confirmText || "Confirm Purge"}
        cancelText="Keep Account"
        onConfirm={confirmDeleteState.onConfirm}
        variant="danger"
      />
    </div>
  );
}
