"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export default function UnauthorizedPage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial from-slate-900 to-slate-950 p-4 text-white">
      <div className="relative w-full max-w-md p-8 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl text-center overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-destructive/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />

        {/* Icon & Glow */}
        <div className="mx-auto w-20 h-20 relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full bg-destructive/10 animate-ping opacity-75" />
          <div className="relative rounded-full bg-destructive/20 border border-destructive/30 p-4 text-destructive-foreground">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-white via-slate-100 to-red-400 bg-clip-text text-transparent">
          Access Denied
        </h1>
        <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
          You do not have the required permissions to view this dashboard. If you believe this is an error, please contact your administrator.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => router.replace("/")}
            variant="outline"
            className="w-full border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Home
          </Button>

          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log in with another account
          </Button>
        </div>
      </div>
    </div>
  );
}
