"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { 
  User as UserIcon, 
  Lock, 
  Mail, 
  UserCheck, 
  Shield, 
  Calendar, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  UserCircle2,
  Activity,
  Laptop,
  Globe,
  Clock,
  Fingerprint,
  LockKeyhole,
  CheckSquare
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials } from "@/lib/utils";

function parseUserAgent(uaString: string) {
  if (!uaString) return { browser: "Unknown Browser", os: "Unknown OS" };
  
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  
  if (uaString.includes("Firefox")) browser = "Mozilla Firefox";
  else if (uaString.includes("SamsungBrowser")) browser = "Samsung Internet";
  else if (uaString.includes("Chrome")) browser = "Google Chrome";
  else if (uaString.includes("Safari")) browser = "Apple Safari";
  else if (uaString.includes("Edge")) browser = "Microsoft Edge";
  else if (uaString.includes("Opera") || uaString.includes("OPR")) browser = "Opera";
  
  if (uaString.includes("Windows")) os = "Microsoft Windows";
  else if (uaString.includes("Macintosh") || uaString.includes("Mac OS")) os = "Apple macOS";
  else if (uaString.includes("Linux")) os = "Linux OS";
  else if (uaString.includes("Android")) os = "Google Android";
  else if (uaString.includes("iPhone") || uaString.includes("iPad")) os = "Apple iOS";
  
  return { browser, os };
}

