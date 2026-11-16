import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";

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
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle light or dark mode">
            <Moon className="dark:hidden" />
            <Sun className="hidden dark:block" />
          </Button>
        </div>
      </div>
    </header>
  );
}
