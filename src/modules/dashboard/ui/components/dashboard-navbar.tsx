"use client";

import { PanelLeftClose, PanelLeftIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { DashboardCommand } from "./dashboard-command";

export const DashboardNavbar = () => {
    const { state, toggleSidebar, isMobile } = useSidebar();
    const [commandOpen, setCommandOpen] = useState(false);

    // Keyboard shortcut ⌘K / Ctrl+K
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
            e.preventDefault();
            setCommandOpen((prev) => !prev);
        }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    return (
        <>
            <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />
            <nav className="sticky top-0 z-30 h-14 border-b bg-background/80 backdrop-md">
                <div className="grid  grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-2">
                    {/* LEFT: Sidebar toggle */}
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={toggleSidebar}
                        aria-label="Toggle sidebar"
                    >
                        {(state === "collapsed" || isMobile) ? (
                            <PanelLeftIcon className="size-4" />
                        ) : (
                            <PanelLeftClose className="size-4" />
                        )}
                    </Button>

                    {/* CENTER: Search / Command */}
                    <Button
                        onClick={() => setCommandOpen((open) => !open)}
                        className="
                            flex h-9 w-full max-w-xl items-center gap-2 
                            rounded-md border bg-muted/40 px-3 text-sm 
                            text-muted-foreground transition-colors 
                            hover:bg-muted"
                    >
                        <SearchIcon className="size-4"/>
                        <span className="truncate">Rechercher…</span>
                        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                            <span className="text-xs">&#8984;</span>K
                        </kbd>
                    </Button>

                    {/* RIGHT: Reserved for future (notifications, user menu) */}
                    <div className="flex items-center gap-2">
                        {/* volontairement vide pour extensibilité */}
                    </div>
                </div>
            </nav>
        </>
    );
};