export default function AdminProfile() {
  const { data: session, update } = useSession();
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [passLoading, setPassLoading] = React.useState(false);

  // Status Alerts
  const [profileSuccess, setProfileSuccess] = React.useState("");
  const [profileError, setProfileError] = React.useState("");
  const [passSuccess, setPassSuccess] = React.useState("");
  const [passError, setPassError] = React.useState("");

  // Visibility states
  const [showCurrentPass, setShowCurrentPass] = React.useState(false);
  const [showNewPass, setShowNewPass] = React.useState(false);
  const [showConfirmPass, setShowConfirmPass] = React.useState(false);

  // Form states
  const [profileForm, setProfileForm] = React.useState({
    name: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [rawUser, setRawUser] = React.useState<any>(null);
  const [sessionMeta, setSessionMeta] = React.useState<any>(null);

  // Fetch admin user details on mount
  React.useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/admin/profile");
        const data = await response.json();
        if (data.success) {
          setRawUser(data.user);
          setSessionMeta(data.sessionMeta);
          setProfileForm({
            name: data.user.name || "",
            email: data.user.email || "",
          });
        } else {
          setProfileError(data.error || "Failed to load profile details.");
        }
      } catch (err) {
        setProfileError("An error occurred while fetching profile.");
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const parsedUA = React.useMemo(() => {
    return parseUserAgent(sessionMeta?.userAgent || "");
  }, [sessionMeta]);

  const rolePermissions = React.useMemo(() => {
    const isSuper = rawUser?.role === "superadmin";
    
    const basePermissions = [
      { title: "Dashboard Telemetry", description: "Access real-time business and system performance charts." },
      { title: "Matrimonial Biodata Builder", description: "Create, view and modify user biodatas and forms." },
      { title: "Design Studio Designer", description: "Configure styling, margins, layers, and photo boundaries." },
      { title: "Coupon & Discount Management", description: "Generate promotional campaign coupons." },
      { title: "Review Moderation", description: "Approve or decline customer reviews and feedback." },
      { title: "Blog Management", description: "Write, edit and schedule articles for public feed." },
    ];

    const superPermissions = [
      { title: "User Directory Access Control", description: "Suspend, activate, delete users or assign roles." },
      { title: "Danger Zone Controls", description: "Flush Redis caches and manage server health triggers." },
      { title: "System Database Backups", description: "Trigger PostgreSQL database backups." },
      { title: "Branding Configuration", description: "Customize global website settings, gateways, and maintenance mode." },
    ];

    return isSuper ? [...basePermissions, ...superPermissions] : basePermissions;
  }, [rawUser]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setProfileSuccess("");
    setProfileError("");

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileError("Name and Email are required fields.");
      setSaveLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRawUser(data.user);
        setProfileSuccess("Profile details updated successfully!");
        
        // Update NextAuth session client state
        await update({
          name: data.user.name,
          email: data.user.email,
        });

        setTimeout(() => setProfileSuccess(""), 4000);
      } else {
        setProfileError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setProfileError("An error occurred while saving profile.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassSuccess("");
    setPassError("");

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError("All password fields are required.");
      setPassLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      setPassLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New password and confirm password do not match.");
      setPassLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPassSuccess("Password updated successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setPassSuccess(""), 4000);
      } else {
        setPassError(data.error || "Failed to update password.");
      }
    } catch (err) {
      setPassError("An error occurred while updating password.");
    } finally {
      setPassLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
          Loading profile...
        </p>
      </div>
    );
  }

  const joinDate = rawUser?.createdAt 
    ? new Date(rawUser.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";

  return (
    <div className="space-y-6 text-foreground">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <UserCircle2 className="w-8 h-8 text-primary" />
          My Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage your personal administrative information, email address, and sign-in credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="relative h-28 bg-gradient-to-tr from-[#9B1B30] to-[#C9A84C]">
              <div className="absolute right-4 top-4">
                <span className="bg-black/35 backdrop-blur-md text-[#E6C97A] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider border border-[#E6C97A]/25">
                  {rawUser?.role || "Admin"}
                </span>
              </div>
            </div>
            <CardContent className="relative pt-0 px-6 pb-6 text-center">
              {/* Profile Avatar Frame */}
              <div className="flex justify-center">
                <div className="w-20 h-20 -mt-10 rounded-full border-4 border-card bg-gradient-to-tr from-[#9B1B30] to-[#C9A84C] flex items-center justify-center font-black text-white text-2xl shadow-lg">
                  {getInitials(rawUser?.name, "AD")}
                </div>
              </div>

              <h2 className="mt-3 text-lg font-bold text-foreground tracking-tight">
                {rawUser?.name || "Administrator"}
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                {rawUser?.email || "admin@biodata99.com"}
              </p>

              <Separator className="bg-border/60 my-4" />

              <div className="space-y-3.5 text-left text-xs">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground">Access Privilege:</span>
                    <p className="text-[11px] text-muted-foreground capitalize">{rawUser?.role || "Admin"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <UserCheck className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground">Account Status:</span>
                    <p className="text-[11px] text-green-500 font-bold capitalize flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      {rawUser?.status || "Active"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground">Member Since:</span>
                    <p className="text-[11px] text-muted-foreground">{joinDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Tab Forms */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList variant="line" className="w-full border-b border-border/60 bg-transparent flex justify-start gap-4 mb-6 px-1">
              <TabsTrigger value="details" className="text-xs font-bold uppercase tracking-wider gap-1.5 py-2 hover:bg-muted/10 cursor-pointer">
                <UserIcon className="w-3.5 h-3.5" />
                Account Details
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs font-bold uppercase tracking-wider gap-1.5 py-2 hover:bg-muted/10 cursor-pointer">
                <Lock className="w-3.5 h-3.5" />
                Security & Password
              </TabsTrigger>
              <TabsTrigger value="session" className="text-xs font-bold uppercase tracking-wider gap-1.5 py-2 hover:bg-muted/10 cursor-pointer">
                <Activity className="w-3.5 h-3.5" />
                Session & Permissions
              </TabsTrigger>
            </TabsList>

            {/* Account Details Tab */}
            <TabsContent value="details" className="space-y-4 outline-none">
              <form onSubmit={handleProfileSubmit}>
                <Card className="bg-card border border-border rounded-xl">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base font-bold text-foreground">Personal Information</CardTitle>
                    <CardDescription className="text-xs">
                      Update your account display name and verified administrator email address.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-5">
                    {profileSuccess && (
                      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg p-3 text-xs font-medium">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{profileSuccess}</span>
                      </div>
                    )}

                    {profileError && (
                      <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-xs font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{profileError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="profile-name" className="text-xs font-bold text-muted-foreground">Full Name</Label>
                        <Input
                          id="profile-name"
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="bg-muted/30 focus-visible:bg-transparent"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="profile-email" className="text-xs font-bold text-muted-foreground">Email Address</Label>
                        <div className="relative">
                          <Input
                            id="profile-email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            placeholder="e.g. admin@site.com"
                            className="bg-muted/30 focus-visible:bg-transparent pl-9"
                          />
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <div className="border-t border-border/40 p-4 bg-muted/20 flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={saveLoading}
                      className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs gap-1.5 cursor-pointer min-w-[120px]"
                    >
                      {saveLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </form>
            </TabsContent>

            {/* Security & Password Tab */}
            <TabsContent value="security" className="space-y-4 outline-none">
              <form onSubmit={handlePasswordSubmit}>
                <Card className="bg-card border border-border rounded-xl">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base font-bold text-foreground">Change Password</CardTitle>
                    <CardDescription className="text-xs">
                      Update your administrator authentication password. You will need your current password to proceed.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-5">
                    {passSuccess && (
                      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg p-3 text-xs font-medium">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{passSuccess}</span>
                      </div>
                    )}

                    {passError && (
                      <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-xs font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{passError}</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Current Password */}
                      <div className="space-y-1.5">
                        <Label htmlFor="current-pass" className="text-xs font-bold text-muted-foreground">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="current-pass"
                            type={showCurrentPass ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                            className="bg-muted/30 focus-visible:bg-transparent pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {showCurrentPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                          </button>
                        </div>
                      </div>

                      <Separator className="bg-border/40 my-2" />

                      {/* New Password & Confirm Password */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="new-pass" className="text-xs font-bold text-muted-foreground">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new-pass"
                              type={showNewPass ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              placeholder="Min. 6 characters"
                              className="bg-muted/30 focus-visible:bg-transparent pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPass(!showNewPass)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              {showNewPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="confirm-pass" className="text-xs font-bold text-muted-foreground">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              id="confirm-pass"
                              type={showConfirmPass ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              placeholder="Confirm new password"
                              className="bg-muted/30 focus-visible:bg-transparent pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPass(!showConfirmPass)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              {showConfirmPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <div className="border-t border-border/40 p-4 bg-muted/20 flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={passLoading}
                      className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs gap-1.5 cursor-pointer min-w-[140px]"
                    >
                      {passLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Update Password</span>
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </form>
            </TabsContent>

            {/* Session & Permissions Tab */}
            <TabsContent value="session" className="space-y-6 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Active Session Info */}
                <Card className="bg-card border border-border rounded-xl">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-primary" />
                      Active Session Metadata
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Technical diagnostics about your current logged-in console session.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-5 text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-primary" /> IP Address</span>
                      <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground font-semibold">{sessionMeta?.ip || "127.0.0.1"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Laptop className="w-3.5 h-3.5 text-primary" /> Operating System</span>
                      <span className="font-semibold text-foreground">{parsedUA.os}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Fingerprint className="w-3.5 h-3.5 text-primary" /> Web Browser</span>
                      <span className="font-semibold text-foreground">{parsedUA.browser}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="text-muted-foreground flex items-center gap-1.5"><LockKeyhole className="w-3.5 h-3.5 text-primary" /> Auth Protocol</span>
                      <span className="font-semibold text-foreground">NextAuth (JWT Token)</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> Session Lifespan</span>
                      <span className="font-semibold text-foreground">24 Hours (Rolling)</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Role Permissions Checklists */}
                <Card className="bg-card border border-border rounded-xl">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-primary" />
                      Role Authorization Scope
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Permissions associated with your user tier (<span className="capitalize font-bold text-primary">{rawUser?.role || "Admin"}</span>).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <ul className="space-y-3.5 text-xs">
                      {rolePermissions.map((perm, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-foreground">{perm.title}</span>
                            <p className="text-[10px] text-muted-foreground">{perm.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}
