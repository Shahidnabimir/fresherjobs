import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Moon, Sun } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";

import { ProfileDialog } from "./profile-dialog";

const navLink =
  "rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-muted data-[status=active]:text-foreground";

export function SiteHeader() {
  const { tracker, toggleTheme } = useAppState();
  const count = Object.keys(tracker).length;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link to="/" className="mr-2 flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
            F
          </span>
          <span className="font-display text-[17px] font-semibold tracking-tight text-foreground">
            Fresher<span className="relative">Only<span className="absolute -right-2 top-1 size-1.5 rounded-full bg-fresh" /></span>
          </span>
        </Link>

        <nav className="ml-2 flex items-center gap-1 sm:ml-4">
          <Link to="/" className={navLink} activeOptions={{ exact: true }}>
            Jobs
          </Link>
          <Link to="/tracker" className={navLink}>
            Tracker
            {count > 0 && (
              <span className="ml-1.5 rounded-full bg-fresh px-1.5 py-px font-mono text-[10px] text-fresh-foreground">
                {count}
              </span>
            )}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ProfileDialog />
          <AccountButton />
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle light or dark mode">
            <Moon className="dark:hidden" />
            <Sun className="hidden dark:block" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function AccountButton() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (loading) return <span className="w-16" aria-hidden="true" />;
  if (!user) {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link to="/auth" search={{ redirect: undefined }}>Sign in</Link>
      </Button>
    );
  }

  const label = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Account";
  const initial = label.trim().charAt(0).toUpperCase() || "?";

  async function signOut() {
    await queryClient.cancelQueries();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Account menu">
          <span className="grid size-7 place-items-center rounded-full bg-fresh font-mono text-xs font-medium text-fresh-foreground">
            {initial}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
