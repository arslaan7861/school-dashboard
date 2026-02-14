import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-muted/40 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Secure access to your dashboard
          </p>
        </div>

        {/* Auth Card */}

        {children}

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </p>
      </div>
    </div>
  );
}
