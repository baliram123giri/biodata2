"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, RefreshCw, AlertTriangle, Lock, Mail, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const userSchema = z.object({
  name: z.string().min(2, "Full Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "premium", "moderator", "admin", "superadmin"])
});

type UserFormValues = z.infer<typeof userSchema>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (name: string) => void;
}

interface FormFieldConfig {
  name: "name" | "email" | "password";
  label: string;
  type: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FORM_FIELDS: FormFieldConfig[] = [
  { name: "name", label: "Full Name", type: "text", placeholder: "Enter full name", icon: UserIcon },
  { name: "email", label: "Email Address", type: "email", placeholder: "name@email.com", icon: Mail },
  { name: "password", label: "Password", type: "password", placeholder: "••••••••", icon: Lock }
];

const ROLE_OPTIONS = [
  { value: "user", label: "Standard User" },
  { value: "premium", label: "Premium User" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Administrator" },
  { value: "superadmin", label: "Super Admin" }
];

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
  const [error, setError] = React.useState("");
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const res = await api.post("/admin/users", values);
      return res.data;
    },
    onSuccess: (data, variables) => {
      onSuccess(variables.name);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error || "Failed to create user record.";
      setError(errMsg);
    }
  });
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user"
    }
  });

  const isSubmitting = createUserMutation.isPending;

  React.useEffect(() => {
    if (!open) {
      reset();
      setError("");
      createUserMutation.reset();
    }
  }, [open, reset]);

  const onSubmit = React.useCallback((values: UserFormValues) => {
    setError("");
    createUserMutation.mutate(values);
  }, [createUserMutation]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border border-border rounded-2xl shadow-2xl p-0 overflow-hidden" showCloseButton={true}>
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <DialogTitle className="text-sm font-extrabold text-foreground tracking-tight">Create User Record</DialogTitle>
            <DialogDescription className="sr-only">Form to create a new user record with designated role privileges.</DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {FORM_FIELDS.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">{field.label}</label>
              <div className="relative">
                <field.icon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type={field.type}
                  {...register(field.name)}
                  placeholder={field.placeholder}
                  className="w-full bg-muted/40 border border-border focus:border-primary text-foreground rounded-lg pl-10 pr-3.5 py-2 text-xs outline-none transition-all focus:ring-1 focus:ring-primary/30"
                />
              </div>
              {errors[field.name] && (
                <p className="text-[10px] text-rose-500 font-semibold">{errors[field.name]?.message}</p>
              )}
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">User Authorization Role</label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full bg-muted/40 border-border text-foreground text-xs h-9 cursor-pointer">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border text-popover-foreground text-xs">
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 border-border text-muted-foreground hover:text-foreground text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Save User Record"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
