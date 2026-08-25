"use client";

import * as React from "react";
import { Check, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { themePresets } from "@/lib/site";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  applyThemePreset,
  getStoredThemePreset,
  storeThemePreset,
} from "@/features/nav/lib/theme-preset";

export function ModeToggle() {
  const { setTheme } = useTheme();
  const [preset, setPreset] = React.useState("default");

  // Sync from localStorage after mount (avoids hydration mismatch).
  React.useEffect(() => {
    setPreset(getStoredThemePreset());
  }, []);

  const selectPreset = (id: string) => {
    applyThemePreset(id);
    storeThemePreset(id);
    setPreset(id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          <span className="flex items-center gap-2">
            <Palette className="h-3.5 w-3.5" aria-hidden />
            Theme preset
          </span>
        </DropdownMenuLabel>
        {themePresets.map((t) => (
          <DropdownMenuItem key={t.id} onClick={() => selectPreset(t.id)}>
            <span
              aria-hidden
              className="flex h-4 w-7 shrink-0 overflow-hidden rounded-sm border border-border"
            >
              <span className="h-full flex-1" style={{ background: t.swatch[0] }} />
              <span className="h-full flex-1" style={{ background: t.swatch[1] }} />
            </span>
            <span className="flex-1">{t.label}</span>
            {preset === t.id ? (
              <Check className="h-4 w-4 text-primary" aria-hidden />
            ) : null}
            <span className="sr-only">
              {preset === t.id ? "(selected)" : ""}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
