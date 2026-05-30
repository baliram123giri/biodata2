"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { Lock, Mail, RefreshCw, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      // Successful login -> redirect to dashboard
      router.push("/admin");
    } catch (err) {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4 sm:p-6">
      <Card className="p-6 sm:p-8 bg-card border border-border rounded-2xl shadow-xl space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-4">
          <Logo iconClassName="h-16 w-auto" disableShine />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Administrative Console
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your credentials to manage matrimonial records.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@biodata99.com"
                className="w-full bg-muted/40 border border-border dark:border-white/20 focus:border-primary text-foreground rounded-lg pl-10 pr-3.5 py-2.5 text-xs outline-none transition-all focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-muted/40 border border-border dark:border-white/20 focus:border-primary text-foreground rounded-lg pl-10 pr-3.5 py-2.5 text-xs outline-none transition-all focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs h-10 rounded-lg flex items-center justify-center gap-2 cursor-pointer mt-2 border border-transparent dark:border-white/20"
          >
            {loading ? (
              <RefreshCw className="w-4.5 h-4.5 animate-spin" />
            ) : (
              "Authenticate Session"
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">
            Protected area. Unauthorized login attempts are logged and monitored.
          </p>
        </div>
      </Card>
    </div>
  );
}
