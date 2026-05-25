"use client";

import * as React from "react";
import { 
  Users as UsersIcon, 
  Search, 
  UserCheck, 
  UserMinus, 
  ShieldCheck, 
  Trash2,
  MoreVertical,
  UserPlus,
  RefreshCw,
  X,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn, getInitials } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { CreateUserDialog } from "@/components/admin/users/CreateUserDialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef
} from "@tanstack/react-table";

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

  // Queries
  const { data: usersData, isLoading: loading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await api.get("/admin/users");
      return res.data.users as any[];
    }
  });

  const users = usersData || [];

  // Mutations
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, currentStatus }: { userId: string; currentStatus: string }) => {
      const nextStatus = currentStatus === "active" ? "suspended" : "active";
      const res = await api.patch(`/admin/users/${userId}`, { status: nextStatus });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Account status updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
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
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error || "Failed to assign new role.";
      toast.error(errMsg);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.delete(`/admin/users/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("User record purged successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error || "Failed to delete user record.";
      toast.error(errMsg);
    }
  });

  const handleToggleStatus = React.useCallback((userId: string, currentStatus: string) => {
    toggleStatusMutation.mutate({ userId, currentStatus });
  }, [toggleStatusMutation]);

  const handleChangeRole = React.useCallback((userId: string, nextRole: string) => {
    changeRoleMutation.mutate({ userId, role: nextRole });
  }, [changeRoleMutation]);

  const handleDeleteUser = React.useCallback((userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user record? This action is irreversible.")) {
      return;
    }
    deleteUserMutation.mutate(userId);
  }, [deleteUserMutation]);

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

  // TanStack Table Column Definitions
  const columns = React.useMemo<ColumnDef<any>[]>(() => [
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
              ? "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
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
          {new Date(info.getValue() as string).toLocaleDateString()}
        </span>
      )
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: (info) => {
        const user = info.row.original;
        return (
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedUser(user)}
              className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider gap-1.5 cursor-pointer border-primary/20 text-primary hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Manage</span>
            </Button>
          </div>
        );
      }
    }
  ], [isSuperAdmin, handleChangeRole, handleToggleStatus, handleDeleteUser, currentUser]);

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  return (
    <div className="space-y-6 text-foreground relative">
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
          <Select defaultValue="all" onValueChange={(val) => setRoleFilter(val || "all")}>
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

      {/* Users table */}
      <Card className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">Retrieving User Accounts...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="border-b border-border bg-muted/25 text-muted-foreground font-bold uppercase tracking-wider">
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="p-4">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-border/30 text-foreground/90">
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-muted/10 transition-colors">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="p-4">
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
                  className="h-8 text-xs font-semibold cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 text-xs font-semibold cursor-pointer"
                >
                  Next
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
                      handleDeleteUser(selectedUser.id);
                      setSelectedUser(null);
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
    </div>
  );
}
